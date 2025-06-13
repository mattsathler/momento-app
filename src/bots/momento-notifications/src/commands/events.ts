import { Client, Message, TextChannel } from "discord.js";
import { NotificationService } from "../../services/NotificationService";
import { MomentoNotification } from "../../models/MomentoNotification";
import { NotificationsQueue } from "../queues/NotificationsQueue";
import { HandlerContext } from "../../../../shared/handlers/handlerContext";
import { handleMessage } from "../../../../shared/handlers/messageHandler";
import { ensureEmbed } from "../../../../shared/middlewares/ensureEmbed";
import { validateToken } from "../../../../shared/middlewares/validateToken";
import { MongoService } from "../../../../shared/services/mongoService";
import { errorHandler } from "../../../../shared/handlers/errorHandler";

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
            const notificationChannel = await notificationService.getNotificationChannel(notification.target.profile_channel_id, guild!, mongo);
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

export async function onReady(client: Client) {
    const channel = await client.channels.fetch(process.env.NOTIFICATION_WEBHOOK_CHANNEL_ID!) as TextChannel;
    const messages = await channel.messages.fetch({ limit: 100 });

    const pending = messages.filter(m =>
        m.embeds.length > 0 &&
        !m.reactions.cache.has("✅") &&
        !m.reactions.cache.has("❌")
    );

    for (const message of pending.values()) {
        try {
            await message.react("❌");
            channel.send({
                embeds: message.embeds
            });
        } catch (err: any) {
            await message.react("❌");
            await message.startThread({
                name: err.message,
                autoArchiveDuration: 60,
                reason: err.message,
            }).then((thread) => {
                thread.send({
                    embeds: [errorHandler({
                        code: err.code,
                        message: err.message,
                    })]
                });
            }).catch(console.error);
        }
    }
}