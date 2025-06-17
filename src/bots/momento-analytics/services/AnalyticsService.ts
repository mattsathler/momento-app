import { Client, Embed, Guild, Message, TextChannel, ThreadChannel } from "discord.js";
import { Post } from "../../../shared/models/Post";
import { MongoService } from "../../../shared/services/MongoService";
import { LinkService } from "../../../shared/services/LinkService";
import { Log } from "../../../shared/models/Log";
import { drawPostAnalytics } from "../../../shared/services/canvas/AnalyticsCanvas";
import { User } from "../../../shared/models/user";
import { AnalyticsQueue } from "../src/queues/AnalyticsQueue";
import { AxiosService } from "../../../shared/services/AxiosService";
import { getSecureToken } from "../../../shared/services/TokenService";
import { Theme } from "src/shared/models/theme";

export class AnalyticsService {
    private activePosts: Post[] = [];

    constructor() { }

    public addPost(post: Post): void {
        this.activePosts.push(post);
        return;
    }

    public removePost(post: Post) {
        this.activePosts = this.activePosts.filter((p) => !(p.references.guildId === post.references.guildId && p.references.messageId === post.references.messageId));
        return;
    }

    public async initAnalyticsCron(client: Client, mongoService: MongoService, queue: AnalyticsQueue, uploadChannel: TextChannel): Promise<void> {
        const cron = require('node-cron');
        console.log("Starting Cronjob...");
        cron.schedule('*/10 * * * * *', async () => {
            const now = new Date();

            //CHANGE TO 24HRS! = 86400000 =========================
            const timeoutTimestamp = new Date(now.getTime() - 86400000);
            //CHANGE TO 24HRS! = 86400000 =========================

            for (let post of this.activePosts) {
                const postDate = new Date(post.stats.date)
                const author = await mongoService.getOne('users', {
                    userId: post.references.ownerId,
                    guildId: post.references.guildId
                }) as User;

                if (postDate <= timeoutTimestamp) {
                    queue.enqueue({
                        client: client,
                        mongo: mongoService,
                        request: {
                            author: author,
                            post: post,
                            uploadChannel: uploadChannel
                        }
                    });
                }
            }
        });
    }

    public async analyticPost(client: Client, mongoService: MongoService, author: User, post: Post, uploadChannel: TextChannel): Promise<string | undefined> {
        try {
            if (!author.guildId) { throw new Error('Invalid guild') }
            const guild = await client.guilds.fetch(author.guildId) as Guild;
            if (!guild) { throw new Error('Invalid guild') }
            if (!post.references.messageId) { throw new Error('Invalid messageId') }

            let newFollowers = 0;
            const postFollowers = this.calculateNewFollowers(post, author);
            newFollowers += postFollowers;

            await mongoService.patch('posts', {
                'references.messageId': post.references.messageId,
                'references.channelId': post.references.channelId
            }, {
                'stats.status': 'inactive'
            })

            this.removePost(post);

            await mongoService.patch('users', {
                userId: author.userId,
                guildId: author.guildId
            }, {
                'stats.followers': author.stats.followers + newFollowers
            })

            const postAuthor = await mongoService.getOne('users', {
                userId: post.references.ownerId,
                guildId: post.references.guildId
            }) as User;

            if (!postAuthor) throw new Error('Invalid post author');
            if (!postAuthor.references.channelId) throw new Error('Invalid post author');
            if (!post.references.messageId) throw new Error('Invalid post message');

            const likesLogs = await mongoService.get('logs', {
                type: 'like',
                messageId: post.references.messageId,
            }) as Log[];

            const theme = await mongoService.getOne('themes', {
                name: postAuthor.styles.theme
            }) as Theme;

            const canvas = await drawPostAnalytics(uploadChannel, post, postAuthor, likesLogs, postFollowers, theme);
            const buffer = canvas.toBuffer('image/png');
            const link = await LinkService.uploadImageToMomento(uploadChannel, buffer);

            const userProfileChannel = await client.channels.fetch(postAuthor.references.channelId) as TextChannel;
            try {
                const postMessage = await userProfileChannel.messages.fetch(post.references.messageId) as Message;
                if (postMessage) {
                    const postCommentThread = await this.getPostCommentThread(userProfileChannel, postMessage);
                    if (postCommentThread) {
                        await postCommentThread.delete();
                    }
                    await postMessage.delete();
                }

                return link.url;
            }
            catch (error) {
                console.log(error);
                this.removePost(post);
            }
        }
        catch (err) {
            console.log(err)
            this.removePost(post);
            return;
        }
    }

