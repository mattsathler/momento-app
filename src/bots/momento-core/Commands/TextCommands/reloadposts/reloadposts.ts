import { Message } from "discord.js";
import { ICommand } from "../../../Interfaces/ICommand";
import { IContext } from "../../../Interfaces/IContext";
import { Permission } from "../../../Interfaces/IPermission";
import { IPost } from "../../../Interfaces/IPost";

export const reloadPosts: ICommand
 = {
    reply: 'Recarregando posts!',
    success: 'Posts recarregados com sucesso!',
    permission: Permission.developer,
    isProfileCommand: false,
    deleteMessage: true,
    deleteReply: true,

    exec: async function (ctx: IContext, message: Message): Promise<void> {
        const activePosts = await ctx.mongoService.get('posts', { isActive: true }) as IPost[];
        ctx.activePostList = activePosts;

        return;
    }
}
