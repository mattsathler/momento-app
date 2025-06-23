import { Message, MessageReaction, User } from "discord.js";
import { IContext } from "../../Interfaces/IContext";
import { reactionRemoveList } from "../../Commands/CommandLists";
import { ICommand } from "../../Interfaces/ICommand";
import { User as MomentoUser } from "src/shared/models/User";

export async function reactionRemove(ctx: IContext, reaction: MessageReaction, user: User) {
    if (!reaction.message.guildId) { return }
    if (user.bot) { return }

    const reactUser = await ctx.mongoService.getOne('users', {
        userId: user.id,
        guildId: reaction.message.guildId
    }) as MomentoUser || null;
    if (!reactUser) { return; }

    if (!reaction.emoji.name) { return; }

    const reactionInteractionRemoveList = reactionRemoveList;
    const cmd: ICommand = reactionInteractionRemoveList[reaction.emoji.name]
    const message = reaction.message as Message;

    if (cmd) {
        let replyText: string;
        try {
            if (cmd.isProfileCommand) {
                if (message.channelId !== reactUser.references.channelId) {
                    message.reactions.cache.get(reaction.emoji.name)?.users.remove(user.id);
                    throw new Error('Você não pode executar comandos de perfil em outros canais!');
                }
            }
            await cmd.exec(ctx, message, user);
            replyText = cmd.success ?? '**Comando executado com sucesso!**';
        }
        catch (err: any) {
            replyText = cmd.error ?? '**Erro ao executar o comando -** ' + err.message;
        }
    }

    return
}