import { Client, Message, TextChannel } from "discord.js";
import { NotificationService } from "../../services/NotificationService";
import { MomentoNotification } from "../../models/MomentoNotification";
import { NotificationsQueue } from "../queues/NotificationsQueue";
import { HandlerContext } from "../../../../shared/handlers/handlerContext";
import { handleMessage } from "../../../../shared/handlers/messageHandler";
import { ensureEmbed } from "../../../../shared/middlewares/ensureEmbed";
import { validateToken } from "../../../../shared/middlewares/validateToken";
import { MongoService } from "../../../../shared/services/mongoService";

export async function onMessageCreate(client: Client, message: Message, mongoService: MongoService, queue: NotificationsQueue): Promise<void> {
    const requiredFields = [
        "guild_id",
        "target_user_id",
        "target_profile_channel_id",
        "type",
        "sent_from",
    ];

    const middlewares = [
        ensureEmbed(requiredFields),
        validateToken

    ];

    handleMessage(client, message, middlewares, async (client: Client, message: Message, context?: HandlerContext) => {
        try {
            const mongo = context?.services?.mongo;
            if (!mongo) throw new Error("MongoService não disponível no contexto");

            const embed = message.embeds[0];
            const notificationService = new NotificationService();
            const notification: MomentoNotification = notificationService.createNotificationObject(embed);
            const embedNotification = notificationService.createEmbedNotification(notification);
            const guild = await client.guilds.fetch(notification.guildId);
            const notificationChannel = await notificationService.getNotificationChannel(notification.target.profile_channel_id, guild!);
            queue.enqueue({
                client: client,
                message: message,
                mongo: mongo,
                request: {
                    notification: embedNotification,
                    channel: notificationChannel,
                    targetUserId: notification.target.user_id
                }
            })
        } catch (error: any) {
            throw new Error(error.message);
        }
    }, {
        message: "Não foi possível enviar a notificação",
        code: 500
    }, {
        services: {
            mongo: mongoService
        }
    });
}
