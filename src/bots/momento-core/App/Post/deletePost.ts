import { ButtonInteraction, Message, TextChannel, ThreadChannel } from "discord.js";
import { ICommand } from "../../Interfaces/ICommand";
import { IContext } from "../../Interfaces/IContext";
import { Permission } from "../../Interfaces/IPermission";
import { tryDeleteMessage } from "../../Utils/Messages";
import { ProfileServices } from "../../Utils/ProfileServices";
import { IPost, IPostStatus } from "../../Interfaces/IPost";
import { PostService } from "./PostService";
import { User } from "src/shared/models/User";

export const deletePost: ICommand = {
    permission: Permission.user,
    isProfileCommand: true,
    success: 'Momento deletado com sucesso!',
    exec: confirmDeletePost
}

async function confirmDeletePost(ctx: IContext, interaction: ButtonInteraction) {
    try {
        console.log('Removing post of', interaction.message.channelId);
        const postMessage = await interaction.channel?.messages.fetch(interaction.message.reference?.messageId as string) as Message;
        const channel = await ctx.client.channels.fetch(interaction.channelId) as TextChannel;
        const confirmMessage = await channel.messages.fetch(interaction.message.id as string) as Message;
        await ctx.mongoService.patch('posts', { 'references.messageId': postMessage.id, 'references.guildId': postMessage.guildId }, { 'stats.status': 'deleted' })
        const user = await ctx.mongoService.getOne('users', { userId: interaction.user.id, guildId: interaction.guildId }) as User;
        const postCommentThread = await getPostCommentThread(channel, postMessage);
        if (postCommentThread) {
            try {
                await postCommentThread.delete();
            }
            catch { }
        }
        try {
            await tryDeleteMessage(confirmMessage);
            await tryDeleteMessage(postMessage);
            await interaction.deferUpdate();
        }
        catch { }

        const postService = new PostService(ctx);
        const profileService = new ProfileServices();

        const post = await ctx.mongoService.getOne('posts', { 'references.messageId': postMessage.id, 'references.guildId': postMessage.guildId });

        await profileService.updateProfilePictures(ctx, user, true, false);
        await postService.addPostToAnalytics(post, "remove");

        return
    }
    catch (error: any) {
        throw new Error(error);
    }
}

export async function getPostCommentThread(channel: TextChannel, postMessage: Message) {
    const activeThreads = await channel.threads.fetchActive();
    const postCommentThread = activeThreads.threads.filter(thread => thread.id === postMessage.id).first() as ThreadChannel;
    return postCommentThread
}