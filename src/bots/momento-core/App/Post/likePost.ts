import { ButtonInteraction, EmbedBuilder, Guild, Message, MessageReaction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextChannel, TextInputStyle, User, UserSelectMenuBuilder } from "discord.js";
import { Permission } from "../../Interfaces/IPermission";
import { ICommand } from "../../Interfaces/ICommand";
import { IContext } from "../../Interfaces/IContext";
import { IPost } from "../../Interfaces/IPost";
import { NotificationType } from "../../Interfaces/INotification";
import { LogService } from "../../Services/LogService";
import { logType } from "../../Interfaces/ILog";
import { NotificationService } from "../../../../shared/services/NotificationService";
import { ProfileServices } from "../../Utils/ProfileServices";
import axios from "axios";
import { IServer } from "../../Interfaces/IServer";
import { User as MomentoUser } from "../../../../shared/models/User";
import { LinkService } from "src/shared/services/LinkService";

export const likePost: ICommand = {
    permission: Permission.user,
    isProfileCommand: false,
    exec: async (ctx: IContext, message: Message, author: User) => {
        const serverConfig = await ctx.mongoService.getOne('servers', { id: message.guildId }) as IServer;
        if (!serverConfig) { throw new Error('Invalid server config') }
        const newCtxClone = { ...ctx }
        newCtxClone.serverConfig = serverConfig;
        const post: IPost = await newCtxClone.mongoService.getOne('posts', {
            'references.messageId': message.id,
            'references.channelId': message.channelId,
            'references.guildId': message.guildId
        }) as IPost;
        if (!post) { return }
        if (!message.guild) { throw new Error('Invalid guild') }

        const likeAuthor = await newCtxClone.mongoService.getOne('users', {
            userId: author.id,
            guildId: message.guildId
        }) as MomentoUser;
        const reaction = message.reactions.cache.find(reaction => {
            return reaction.emoji.name === '❤️'; // substitua '❤️' pela emoji desejada
        })
        if (!likeAuthor) {
            await reaction?.users.remove(author)
            throw new Error('Você precisa ter uma conta no momento para curtir um post!')
        }

        const postAuthor = await newCtxClone.mongoService.getOne('users', {
            userId: post.references.ownerId,
            guildId: post.references.guildId
        }) as MomentoUser;
        if (!postAuthor) { throw new Error('Invalid post author') }


        post.stats.likes.push(likeAuthor.userId);
        await message.fetch()
        const likeCount = message.reactions.cache.get('❤️')?.count; // substitua '❤️' pela emoji desejada

        const canTrendTypes: string[] = ['image', 'carousel', 'video']
        if ((likeCount && likeCount >= newCtxClone.serverConfig.analytics.likesToTrend) && !post.stats.isTrending && (post.stats.type && canTrendTypes.indexOf(post.stats.type) > -1)) {
            post.stats.isTrending = true;
            newCtxClone.activePostList.forEach((activePost: IPost) => {
                if (activePost.references.messageId === message.id) {
                    activePost.stats.likes = post.stats.likes;
                    activePost.stats.isTrending = post.stats.isTrending;
                }
            });

            await newCtxClone.mongoService.patch('posts', {
                'references.messageId': message.id,
                'references.channelId': message.channelId,
                'references.guildId': message.guildId,
            }, {
                "stats.isTrending": true
            });

            let postImageURL = await LinkService.readImageOfMomento(newCtxClone.uploadChannel, post.content.thumbUrl ?? '');
            if (!postImageURL) return;

            const trendingNotification = new EmbedBuilder()
                .setColor('#DD247B')
                .setTitle('MOMENTO TRENDING')
                .setDescription(`O seu momento está em alta!`)
                .setTimestamp()
                .setImage(postImageURL || null)
                .setAuthor({ name: 'MOMENTO', iconURL: 'https://imgur.com/43auFoW.png' })
                .setThumbnail('https://imgur.com/43auFoW.png')

            const trendEmbed = new EmbedBuilder()
                .setImage(postImageURL || 'https://imgur.com/43auFoW.png')
                .setColor(0xdd247b)
                .setAuthor({
                    name: "MOMENTO TRENDING",
                    iconURL: "https://imgur.com/eRYLRQ4.png",
                    url: undefined,
                })
                .setDescription(`**@${postAuthor.username}** está em alta no *#momento!*`)
                .setThumbnail("https://imgur.com/EBZfW7D.png")
                .addFields({
                    name: ' ', value: `[Confira o perfil](https://discord.com/channels/${post.references.guildId}/${post.references.channelId})`
                })

            const notificationService = new NotificationService(ctx);
            await notificationService.sendEmbedNotification(postAuthor, trendingNotification, true);

            if (newCtxClone.serverConfig.trendWebhooks &&
                newCtxClone.serverConfig.trendWebhooks.length > 0) {
                const webHooks = newCtxClone.serverConfig.trendWebhooks;
                webHooks.forEach(async (webhook: String) => {
                    try {
                        await axios.post(String(webhook), {
                            headers: { 'Content-Type': 'application/json' },
                            embeds: [trendEmbed]
                        });
                    }
                    catch (err) {
                        console.log("ERROR - Não foi possível se conectar ao webhook", webhook);
                    };
                })
            }

            const profileService = new ProfileServices();
            await profileService.updateProfilePictures(newCtxClone, postAuthor, true, false);
        }

        const authorImageUrl: string | undefined = await LinkService.readImageOfMomento(newCtxClone.uploadChannel, likeAuthor.imagesUrl.profilePicture);
        if (!authorImageUrl) { throw new Error('Erro ao carregar imagem de perfil') }

        const thumb = post.content.thumbUrl ? await LinkService.readImageOfMomento(newCtxClone.uploadChannel, post.content.thumbUrl) : undefined
        await newCtxClone.notificationService?.sendNotification(
            postAuthor,
            {
                type: NotificationType.Embed,
                message: `@${likeAuthor.username} curtiu seu momento!`,
                targetUser: postAuthor,
                authorUsername: likeAuthor.username,
                pictureUrl: authorImageUrl,
                thumbnail: thumb,
                link: `https://discord.com/channels/${message.guildId}/${likeAuthor.references.channelId}/` || `https://discord.com/channels/${message.guildId}/${message.channelId}`,
            })

        LogService.log(newCtxClone, {
            type: logType.Like,
            userId: author.id,
            messageId: message.id,
            timestamp: new Date()
        });

        return;
    }
}

