import { Message } from "discord.js";
import { IContext } from "../../Interfaces/IContext";
import { IPost } from "../../Interfaces/IPost";

export class MessageCreateService {
    public isCommand(message: Message): boolean {
        return message.content.charAt(0) == '?' ? true : false
    }
    
    public getCommand(message: Message): string {
        return message.content.slice(1).trim().split(/ +/g).shift() ?? ''.toLowerCase();
    }

    public async isComment(ctx: IContext, message: Message): Promise<boolean> {
        const postMessage = await ctx.mongoService.getOne('posts', {
            'references.messageId': message.channelId,
            'references.guildId': message.guildId
        }) as IPost | null;

        if(!postMessage) { return false; }

        return true;
    }
}