import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Guild, Message } from "discord.js";
import { ICommand } from "../../Interfaces/ICommand";
import { IContext } from "../../Interfaces/IContext";
import { Permission } from "../../Interfaces/IPermission";
import { tryDeleteMessage } from "../../Utils/Messages";
import { drawCommentCanvas } from "../../../../shared/services/canvas/Comment";
import { IPost } from "../../Interfaces/IPost";
import { NotificationService } from "../../../../shared/services/NotificationService";
import { NotificationType } from "../../Interfaces/INotification";
import { PostService } from "./PostService";
import { User } from "src/shared/models/User";
import { defaultTheme } from "src/shared/models/Theme";
import { LinkService } from "src/shared/services/LinkService";
import { MomentoService } from "src/shared/services/MomentoService";

export const createComment: ICommand = {
    permission: Permission.user,
    isProfileCommand: false,
    reply: 'Criando seu momento',
    success: 'Momento postado com sucesso!',
    exec: createNewComment
}

async function createNewComment(ctx: IContext, message: Message) {
    if (!message.guild) { throw new Error('Invalid guild!') }
    const post = await ctx.mongoService.getOne('posts', {
        'references.messageId': message.channelId,
        'references.guildId': message.guildId
    }) as IPost || null;

    const postAuthorUser = await ctx.mongoService.getOne('users', {
        userId: post.references.ownerId,
        guildId: message.guildId
    }) as User || null;
    const user = await ctx.mongoService.getOne('users', {
        userId: message.author.id,
        guildId: message.guildId
    }) as User || null;
    if (!user || !postAuthorUser) {
        await tryDeleteMessage(message);
        throw new Error('User not found!')
    }

    const theme = await ctx.mongoService.getOne('themes', { name: postAuthorUser.styles.theme }) || defaultTheme;
    user.styles.fonts = user.styles.fonts;


    const commentText = message.content;
    if (!commentText) { throw new Error('Invalid comment text') }

    await tryDeleteMessage(message);
    if (!message.guildId) { throw new Error('Invalid guild id') }

    const postService = new PostService(ctx);
    const userMentions = await postService.fetchUsersMentionsFromText(message.content, message.guildId);
    if (!userMentions?.parsedDescription) { throw new Error('Invalid user mentions') }

    const commentImg = await drawCommentCanvas(ctx, user, userMentions.parsedDescription, theme, user.styles.fonts);

    const deleteCommentButton: ButtonBuilder = new ButtonBuilder()
        .setCustomId('deleteMessage')
        .setLabel('🗑️')
        .setStyle(ButtonStyle.Secondary);

    const AR = new ActionRowBuilder<ButtonBuilder>().addComponents(deleteCommentButton);
    const commentMsg = await message.channel.send({ files: [commentImg.toBuffer()], components: [AR] })
    await commentMsg.react('❤️')

    const notificationService = new NotificationService(ctx);

    userMentions.mentionedUsers.forEach(async mentionedUser => {
        const authorImageUrl: string | undefined = await LinkService.readImageOfMomento(ctx.uploadChannel, user.imagesUrl.profilePicture);
        if (!authorImageUrl) { throw new Error('Erro ao carregar imagem de perfil') }

        if (mentionedUser.userId === user.userId) { return }
        await notificationService.sendNotification(mentionedUser, {
            targetUser: mentionedUser,
            type: NotificationType.Embed,
            message: `**@${user.username}** mencionou você em um comentário!\n\n *"${userMentions.parsedDescription}"*`,
            authorUsername: `@${user.username}`,
            pictureUrl: authorImageUrl,
            link: `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`
        }, true)
    })

    if (userMentions.mentionedUsers.filter(user => user.userId !== postAuthorUser.userId).length === 0 && user.userId !== postAuthorUser.userId) {
        const thumb = post.content.thumbUrl ? await LinkService.readImageOfMomento(ctx.uploadChannel, post.content.thumbUrl) : undefined
        const authorImageUrl: string | undefined = await LinkService.readImageOfMomento(ctx.uploadChannel, user.imagesUrl.profilePicture);

        await notificationService.sendNotification(postAuthorUser, {
            targetUser: postAuthorUser,
            type: NotificationType.Embed,
            message: `**@${user.username}** comentou em seu momento!\n\n *"${userMentions.parsedDescription}"*`,
            authorUsername: `@${user.username}`,
            pictureUrl: authorImageUrl,
            thumbnail: thumb,
            link: `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`
        })
    }
    return;
}