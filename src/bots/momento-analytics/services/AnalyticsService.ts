import { Client, Embed, Guild, Message, TextChannel, ThreadChannel } from "discord.js";
import { Post } from "../../../shared/models/Post";
import { User } from "../../../shared/models/User";
import { MomentoService } from "../../../shared/services/momentoService";
import { MongoService } from "../../../shared/services/mongoService";
import { LinkService } from "../../../shared/services/linkService";
import { Log } from "../../../shared/models/Log";
import { drawPostAnalytics } from "../../../shared/services/canvas/analyticsCanvas";
import { mongo } from "mongoose";

export class AnalyticsService {
    constructor() { }

    private async initAnalyticsCron(client: Client, mongoService: MongoService, uploadChannel: TextChannel): Promise<void> {
        let activePostList = await mongoService.get('posts', { 'stats.status': 'active' })
        const cron = require('node-cron');
        let postsToAnalytics: Post[] = [];

        cron.schedule('*/10 * * * * *', async () => {
            const now = new Date();

            //CHANGE TO 24HRS! = 86400000 =========================
            const timeoutTimestamp = new Date(now.getTime() - 86400000);
            //CHANGE TO 24HRS! = 86400000 =========================

            postsToAnalytics = activePostList.filter(post => new Date(post.stats.date) <= timeoutTimestamp) as Post[];
            for (let post of postsToAnalytics) {
                try {
                    postsToAnalytics = [...new Set(postsToAnalytics)];
                    activePostList = activePostList.filter(p => p.references.messageId !== post.references.messageId);
                    postsToAnalytics = postsToAnalytics.filter(p => p.references.ownerId !== post.references.ownerId);

                    const author = await mongoService.getOne('users', {
                        userId: post.references.ownerId,
                        guildId: post.references.guildId
                    }) as User;
                }
                catch (err) {
                    console.log(err)
                }
            }
        });
    }

    public async analyticPost(request: any, context: { client: Client, mongoService: MongoService, author: User, post: Post, uploadChannel: TextChannel }): Promise<string[] | null> {
        try {
            if (!context.author.guildId) { throw new Error('Invalid guild') }
            const guild = await context.client.guilds.fetch(context.author.guildId) as Guild;
            if (!guild) { throw new Error('Invalid guild') }

            let newFollowers = 0;
            const postFollowers = this.calculateNewFollowers(context.post, context.author);
            newFollowers += postFollowers;

            context.mongoService.patch('posts', {
                'references.messageId': context.post.references.messageId,
                'references.channelId': context.post.references.channelId
            }, {
                'stats.status': 'inactive'
            })

            await context.mongoService.patch('users', {
                userId: context.author.userId,
                guildId: context.author.guildId
            }, {
                'stats.followers': context.author.stats.followers + newFollowers
            })

            let analyticsUrl: string[] = [];


            const postAuthor = await context.mongoService.getOne('users', {
                userId: context.post.references.ownerId,
                guildId: context.post.references.guildId
            }) as User;

            if (!postAuthor) throw new Error('Invalid post author');
            if (!postAuthor.references.channelId) throw new Error('Invalid post author');
            if (!context.post.references.messageId) throw new Error('Invalid post message');

            const likesLogs = await context.mongoService.get('logs', {
                type: 'like',
                messageId: context.post.references.messageId,
            }) as Log[];

            const canvas = await drawPostAnalytics(context.uploadChannel, context.post, postAuthor, likesLogs, postFollowers);
            const buffer = canvas.toBuffer('image/png');
            const link = await LinkService.uploadImageToMomento(context.uploadChannel, buffer);

            analyticsUrl.push(link.url);

            const userProfileChannel = await context.client.channels.fetch(postAuthor.references.channelId) as TextChannel;
            const postMessage = await userProfileChannel.messages.fetch(context.post.references.messageId) as Message;

            if (postMessage) {
                const postCommentThread = await this.getPostCommentThread(userProfileChannel, postMessage);
                if (postCommentThread) {
                    await postCommentThread.delete();
                }
                await postMessage.delete();
            }


            return analyticsUrl;
        }
        catch (err) {
            console.log(err)
            return null;
        }
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


    public createAnalyticsRequestObject(embed: Embed): {
        guild_id: string,
        target_user_id: string,
        target_profile_channel_id: string,
        post_message_id: string,
        sent_from: string
    } {
        const fields = embed.fields;

        return {
            guild_id: fields.find((f) => f.name === "guild_id")?.value || "",
            target_user_id: fields.find((f) => f.name === "target_user_id")?.value || "",
            target_profile_channel_id: fields.find((f) => f.name === "target_profile_channel_id")?.value || "",
            post_message_id: fields.find((f) => f.name === "post_message_id")?.value || "",
            sent_from: fields.find((f) => f.name === "sent_from")?.value || "",
        };
    }
}