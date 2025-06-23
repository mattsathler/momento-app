import { Message, TextChannel, ButtonInteraction, ThreadChannel } from "discord.js";
import { ICommand } from "../../Interfaces/ICommand";
import { Permission } from "../../Interfaces/IPermission";
import { IContext } from "../../Interfaces/IContext";
import { tryDeleteMessage } from "../../Utils/Messages";

export const silencePost: ICommand = {
    permission: Permission.user,
    isProfileCommand: true,
    reply: 'Silenciando seu momento',
    success: 'Momento silenciado com sucesso!',
    exec: async (ctx: IContext, interaction: ButtonInteraction) => {
        const postMessage = await interaction.channel?.messages.fetch(interaction.message.reference?.messageId as string) as Message;
        const channel = await ctx.client.channels.fetch(interaction.channelId) as TextChannel;
        const confirmMessage = await channel.messages.fetch(interaction.message.id as string) as Message;

        const postCommentThread = await getPostCommentThread(channel, postMessage);
        if (postCommentThread) {
            try {
                await postCommentThread.delete();
            }
            catch { }
        }
        await tryDeleteMessage(confirmMessage);
        return;
    }
}

async function getPostCommentThread(channel: TextChannel, postMessage: Message) {
    const activeThreads = await channel.threads.fetchActive();
    const postCommentThread = activeThreads.threads.filter(thread => thread.id === postMessage.id).first() as ThreadChannel;
    return postCommentThread
}