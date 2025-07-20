import { Message } from "discord.js";
import { ICommand } from "../../../Interfaces/ICommand";
import { IContext } from "../../../Interfaces/IContext";
import { Permission } from "../../../Interfaces/IPermission";
import { IPost } from "../../../Interfaces/IPost";
import { MomentoService } from "src/shared/services/MomentoService";
import { User } from "src/shared/models/user";
import { ProfileServices } from "src/bots/momento-core/Utils/ProfileServices";

export const reloadUsers: ICommand
    = {
    reply: 'Recarregando usuário!',
    success: 'Usuário recarregado com sucesso!',
    permission: Permission.developer,
    isProfileCommand: false,
    deleteMessage: true,
    deleteReply: true,

    exec: async function (ctx: IContext, message: Message): Promise<void> {
        const split = message.content.trim().split(/\s+/); // separa por espaço
        const userId = split[1];
        const profiles = await ctx.mongoService.get("users", { 'userId': userId }) as User[];
        const profileService: ProfileServices = new ProfileServices();
        profiles.forEach(async profile => {
            console.log("Updating user", profile.username);
            await profileService.updateProfilePictures(ctx, profile, true, true);
        })

        return;
    }
}
