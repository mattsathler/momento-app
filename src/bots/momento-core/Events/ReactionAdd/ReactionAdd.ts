import { Message, MessageReaction, User } from "discord.js";
import { IContext } from "../../Interfaces/IContext";
import { reactionList } from "../../Commands/CommandLists";
import { ICommand } from "../../Interfaces/ICommand";
import { tryDeleteMessage } from "../../Utils/Messages";
import { User as MomentoUser } from "src/shared/models/User";

export async function reactionAdd(ctx: IContext, reaction: MessageReaction, user: User ) {
    if (!reaction.message.guildId) { return }
    
    const reactUser = await ctx.mongoService.getOne('users', {
        userId: user.id,
        guildId: reaction.message.guildId
    }) as MomentoUser || null;
    if (!reactUser) { return; }
    
    if(!reaction.emoji.name) { return; }
        
    const reactionInteractionList = reactionList;
    const cmd: ICommand = reactionInteractionList[reaction.emoji.name]
    const message = reaction.message as Message;
    
    if (cmd) {
        let replyText: string;
        if (cmd.isProfileCommand) {
            if (message.channelId !== reactUser.references.channelId) {
                throw new Error('Você não pode executar comandos de perfil em outros canais!');
            }
        }
        try {
            await cmd.exec(ctx, message, user);
            replyText = cmd.success ?? '**Comando executado com sucesso!**';
        }
        catch (err: any) {
            try {
                replyText = cmd.error ?? '**Erro ao executar o comando -** ' + err.message;
                message.reactions.cache.get(reaction.emoji.name)?.users.remove(user.id);
                if (message) {
                    const reply = await message.reply(replyText);
                    setTimeout(()=> {
                        tryDeleteMessage(reply);
                    }, 5000)
                }
            }
            catch {
                console.log(err)
            }
        }
    }

    return
}