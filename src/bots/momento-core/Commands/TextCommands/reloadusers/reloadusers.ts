import { Message } from "discord.js";
import { ICommand } from "../../../Interfaces/ICommand";
import { IContext } from "../../../Interfaces/IContext";
import { Permission } from "../../../Interfaces/IPermission";
import { IPost } from "../../../Interfaces/IPost";
import { MomentoService } from "src/shared/services/MomentoService";
import { User } from "src/shared/models/user";

export const reloadUsers: ICommand
    = {
    reply: 'Recarregando usuário!',
    success: 'Usuário recarregado com sucesso!',
    permission: Permission.developer,
    isProfileCommand: false,
    deleteMessage: true,
    deleteReply: true,

    exec: async function (ctx: IContext, message: Message): Promise<void> {
        const userId = message.content[2];
        const profiles = await ctx.mongoService.get("users", { userId: userId }) as User[];

        const uploadChannel = await MomentoService.getUploadChannel(ctx.client);
        profiles.forEach(async profile => {
            await MomentoService.requestUpdateProfile(profile);
        })

        return;
    }
}
