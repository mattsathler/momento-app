import { Embed, EmbedBuilder, Guild, Message, MessageType, TextChannel, ThreadAutoArchiveDuration, ThreadChannel } from "discord.js";
import { MomentoNotification } from "../models/MomentoNotification";

export class NotificationService {
    constructor() { }

    public async sendNotification(notification: EmbedBuilder, channel: ThreadChannel, targetUserId: string): Promise<void> {
        await channel.send({
            embeds: [notification],
        });

        this.pingUser(targetUserId, channel);
    }

    public createEmbedNotification(notification: MomentoNotification): EmbedBuilder {
        const embed = new EmbedBuilder();

        embed.setColor(0xDD247B);
        embed.setTimestamp(notification.timestamp);
        if (notification.title) {
            embed.setTitle(notification.title || "");
        }
        if (notification.message) {
            embed.setDescription(notification.message);
        }
        if (notification.image_url) {
            embed.setImage(notification.image_url || "");
        }
        if (notification.url) {
            embed.addFields({
                name: ' ', value: `[Confira](${notification.url}})`
            })
        }
        if (notification.thumbnail_url) {
            embed.setThumbnail(notification.thumbnail_url || "");
        }

        embed.setAuthor({
            name: notification.author?.author_username,
            iconURL: notification.author?.icon_url,
        });


        return embed;
    }

    public createNotificationObject(embed: Embed): MomentoNotification {
        const fields = embed.fields;

        return {
            guildId: fields.find((f) => f.name === "guild_id")?.value || "",
            target: {
                profile_channel_id: fields.find((f) => f.name === "target_profile_channel_id")?.value || "",
                user_id: fields.find((f) => f.name === "target_user_id")?.value || "",
            },
            type: fields.find((f) => f.name === "type")?.value || "",
            title: fields.find((f) => f.name === "title")?.value || "",
            message: fields.find((f) => f.name === "message")?.value || "",
            sent_from: fields.find((f) => f.name === "sent_from")?.value || "",
            timestamp: new Date(),
            author: {
                author_username: fields.find((f) => f.name === "author_username")?.value || "momento",
                icon_url: fields.find((f) => f.name === "author_icon_url")?.value || "https://i.imgur.com/as03K0u.png",
            },
            image_url: fields.find((f) => f.name === "image_url")?.value || "",
            url: fields.find((f) => f.name === "url")?.value || "",
            thumbnail_url: fields.find((f) => f.name === "thumbnail_url")?.value || "",
        };
    }

    public async getNotificationChannel(userChannelId: string, guild: Guild): Promise<ThreadChannel> {
        const userChannel = await guild.channels.fetch(userChannelId) as TextChannel;
        const activeThreads = await userChannel.threads.fetchActive();
        const notificationChannel = activeThreads.threads.filter(thread => thread.name === "Notificações").first() as ThreadChannel;
        if (!notificationChannel) {
            const newNotificationChannel = await this.createNotificationChannel(guild, userChannelId) as ThreadChannel;
            return newNotificationChannel;
        }
        return notificationChannel;
    }

    public async createNotificationChannel(guild: Guild, userChannelId: string): Promise<ThreadChannel | null> {
        try {
            const userChannel = await guild.channels.fetch(userChannelId) as TextChannel;
            const notificationChannel = await userChannel.threads.create({
                name: 'Notificações',
                autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
                reason: 'Suas notificações!'
            })
            if (!notificationChannel) { throw new Error('Invalid notification channel') }
            const tempMsg = userChannel.messages.cache.filter(message => message.type === MessageType.ThreadCreated).first() as Message;
            if (tempMsg) {
                try {
                    await tempMsg.delete();
                }
                catch (err) {
                    console.log('Error deleting temp message', err)
                };
            }
            return notificationChannel;
        }
        catch (err) {
            return null;
        }
    }

    public pingUser(userId: string, channel: ThreadChannel): Promise<void> {
        return new Promise((resolve, reject) => {
            channel.send(`<@${userId}>`)
                .then((msg: Message) => {
                    msg.delete().then(() => {
                        resolve()
                    }).catch((error) => {
                        console.error("Error deleting ping message:", error);
                        reject(error);
                    });
                })
                .catch((error) => reject(error));
        });
    }
}