import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, Message, MessageType, TextChannel, ThreadAutoArchiveDuration, ThreadChannel } from "discord.js";
import { IContext } from "src/bots/momento-core/Interfaces/IContext";
import { INotification } from "src/bots/momento-core/Interfaces/INotification";
import { User } from "../models/user";
import { getSecureToken } from "./TokenService";
import { AxiosService } from "./AxiosService";
import { ProfileServices } from "src/bots/momento-core/Utils/ProfileServices";
import { tryDeleteMessage } from "src/bots/momento-core/Utils/Messages";
export class NotificationService {
    ctx: IContext;

    constructor(ctx: IContext) {
        this.ctx = ctx;
    }

    public async sendNotification(user: User, notification: INotification, force: boolean = false): Promise<void> {
        if (!user.stats.notifications && !force) return;

        const body = {
            content: null,
            embeds: [
                {
                    color: 14492795,
                    fields: [
                        {
                            "name": "guild_id",
                            "value": user.guildId
                        },
                        {
                            "name": "author_username",
                            "value": notification.authorUsername ?? 'MOMENTO',
                        },
                        {
                            "name": "author_icon_url",
                            "value": notification.pictureUrl || "https://imgur.com/fZdmjLn.png"
                        },
                        {
                            "name": "target_profile_channel_id",
                            "value": notification.targetUser.references.channelId
                        },
                        {
                            "name": "target_user_id",
                            "value": notification.targetUser.userId
                        },
                        {
                            "name": "type",
                            "value": "embed"
                        },
                        {
                            "name": "sent_from",
                            "value": "momento_bot"
                        },
                        {
                            "name": "token",
                            "value": getSecureToken(process.env.SECRET_TOKEN || "")
                        }
                    ]
                }
            ],
            attachments: [],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            style: 2,
                            type: 2,
                            emoji: {
                                name: "🗑️"
                            },
                            custom_id: "deleteMessage",
                        }]
                }]
        }

        if (notification.image) {
            body.embeds[0].fields.push({
                "name": "image_url",
                "value": notification.image
            });
        }

        if (notification.link) {
            body.embeds[0].fields.push({
                "name": "url",
                "value": notification.link
            });
        }

        if (notification.message) {
            body.embeds[0].fields.push({
                "name": "message",
                "value": notification.message
            });
        }

        if (notification.thumbnail) {
            body.embeds[0].fields.push({
                "name": "thumbnail_url",
                "value": notification.thumbnail
            });
        }

        const axiosService = new AxiosService();
        await axiosService.postWebhook(process.env.NOTIFICATION_WEBHOOK || "", body);
        return;
    }

    public async sendEmbedNotification(targetUser: User, embed: EmbedBuilder, force: boolean = false, actionRows?: ActionRowBuilder<any>[]): Promise<void> {
        if (!targetUser.guildId) { throw new Error('Invalid guild id') }
        const guild = await this.ctx.client.guilds.fetch(targetUser.guildId) as Guild;
        if (!guild) { throw new Error('Invalid guild') }

        const targetNotificationChannel = await this.getNotificationChannel(targetUser, guild) as ThreadChannel;
        if (!targetNotificationChannel) { throw new Error('Invalid profile channel') }

        if (!force && !targetUser.stats.notifications) return;
        const deleteButton = new ButtonBuilder()
            .setCustomId('deleteMessage')
            .setLabel('🗑️')
            .setStyle(ButtonStyle.Secondary);
        const AR = new ActionRowBuilder<ButtonBuilder>().addComponents(deleteButton);


        const notificationMsg = await targetNotificationChannel.send({ embeds: [embed], components: actionRows || [AR] });
        if (actionRows) { await notificationMsg.edit({ components: actionRows }) }

        const profileService = new ProfileServices();
        await profileService.pingUser(targetUser.userId, targetNotificationChannel)
    }

    public async getNotificationChannel(targetUser: User, guild: Guild): Promise<ThreadChannel> {
        const activeThreads = await guild.channels.fetchActiveThreads();
        const notificationChannel = activeThreads.threads.filter(thread => thread.id === targetUser.references.notificationId).first() as ThreadChannel;
        if (!notificationChannel || !targetUser.references.notificationId) {
            const newNotificationChannel = await this.createNotificationChannel(guild, targetUser) as ThreadChannel;
            return newNotificationChannel;
        }
        return notificationChannel;
    }

    public async createNotificationChannel(guild: Guild, targetUser: User) {
        if (!targetUser.references.channelId) { throw new Error('Invalid channel id') }
        try {
            const userChannel = await guild.channels.fetch(targetUser.references.channelId) as TextChannel;
            const notificationChannel = await userChannel.threads.create({
                name: 'Notificações',
                autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
                reason: 'Suas notificações!'
            })
            if (!notificationChannel) { throw new Error('Invalid notification channel') }
            const tempMsg = userChannel.messages.cache.filter(message => message.type === MessageType.ThreadCreated).first() as Message
            if (tempMsg) {
                tryDeleteMessage(tempMsg);
            }
            await this.ctx.mongoService.patch('users', { userId: targetUser.userId, guildId: targetUser.guildId }, { 'references.notificationId': notificationChannel.id })
            return notificationChannel;
        }
        catch (err) {
            console.log(err)
            return null;
            // throw new Error('Invalid notification channel')
        }
    }
}