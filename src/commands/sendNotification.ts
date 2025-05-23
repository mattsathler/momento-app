import { Client, Message, TextChannel } from "discord.js";
import { MomentoNotification } from "../models/momentoNotification";
import { NotificationService } from "../services/notificationService";

export async function sendNotification(client: Client, message: Message): Promise<void> {
    const embed = message.embeds[0];
    const notificationService = new NotificationService();

    const notification: MomentoNotification = notificationService.createNotificationObject(embed);
    const embedNotification = notificationService.createEmbedNotification(notification);

    try {
        const guild = await client.guilds.fetch(notification.guildId);
        const notificationChannel = await notificationService.getNotificationChannel(notification.target.profile_channel_id, guild!);
        notificationService.sendNotification(embedNotification, notificationChannel, notification.target.user_id);
    } catch (error: any) {
        throw new Error(error.message);
    }
}
