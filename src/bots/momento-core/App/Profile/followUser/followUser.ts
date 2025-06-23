import { ICommand } from "../../../Interfaces/ICommand";
import { Permission } from "../../../Interfaces/IPermission";
import { IContext } from "../../../Interfaces/IContext";
import { NotificationService } from "../../../../../shared/services/NotificationService";
import { NotificationType } from "../../../Interfaces/INotification";
import { ProfileServices } from "../../../Utils/ProfileServices";
import { User as MomentoUser } from "src/shared/models/User";
import { Message, User } from "discord.js";
import { LinkService } from "src/shared/services/LinkService";

export const followUser: ICommand = {
    permission: Permission.user,
    isProfileCommand: false,
    exec: execFollowUser
}

async function execFollowUser(ctx: IContext, message: Message, author: User): Promise<void> {
    if (!message.guildId) { return }
    
    const userFollowing = await ctx.mongoService.getOne('users', {
        userId: author.id,
        guildId: message.guildId
    }) as MomentoUser;
    const userFollowed = await ctx.mongoService.getOne('users', {
        'references.channelId': message.channelId,
        guildId: message.guildId
    }) as MomentoUser;

    if (!userFollowing || !userFollowed) { throw new Error('Invalid user') };
    if (userFollowing.userId === userFollowed.userId) { throw new Error('Você não pode seguir a si mesmo!') }

    const authorImageUrl: string | undefined = await LinkService.readImageOfMomento(ctx.uploadChannel, userFollowing.imagesUrl.profilePicture);
    if (!authorImageUrl) { throw new Error('Erro ao carregar imagem de perfil') }

    userFollowed.stats.followers++;
    const notificationService = new NotificationService(ctx);
    await notificationService.sendNotification(userFollowed, {
        type: NotificationType.Embed,
        message: `@${userFollowing.username} começou a te seguir!`,
        targetUser: userFollowed,
        authorUsername: `@${userFollowing.username}`,
        pictureUrl: authorImageUrl,
        link: `https://discord.com/channels/${userFollowing.guildId}/${userFollowing.references.channelId}`
    })

    await ctx.mongoService.patch('users', {
        userId: userFollowed.userId,
        guildId: userFollowed.guildId
    }, userFollowed);
    const profileService = new ProfileServices();
    await profileService.updateProfilePictures(ctx, userFollowed, true, false);
}