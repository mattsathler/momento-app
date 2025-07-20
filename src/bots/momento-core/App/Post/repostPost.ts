import { ICommand } from "../../Interfaces/ICommand";
import { Permission } from "../../Interfaces/IPermission";
import { IContext } from "../../Interfaces/IContext";
import { NotificationType } from "../../Interfaces/INotification";
import { IPost, IPostStatus } from "../../Interfaces/IPost";
import { PostService } from "./PostService";
import { drawPostCanvas } from "../../../../shared/services/canvas/Post";
import { ProfileServices } from "../../Utils/ProfileServices";
import { User as MomentoUser } from "src/shared/models/user";
import { ButtonStyle, ComponentType, EmbedBuilder, Message, TextChannel, User } from "discord.js";
import { LinkService } from "src/shared/services/LinkService";
import { defaultTheme, Theme } from "src/shared/models/Theme";
import { MomentoService } from "src/shared/services/MomentoService";

export const repostPost: ICommand = {
    permission: Permission.user,
    isProfileCommand: false,
    reply: 'Criando seu momento',
    success: 'Momento postado com sucesso!',
    exec: execRepostPost
}

async function execRepostPost(ctx: IContext, message: Message, author: User): Promise<void> {
    const targetUser: MomentoUser = await ctx.mongoService.getOne('users', {
        'references.channelId': message.channelId,
        'guildId': message.guildId
    }) as MomentoUser;

    const authorUser: MomentoUser = await ctx.mongoService.getOne('users', {
        'userId': author.id,
        'guildId': message.guildId
    })

    if (targetUser.userId === authorUser.userId) throw new Error("Você não pode republicar seu próprio momento!")
    if (!authorUser.references.channelId) throw new Error("Usuário inválido!")

    let post: IPost = await ctx.mongoService.getOne('posts', {
        'references.messageId': message.id,
        'references.channelId': message.channelId,
        'references.guildId': message.guildId
    }) as IPost;
    if (!post) { return }
    if (!post.content.thumbUrl) throw new Error('Erro ao carregar post')

    if (!targetUser || !authorUser) { throw new Error("Usuário inválido!"); }

    const thumbUrl = await LinkService.readImageOfMomento(ctx.uploadChannel, post.content.thumbUrl) || undefined
    if (!thumbUrl) throw new Error('Erro ao carregar post')
    const actionImageUrl: string | undefined = await LinkService.readImageOfMomento(ctx.uploadChannel, authorUser.imagesUrl.profilePicture);
    if (!actionImageUrl) { throw new Error('Erro ao carregar imagem de perfil') }

    const profileUrl: string = `https://discord.com/channels/${message.guildId}/${authorUser.references.channelId}/` || `https://discord.com/channels/${message.guildId}/${message.channelId}`
    const theme = MomentoService.isUserVerified(targetUser.stats.isVerified) ? await ctx.mongoService.getOne('themes', { name: targetUser.styles.theme }) as Theme ?? defaultTheme : defaultTheme;
    authorUser.styles.fonts = MomentoService.isUserVerified(authorUser.stats.isVerified) ? authorUser.styles.fonts : { primary: 'sfpro', secondary: 'sfpro' };

    if (post.content.imagesCount > 0) {
        post.content.images = [post.content.thumbUrl];
    }
    const repostImage = await drawPostCanvas(ctx, targetUser, theme || defaultTheme, post);
    const uploadChannel = await MomentoService.getUploadChannel(ctx.client);

    const uploadedImage = await LinkService.uploadImageToMomento(uploadChannel, repostImage.toBuffer(), 'png');

    const repostEmbed: EmbedBuilder =
        new EmbedBuilder()
            .setDescription(`**Repostou um momento de** *@${targetUser.username}*`)
            .setURL(profileUrl)
            .addFields({
                name: ' ', value: `[Confira o perfil](https://discord.com/channels/${post.references.guildId}/${post.references.channelId})`
            })
            .setAuthor({
                name: `@${authorUser.username}`,
                iconURL: actionImageUrl,
                url: profileUrl
            })
            .setColor("#DD247B")
            .setImage(uploadedImage.attachments.first()?.url || null)

    const authorProfileChannel = await message.guild?.channels.fetch(authorUser.references.channelId) as TextChannel
    if (!authorProfileChannel) throw new Error("Perfil inválido!")

    const repostMessage = await authorProfileChannel.send({
        embeds: [repostEmbed],
        components: [{
            type: ComponentType.ActionRow,
            components: [{
                type: ComponentType.Button,
                style: ButtonStyle.Secondary,
                customId: 'openOptionsMenu',
                label: 'Opções',
            }]
        }]
    })
    await repostMessage.react("❤️");

    let repost: IPost = post;
    repost.references = {
        channelId: authorUser.references.channelId,
        guildId: message.guildId || '',
        messageId: repostMessage.id,
        ownerId: authorUser.userId
    }

    repost.stats = {
        type: 'repost',
        isRepost: true,
        isTrending: false,
        likes: [],
        date: new Date(),
        status: IPostStatus.active
    }

    repost._id = null;

    const postService: PostService = new PostService(ctx);
    await postService.sendPostToDatabase(ctx, repost);
    await notifyRepost(ctx, targetUser, authorUser, actionImageUrl, profileUrl, thumbUrl);

    await ctx.mongoService.patch('users', {
        userId: authorUser.userId,
        guildId: authorUser.guildId
    }, {
        'stats.lastOnline': new Date()
    });

    await postService.addPostToAnalytics(post, "add");

    const profileService = new ProfileServices();
    await profileService.updateProfilePictures(ctx, authorUser, true, false);
}

async function notifyRepost(ctx: IContext, targetUser: MomentoUser, authorUser: MomentoUser, authorImg: string, profileUrl: string, thumb?: string) {
    const postService: PostService = new PostService(ctx);

    await ctx.notificationService?.sendNotification(
        targetUser,
        {
            type: NotificationType.Embed,
            message: `@${authorUser.username} compartilhou seu momento!`,
            targetUser: targetUser,
            authorUsername: authorUser.username,
            pictureUrl: authorImg,
            thumbnail: thumb,
            link: profileUrl,
        })
}