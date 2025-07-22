import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, Guild, Message, MessageType, TextChannel, ThreadAutoArchiveDuration } from "discord.js";
import { IPost, IPostStatus, PostType } from "../../Interfaces/IPost";
import { IContext } from "../../Interfaces/IContext";
import { drawMultiplePostsCanvas, drawPostCanvas, drawPostFrame } from "../../../../shared/services/canvas/Post";
import { tryDeleteMessage } from "../../Utils/Messages";
import { INotification, NotificationType } from "../../Interfaces/INotification";
import { NotificationService } from "../../../../shared/services/NotificationService";
import { ProfileServices } from "../../Utils/ProfileServices";
import { Canvas, Image, loadImage } from "canvas";
import path from "path";
import { VideoService } from "./VideoService";
import { IServer } from "../../Interfaces/IServer";
import "dotenv";
import { User } from "src/shared/models/User";
import { defaultTheme, Theme } from "src/shared/models/Theme";
import { LinkService } from "src/shared/services/LinkService";
import { MomentoService } from "src/shared/services/MomentoService";
import { getSecureToken } from "src/shared/services/TokenService";
import { AxiosService } from "src/shared/services/AxiosService";
import { toolsPaths } from "assets-paths";

export class PostService {
    ctx: IContext;
    constructor(ctx: IContext) {
        this.ctx = ctx;
    }

