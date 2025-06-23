import { Permission } from "../../Interfaces/IPermission";
import { ICommand } from "../../Interfaces/ICommand";
import { IContext } from "../../Interfaces/IContext";
import { IPost } from "../../Interfaces/IPost";
import { LogService } from "../../Services/LogService";
import { logType } from "../../Interfaces/ILog";
import { User as MomentoUser } from "src/shared/models/user";
import { Message, User } from "discord.js";
import { LinkService } from "src/shared/services/LinkService";

export const unlikePost: ICommand = {
    permission: Permission.user,
    isProfileCommand: false,
    exec: async (ctx: IContext, message: Message, author: User) => {
        const post: IPost = await ctx.mongoService.getOne('posts', {
            'references.messageId': message.id,
            'references.channelId': message.channelId,
            'references.guildId': message.guildId
        }) as IPost;
        if (!post) { return }
        if (!message.guild) { throw new Error('Invalid guild') }

        const unlikeAuthor = await ctx.mongoService.getOne('users', {
            userId: author.id,
            guildId: message.guildId
        }) as MomentoUser;
        if (!unlikeAuthor) { throw new Error('Você precisa ter uma conta no momento para curtir um post!') }

        const postAuthor = await ctx.mongoService.getOne('users', {
            userId: post.references.ownerId,
            guildId: post.references.guildId
        }) as MomentoUser;
        if (!postAuthor) { throw new Error('Invalid post author') }

        console.log(unlikeAuthor.references.channelId   , 'is unliking post of', postAuthor.references.channelId)

        post.stats.likes = post.stats.likes.filter((id: string) => id !== unlikeAuthor.userId);

        await ctx.mongoService.patch('posts', {
            'references.messageId': message.id,
            'references.channelId': message.channelId,
            'references.guildId': message.guildId,
        }, post);
        
        const authorImageUrl: string | undefined = await LinkService.readImageOfMomento(ctx.uploadChannel, unlikeAuthor.imagesUrl.profilePicture);
        if (!authorImageUrl) { throw new Error('Erro ao carregar imagem de perfil') }

        LogService.log(ctx, {
            type: logType.Like,
            userId: author.id,
            messageId: message.id,
            timestamp: new Date()
        });

        return;
    }
}