    public async sendAnalyticsNotification(author: User, imageUrl: string): Promise<void> {
        const axiosService: AxiosService = new AxiosService();
        const notificationWebhook = process.env.NOTIFICATION_WEBHOOK as string;
        if (!notificationWebhook) throw new Error("Invalid Webhook URL");
        await axiosService.postWebhook(notificationWebhook, {
            "content": null,
            "embeds": [
                {
                    "color": 14492795,
                    "fields": [
                        {
                            "name": "guild_id",
                            "value": author.guildId
                        },
                        {
                            "name": "author_username",
                            "value": "MOMENTO"
                        },
                        {
                            "name": "author_icon_url",
                            "value": "https://imgur.com/fZdmjLn.png"
                        },
                        {
                            "name": "target_profile_channel_id",
                            "value": author.references.channelId
                        },
                        {
                            "name": "target_user_id",
                            "value": author.userId
                        },
                        {
                            "name": "type",
                            "value": "embed"
                        },
                        {
                            "name": "sent_from",
                            "value": "momento_analytics"
                        },
                        {
                            "name": "token",
                            "value": getSecureToken(process.env.SECRET_TOKEN || '')
                        },
                        {
                            "name": "image_url",
                            "value": imageUrl
                        },
                        {
                            "name": "message",
                            "value": "Confira o alcance do seu momento!"
                        },
                        {
                            "name": "thumbnail_url",
                            "value": "https://imgur.com/WSI7odl.png"
                        }
                    ]
                }
            ],
            "attachments": []
        })
    }

    public async requestUpdateProfile(author: User): Promise<void> {
        const axiosService: AxiosService = new AxiosService();
        const notificationWebhook = process.env.PROFILE_UPDATER_WEBHOOK as string;
        if (!notificationWebhook) throw new Error("Invalid Webhook URL");
        await axiosService.postWebhook(notificationWebhook, {
            "content": null,
            "embeds": [
                {
                    "color": 14492795,
                    "fields": [
                        {
                            "name": "guild_id",
                            "value": author.guildId
                        },
                        {
                            "name": "target_user_id",
                            "value": author.userId
                        },
                        {
                            "name": "update_profile",
                            "value": "true"
                        },
                        {
                            "name": "update_collage",
                            "value": false
                        },
                        {
                            "name": "sent_from",
                            "value": "momento_analytics"
                        },
                        {
                            "name": "token",
                            "value": getSecureToken(process.env.SECRET_TOKEN || '')
                        }
                    ]
                }
            ],
            "attachments": []
        })
    }

    private calculateNewFollowers(post: Post, author: User) {
        const randomMultiplier = Math.random() * 0.5 + 1;
        const constantFollowers = 100;
        let newFollowers = (post.stats.likes.length + constantFollowers * randomMultiplier) * author.stats.influencyLevel;
        newFollowers = post.stats.isTrending ? newFollowers * 2 : newFollowers;
        newFollowers = author.stats.isVerified ? newFollowers * 3 : newFollowers;
        newFollowers = post.content.imagesCount > 0 ? newFollowers * post.content.imagesCount : newFollowers;
        newFollowers = post.stats.isRepost ? newFollowers / 2 : newFollowers;

        return Math.floor(newFollowers);
    }


    private async getPostCommentThread(channel: TextChannel, postMessage: Message): Promise<ThreadChannel | null> {
        const activeThreads = await channel.threads.fetchActive();
        const postCommentThread = activeThreads.threads.filter(thread => thread.id === postMessage.id).first() as ThreadChannel;
        return postCommentThread
    }


    public createAnalyticsRegisterObject(embed: Embed): {
        guild_id: string,
        target_profile_channel_id: string,
        post_message_id: string,
        method: string,
        sent_from: string
    } {
        const fields = embed.fields;

        return {
            guild_id: fields.find((f) => f.name === "guild_id")?.value || "",
            target_profile_channel_id: fields.find((f) => f.name === "target_profile_channel_id")?.value || "",
            post_message_id: fields.find((f) => f.name === "post_message_id")?.value || "",
            method: fields.find((f) => f.name === "method")?.value || "add",
            sent_from: fields.find((f) => f.name === "sent_from")?.value || "",
        };
    }
}