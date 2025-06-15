import { Client, Embed, Guild, Message, TextChannel, ThreadChannel } from "discord.js";
import { Post } from "../../../shared/models/Post";
import { MongoService } from "../../../shared/services/mongoService";
import { LinkService } from "../../../shared/services/linkService";
import { Log } from "../../../shared/models/Log";
import { drawPostAnalytics } from "../../../shared/services/canvas/analyticsCanvas";
import { User } from "../../../shared/models/user";
import { AnalyticsQueue } from "../src/queues/AnalyticsQueue";

export class AnalyticsService {
    private activePosts: Post[] = [];

    constructor() { }

    public addPost(post: Post): void {
        this.activePosts.push(post);
        console.log("Adding post...");
        return;
    }

    public removePost(guildId: string, postMessageId: string) {
        console.log('Removing post...', this.activePosts.length);
        this.activePosts = this.activePosts.filter((post) => !(post.references.guildId === guildId && post.references.messageId === postMessageId));
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
            console.log('Active posts:', this.activePosts.length);

            for (let post of this.activePosts) {
                const postDate = new Date(post.stats.date) 
                const author = await mongoService.getOne('users', {
                    userId: post.references.ownerId,
					guildId: post.references.guildId
				}) as User;
                
                if (postDate <= timeoutTimestamp) {
                    console.log('processing', post.content.description);
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

    public async analyticPost(client: Client, mongoService: MongoService, author: User, post: Post, uploadChannel: TextChannel): Promise<string | null> {
        try {
            if (!author.guildId) { throw new Error('Invalid guild') }
            const guild = await client.guilds.fetch(author.guildId) as Guild;
            if (!guild) { throw new Error('Invalid guild') }
            if (!post.references.messageId) { throw new Error('Invalid messageId') }

            let newFollowers = 0;
            const postFollowers = this.calculateNewFollowers(post, author);
            newFollowers += postFollowers;

            // await mongoService.patch('posts', {
            //     'references.messageId': post.references.messageId,
            //     'references.channelId': post.references.channelId
            // }, {
            //     'stats.status': 'inactive'
            // })

            this.removePost(post.references.guildId, post.references.messageId);

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

            const canvas = await drawPostAnalytics(uploadChannel, post, postAuthor, likesLogs, postFollowers);
            const buffer = canvas.toBuffer('image/png');
            const link = await LinkService.uploadImageToMomento(uploadChannel, buffer);

            const userProfileChannel = await client.channels.fetch(postAuthor.references.channelId) as TextChannel;
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


    public createAnalyticsRegisterObject(embed: Embed): {
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