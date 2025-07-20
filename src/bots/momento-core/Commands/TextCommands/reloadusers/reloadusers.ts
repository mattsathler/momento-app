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
        const profileService: ProfileServices = new ProfileServices();
        const userId = split[1];

        if (userId) {
            const profiles = await ctx.mongoService.get("users", { 'userId': userId }) as User[];
            profiles.forEach(async profile => {
                console.log("Updating user", profile.username);
                await profileService.updateProfilePictures(ctx, profile, true, true);
            })
        }
        else {
            const profile = await ctx.mongoService.getOne("users", { 'references.channelId': message.channelId }) as User;
            await profileService.updateProfilePictures(ctx, profile, true, true);
        }

        return;
    }
}