    public async createVideoPost(ctx: IContext, message: Message, author: User, theme: Theme) {
        try {

            if (!ctx.serverConfig) { throw new Error('Invalid server config') };
            if (!message.guild) { throw new Error('Invalid server guild') }
            if (!message.guildId) { throw new Error('Invalid server guild') }
            if (!author.references.channelId) { throw new Error('Invalid author channel id') }

            const serverConfig = await ctx.mongoService.getOne('servers', { id: message.guildId }) as IServer;

            console.log('Creating video post of', author.userId, author.guildId);
            const authorProfileChannel = await message.guild.channels.fetch(author.references.channelId) as TextChannel;
            const locationMatch = message.content.match(/`([^`]*)`/);

            const postLocation = locationMatch ? locationMatch[1] : null;
            const postDescription = postLocation
                ? message.content
                    .replace(/`[^`]*`/, '')
                    .replace(/[\r\n]+/g, ' ')
                    .trim()
                : message.content.replace(/[\r\n]+/g, ' ').trim();

            let post: IPost = {
                content: {
                    images: [],
                    description: postDescription,
                    imagesCount: 1
                },
                references: {
                    ownerId: author.userId,
                    channelId: author.references.channelId,
                    guildId: message.guildId,
                    messageId: null,
                },
                stats: {
                    type: 'video',
                    likes: [],
                    date: new Date(),
                    status: IPostStatus.active,
                    isTrending: false,
                    isRepost: false,
                }
            }

            if (postLocation) {
                post.content.location = postLocation;
            }

            const fs = require('fs').promises;
            const frame = await drawPostFrame(ctx.uploadChannel, author, post, theme);
            const path = `./Temp/Posts/${message.guildId}${message.channelId}${message.id}`
            await fs.mkdir(path, { recursive: true });
            await fs.writeFile(`${path}/frame.png`, frame.toBuffer(), { recursive: true });

            const ffmpeg = require('fluent-ffmpeg');
            ffmpeg.setFfmpegPath(toolsPaths.ffmpeg);
            ffmpeg.setFfprobePath(toolsPaths.ffprobe);

            // return
            const videoUrl = message.attachments.first()?.url;
            const videoSize = `${Math.round(frame.width)}x${Math.round(frame.height)}`
            ffmpeg(videoUrl)
                .size(videoSize)
                .autopad(theme.colors.secondary)
                .output(`${path}/temp.mp4`)
                .on('end', function () {
                    ffmpeg(`${path}/temp.mp4`)
                        .input(`${path}/frame.png`)
                        .complexFilter([{
                            filter: 'overlay',
                        }])
                        .duration(process.env.VIDEO_MAX_DURATION)
                        .output(`${path}/post.mp4`)
                        .on('end', async function () {
                            const postService = new PostService(ctx);

                            if (!author.guildId) { throw new Error('Invalid server guild') }
                            if (!author.references.channelId) { throw new Error('Invalid server guild') }
                            const postMentions = await postService.fetchUsersMentionsFromText(post.content.description || '', author.guildId);

                            post.content.description = postMentions?.parsedDescription || undefined;

                            post.references = {
                                ownerId: author.userId,
                                channelId: author.references.channelId,
                                guildId: author.guildId,
                                messageId: null,
                            }

                            post.stats = {
                                type: 'video',
                                likes: [],
                                date: new Date(),
                                status: IPostStatus.active,
                                isTrending: false,
                                isRepost: false,
                            }

                            let postImageURL: Message;
                            const outputBuffer = await fs.readFile(`${path}/post.mp4`);

                            const postThumbBuffer = await VideoService.getVideoThumb(`${path}/post.mp4`, path);
                            ctx.serverConfig = serverConfig;
                            const uploadChannel = await MomentoService.getUploadChannel(ctx.client);
                            post.content.thumbUrl = (await LinkService.uploadImageToMomento(uploadChannel, postThumbBuffer)).url;
                            postImageURL = await LinkService.uploadImageToMomento(uploadChannel, outputBuffer, 'mp4');

                            let hashtags = post.content.description?.match(/#\w+/g) as string[] ?? [];
                            hashtags = hashtags.map(hashtag => hashtag.toLowerCase());

                            const components: any = hashtags.includes('#ask') ?
                                [{
                                    type: ComponentType.Button,
                                    style: ButtonStyle.Primary,
                                    customId: 'openAskUser',
                                    label: 'Perguntar',
                                },
                                {
                                    type: ComponentType.Button,
                                    style: ButtonStyle.Secondary,
                                    customId: 'openOptionsMenu',
                                    label: 'Opções',
                                }] : [{
                                    type: ComponentType.Button,
                                    style: ButtonStyle.Secondary,
                                    customId: 'openOptionsMenu',
                                    label: 'Opções',
                                }];
                            const postMessage = await authorProfileChannel.send({
                                content: postImageURL.attachments?.first()?.url,
                                components: [
                                    {
                                        type: ComponentType.ActionRow,
                                        components: components
                                    }
                                ]
                            }) as Message;

                            if (!author.userId) { throw new Error('Invalid author id') }
                            if (!postMessage) { throw new Error('Invalid post message') }
                            if (!postMessage.channel) { throw new Error('Invalid post message channel') }
                            if (!postMessage.guild) { throw new Error('Invalid post message guild') }
                            if (!postMessage.guildId) { throw new Error('Invalid post message guild') }

                            post.references.messageId = postMessage.id;

                            if (!postImageURL.attachments?.first()?.url) {
                                console.log('ERROR: Creating post error', post);
                                return;
                            }
                            post.content.imageUrl = postImageURL.url;

                            await postService.sendPostToDatabase(ctx, post);
                            await postService.createPostCommentsThread(postMessage.guild, author, postMessage);

                            if (postMentions?.mentionedUsers) {
                                postMentions.mentionedUsers.forEach(async mentionedUser => {
                                    if (mentionedUser.userId === author.userId) { return }
                                    const notificationService = new NotificationService(ctx);
                                    notificationService.sendNotification(mentionedUser, {
                                        message: `**${author.name}** mencionou você em um momento!\n\n *${postMentions.parsedDescription}*`,
                                        link: postMessage.url,
                                        type: NotificationType.Embed,
                                        targetUser: mentionedUser,
                                        authorUsername: `@${author.username}`,
                                        thumbnail: postMessage.content || '',
                                        pictureUrl: author.imagesUrl.profilePicture,
                                    }, true)
                                })
                            }

                            await postMessage.react('❤️');

                            if (!hashtags.includes('#ask')) {
                                await postMessage.react('🔁');
                            }
                            const profileService = new ProfileServices();
                            await profileService.updateProfilePictures(ctx, author, true, false);

                            fs.rm(path, { recursive: true })

                            await tryDeleteMessage(message);
                            return;
                        })
                        .on('error', function (err: any) {
                            console.error('Erro ao adicionar vídeo à imagem:', err.message);
                        })
                        .run();
                })
                .on('error', function (err: any) {
                    console.error('Erro ao redimensionar o vídeo:', err.message);
                })
                .run();
        }
        catch (err: any) {
            console.log(err);
        }
    }

