import { ComponentType, Guild, GuildMember, Message, MessageReaction, ModalSubmitInteraction, TextChannel, User, } from "discord.js";
import { ICommand } from "../../../Interfaces/ICommand";
import { Permission } from "../../../Interfaces/IPermission";
import { IContext } from "../../../Interfaces/IContext";
import { ProfileServices } from "../../../Utils/ProfileServices";
import { User as MomentoUser } from "src/shared/models/User";

export const unfollowUser: ICommand = {
    permission: Permission.user,
    isProfileCommand: false,
    exec: execUnfollowUser
}

async function execUnfollowUser(ctx: IContext, message: Message, author: User): Promise<void> {
    if (!message.guildId) { return }

    const userUnfollowing = await ctx.mongoService.getOne('users', {
        userId: author.id,
        guildId: message.guildId
    }) as MomentoUser;
    const userUnfollowed = await ctx.mongoService.getOne('users', {
        'references.channelId': message.channelId,
        guildId: message.guildId
    }) as MomentoUser;

    if (!userUnfollowing || !userUnfollowed) { throw new Error('Invalid user') };
    if (userUnfollowing.userId === userUnfollowed.userId) { throw new Error('Você não pode deixar de seguir a si mesmo!') }

    userUnfollowed.stats.followers--;

    await ctx.mongoService.patch('users', {
        userId: userUnfollowed.userId,
        guildId: userUnfollowed.guildId
    }, userUnfollowed);

    const profileService = new ProfileServices();
    await profileService.updateProfilePictures(ctx, userUnfollowed, true, false);
}