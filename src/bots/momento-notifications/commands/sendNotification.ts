import { Client, Message, TextChannel } from "discord.js";
import { NotificationService } from "../services/notificationService";
import { MomentoNotification } from "../models/MomentoNotification";

export async function sendNotification(client: Client, message: Message): Promise<void> {
    try {
        const embed = message.embeds[0];
        const notificationService = new NotificationService();

        const notification: MomentoNotification = notificationService.createNotificationObject(embed);
        const embedNotification = notificationService.createEmbedNotification(notification);

        const guild = await client.guilds.fetch(notification.guildId);
        const notificationChannel = await notificationService.getNotificationChannel(notification.target.profile_channel_id, guild!);
        notificationService.sendNotification(embedNotification, notificationChannel, notification.target.user_id);
    } catch (error: any) {
        throw new Error(error.message);
    }
}