    async createImagePost(message: Message, post: IPost, author: User, theme: Theme, disableRepost?: boolean) {
        const serverConfig = await this.ctx.mongoService.getOne('servers', { id: message.guildId }) as IServer;
        this.ctx.serverConfig = serverConfig;

        if (!this.ctx.serverConfig) { throw new Error('Invalid server config') };
        if (!message.guild) { throw new Error('Invalid server guild') }
        if (!author.references.channelId) { throw new Error('Invalid author channel id') }

        const authorProfileChannel = await message.guild.channels.fetch(author.references.channelId) as TextChannel;

        if (!author.guildId) { throw new Error('Invalid author guild id') }

        let hashtags = post.content.description?.match(/#\w+/g) as string[] ?? [];
        hashtags = hashtags.map(hashtag => hashtag.toLowerCase());

        const postService = new PostService(this.ctx);
        const postMentions = await postService.fetchUsersMentionsFromText(post.content.description || '', author.guildId);

        post.content.description = postMentions?.parsedDescription || undefined;
        post.references = {
            ownerId: author.userId,
            channelId: author.references.channelId,
            guildId: author.guildId,
            messageId: null,
        }

        post.stats = {
            type: post.stats.type,
            likes: [],
            date: new Date(),
            status: IPostStatus.active,
            isTrending: false,
            isRepost: false,
        }

        let postImageURL: Message;
        let postThumbURL: string | undefined;
        const uploadChannel = await MomentoService.getUploadChannel(this.ctx.client);
        if (post.content.images && post.content.images.length > 1) {
            const buffer = await this.convertToGif(this.ctx, author, theme, post)
            if (!buffer) { return }
            postImageURL = await LinkService.uploadImageToMomento(uploadChannel, buffer || null, 'gif');
        }
        else {
            const postImage = await drawPostCanvas(this.ctx, author, theme, post);
            postImageURL = await LinkService.uploadImageToMomento(uploadChannel, postImage?.toBuffer() || null);
        }

        postThumbURL = post.content.images ? post.content.images[0] : undefined;
        post.content.imageUrl = postImageURL.url;
        post.content.thumbUrl = postThumbURL ? postThumbURL : postImageURL.url;

        const components: any = hashtags.includes('#ask') ?
            [{
                type: ComponentType.Button,
                style: ButtonStyle.Primary,
                customId: 'openAskUser',
                label: 'Perguntar',
            },
            {
                type: ComponentType.Button,
                style: ButtonStyle.Secondary,
                customId: 'openOptionsMenu',
                label: 'Opções',
            }] : [{
                type: ComponentType.Button,
                style: ButtonStyle.Secondary,
                customId: 'openOptionsMenu',
                label: 'Opções',
            }];
        const postMessage = await authorProfileChannel.send({
            content: postImageURL.attachments.first()?.url,
            components: [
                {
                    type: ComponentType.ActionRow,
                    components: components
                }
            ]
        }) as Message;

        if (!author.userId) { throw new Error('Invalid author id') }
        if (!postMessage) { throw new Error('Invalid post message') }
        if (!postMessage.channel) { throw new Error('Invalid post message channel') }
        if (!postMessage.guildId) { throw new Error('Invalid post message guild') }

        post.references.messageId = postMessage.id;

        if (!postImageURL.attachments.first()?.url) {
            console.log('ERROR: Creating post error', post);
            return;
        }
        post.content.imageUrl = postImageURL.url;

        await this.sendPostToDatabase(this.ctx, post);
        await this.createPostCommentsThread(message.guild, author, postMessage);

        if (postMentions?.mentionedUsers) {
            postMentions.mentionedUsers.forEach(async mentionedUser => {
                if (mentionedUser.userId === author.userId) { return }
                const notificationService = new NotificationService(this.ctx);
                await notificationService.sendNotification(mentionedUser, {
                    message: `**${author.name}** mencionou você em um momento!\n\n *${postMentions.parsedDescription}*`,
                    link: postMessage.url,
                    type: NotificationType.Embed,
                    targetUser: mentionedUser,
                    authorUsername: `@${author.username}`,
                    thumbnail: postMessage.content || '',
                    pictureUrl: author.imagesUrl.profilePicture,
                }, true)
            })
        }

        await postMessage.react('❤️');
        if (!disableRepost && !hashtags.includes('#ask')) {
            await postMessage.react('🔁');
        }

        const profileService = new ProfileServices();
        await this.ctx.mongoService.patch('users', {
            userId: author.userId,
            guildId: author.guildId
        }, {
            'stats.lastOnline': new Date()
        });

        if (post.stats.type === "image" || post.stats.type === "video" || post.stats.type === "carousel") {
            await profileService.updateProfilePictures(this.ctx, author, true, false);
        }
        return;
    }

    async sendPostToDatabase(ctx: IContext, post: IPost): Promise<void> {
        return ctx.mongoService.post('posts', post);
    }

    async createPostCommentsThread(guild: Guild, user: User, postMessage: Message) {
        if (!user.references.channelId) { throw new Error('Invalid channel id') }
        try {
            const userChannel = await guild.channels.fetch(user.references.channelId) as TextChannel;
            const notificationChannel = await postMessage.startThread({
                name: 'Comentários',
                autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
                reason: 'Comentários da foto!'
            })
            if (!notificationChannel) { throw new Error('Invalid notification channel') }
            const tempMsg = userChannel.messages.cache.filter(message => message.type === MessageType.ThreadCreated).first() as Message;
            if (tempMsg) {
                tryDeleteMessage(tempMsg);
            }

            return notificationChannel;
        }
        catch (err) {
            console.log(err);
            throw new Error('Invalid notification channel');
        }
    }


    async fetchUsersMentionsFromText(text: string, guildId: string): Promise<{
        mentionedUsers: User[],
        parsedDescription: string
    } | null> {
        const mentionsInText = text.match(/@(\w+)/g);
        const mentionsInMessage = text.match(/<@!?\d+>/g);
        if (!mentionsInMessage && !mentionsInText) {
            return {
                mentionedUsers: [],
                parsedDescription: text
            }
        }

        let content = text.split(' ')
        let mentionedUsers: User[] = [];

        const mentionsContent = content.map(async word => {
            if (word.startsWith('<@')) {
                word = word.slice(2, -1);
                if (word.startsWith('!')) {
                    word = word.slice(1);
                }

                const userMentioned = await this.ctx.mongoService.getOne('users', { userId: word, guildId: guildId }) as User;
                if (userMentioned) {
                    mentionedUsers.push(userMentioned);
                    word = `@${userMentioned.username}`
                }
                else { return null; }

                return word
            }
            if (word.startsWith('@')) {
                if (word.startsWith('!')) {
                    word = word.slice(1);
                }

                const userMentioned = await this.ctx.mongoService.getOne('users', { username: word.slice(1), guildId: guildId }) as User;
                if (userMentioned) {
                    mentionedUsers.push(userMentioned);
                    word = `@${userMentioned.username}`
                }
                else { return null; }
            }
            return word
        })

        const resolvedUsers = await Promise.all(mentionsContent);
        return {
            mentionedUsers: mentionedUsers,
            parsedDescription: resolvedUsers.join(' ')
        }
    }

    async updatePost(ctx: IContext, post: IPost, guild: Guild) {
        try {
            if (!ctx.serverConfig) { throw new Error('Invalid server config') }
            if (!post.references.messageId) { throw new Error('Invalid post message id') }

            const author = await ctx.mongoService.getOne('users', {
                userId: post.references.ownerId,
                guildId: post.references.guildId
            }) as User;
            if (!author) { throw new Error('Invalid author') }

            const theme = await ctx.mongoService.getOne('themes', { name: author.styles.theme }) as Theme;
            author.styles.fonts = author.styles.fonts;

            let postImageURL: Message;
            const uploadChannel = await MomentoService.getUploadChannel(this.ctx.client);
            if (post.content.images && post.content.images?.length > 1 && typeof (post.content.images) === 'object') {
                let postImages: Canvas[] = [];

                await Promise.all(post.content.images.map(async image => {
                    let newPost: IPost = { ...post };
                    newPost.content.images = [image];
                    const postImage = await drawPostCanvas(ctx, author, theme, newPost);

                    postImages.push(postImage);
                    return postImages;
                }));
                postImageURL = await LinkService.uploadImageToMomento(uploadChannel, postImages[0]?.toBuffer() || null);
            }
            else {
                const postImage = await drawPostCanvas(ctx, author, theme, post);
                postImageURL = await LinkService.uploadImageToMomento(uploadChannel, postImage?.toBuffer() || null);
            }

            const postChannel = await ctx.client.channels.fetch(post.references.channelId) as TextChannel;
            if (!postChannel) { throw new Error('Invalid post channel') }

            const postMessage = await postChannel.messages.fetch(post.references.messageId) as Message;
            await postMessage.edit({ content: postImageURL.attachments.first()?.url });
        }
        catch (err: any) {
            console.log(err)
        }

        return;
    }

    private async convertToGif(ctx: IContext, author: User, theme: Theme, post: IPost, delay: number = 2000): Promise<Buffer | null> {
        if ((post.content.images && post.content.images?.length > 1) || (post.content.buffers && post.content.buffers.length > 0)) {
            let postsImage: Canvas[];

            if (post.content.buffers && post.content.buffers?.length > 0) {
                postsImage = await drawMultiplePostsCanvas(ctx.uploadChannel, author, theme, post, post.content.buffers);
            }
            else {
                postsImage = await drawMultiplePostsCanvas(ctx.uploadChannel, author, theme, post);
            }

            postsImage.sort()
            const GIFEncoder = require('gif-encoder-2')
            const encoder = new GIFEncoder(postsImage[0].width, postsImage[0].height, undefined, true);
            encoder.start();
            encoder.setRepeat(1);
            encoder.setDelay(delay);
            encoder.setQuality(1)

            postsImage.forEach((image: Canvas, id: number) => {
                encoder.addFrame(image.getContext('2d'));
                console.log('GIF GENERATION:', author.userId, 'POST', id, '/', postsImage.length)
            })

            encoder.finish();
            const buffer: Buffer = encoder.out.getData();

            return buffer;
        }
        return null;
    }

    private extractNumber(filename: string) {
        const match = filename.match(/_(\d+)\.png/); // Expressão regular para encontrar o número após o sublinhado
        return match ? parseInt(match[1], 10) : 0; // Retorna o número encontrado ou 0 se não houver número
    }



    public async convertVideoToImageBuffers(videoUrl: string, message: Message): Promise<Image[]> {
        const imagesBuffer: Image[] = [];


        const screenshotsFolder = `./Temp/Posts/${message.channelId}${message.id}`;
        const fs = require('fs').promises;

        await this.captureScreenshots(videoUrl, screenshotsFolder);

        try {
            let files = await fs.readdir(screenshotsFolder);
            files.sort((a: string, b: string) => {
                const numberA = this.extractNumber(a);
                const numberB = this.extractNumber(b);
                return numberA - numberB;
            });

            const loadImagePromises = files.map(async (filename: string) => {
                const filePath = path.join(screenshotsFolder, filename);
                try {
                    const file = await fs.readFile(filePath);
                    const image = await loadImage(file);
                    return image;
                } catch (err) {
                    console.error(err);
                    return null;
                }
            });

            try {
                const images = await Promise.all(loadImagePromises);
                imagesBuffer.push(...images.filter(image => image !== null));
            } catch (err) {
                console.error('Erro ao carregar imagens:', err);
            }

            await Promise.all(loadImagePromises);
            return imagesBuffer;
        } catch (err) {
            console.error('Erro ao processar arquivos:', err);
            return imagesBuffer;
        }
    }

    public async captureScreenshots(videoUrl: string, screenshotsFolderPath: string): Promise<any> {
        const fs = require('fs').promises;
        const ffmpeg = require('fluent-ffmpeg');
        const extractFrames = require('ffmpeg-extract-frames')

        ffmpeg.setFfmpegPath(toolsPaths.ffmpeg);
        ffmpeg.setFfprobePath(toolsPaths.ffprobe);

        await fs.mkdir(screenshotsFolderPath, { recursive: true })
        await extractFrames({
            input: videoUrl,
            output: `${screenshotsFolderPath} /0_ % d.png`
        })
        return;
    }
}
