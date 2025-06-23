import { Attachment, Message, MessageType, TextChannel } from "discord.js";
import { ICommand } from "../../Interfaces/ICommand";
import { IContext } from "../../Interfaces/IContext";
import { MessageCreateService } from "./MessageCreateService";
import { tryDeleteMessage } from "../../Utils/Messages";
import { textList } from "../../Commands/CommandLists";
import { createComment } from "../../App/Post/createComment";
import { PostService } from "../../App/Post/PostService";
import { IPost, IPostStatus } from "../../Interfaces/IPost";
import { Permission } from "../../Interfaces/IPermission";
import { User } from "src/shared/models/User";
import { defaultTheme } from "src/shared/models/Theme";
import { ImageCropper } from "src/shared/services/ImageCropper";
import { LinkService } from "src/shared/services/LinkService";
import { MomentoService } from "src/shared/services/MomentoService";

require('dotenv').config()
export async function messageCreate(ctx: IContext, message: Message) {
    try {
        if (!isValidMessage(message)) { return }
        const messageCreateService: MessageCreateService = new MessageCreateService()
        const author = await ctx.mongoService.getOne('users', {
            userId: message.author.id,
            guildId: message.guildId
        }) as User || null;

        if (!author && message.author.id !== process.env.OWNER_ID) {
            return;
        }

        if (author && author.userId === process.env.OWNER_ID) { author.permission = Permission.ceo }
        if (messageCreateService.isCommand(message)) {
            const command = messageCreateService.getCommand(message)
            const cmd: ICommand = textList[command]

            if (cmd) {
                let replyText: string;
                const alias = await message.reply(cmd.reply ? `${cmd.reply}, aguarde...` : 'Aguarde...');
                if (cmd.permission > author?.permission || (!author && message.author.id !== process.env.OWNER_ID)) {
                    await tryDeleteMessage(alias)
                    throw new Error('Você não tem permissão para executar esse comando!');
                }
                if (cmd.isProfileCommand) {
                    if (!author || !author.references.channelId) {
                        await tryDeleteMessage(alias)
                        throw new Error('Você não pode executar comandos de perfil sem estar registrado!');
                    }
                    if (message.channelId !== author.references.channelId) {
                        await tryDeleteMessage(alias)
                        throw new Error('Você não pode executar comandos de perfil em outros canais!');
                    }
                }
                try {
                    await cmd.exec(ctx, message);
                    replyText = cmd.success ?? '**Comando executado com sucesso!**';
                }
                catch (err: any) {
                    replyText = cmd.error ?? '**Erro ao executar o comando -** ' + err.message;
                }

                try {
                    await alias.fetch()
                    await alias.edit(replyText);
                    if (cmd.deleteReply) {
                        setTimeout(() => {
                            tryDeleteMessage(alias);
                        }, 4000);
                    }
                    if (cmd.deleteMessage) {
                        tryDeleteMessage(message);
                    }
                }
                catch(error: any) {
                    console.log(error)
                    return;
                }
            }
            else {
                const reply = await message.reply('Comando não encontrado!');
                setTimeout(() => {
                    tryDeleteMessage(reply);
                    tryDeleteMessage(message);
                }, 4000);
            }
            return;
        }

        const isComment = await messageCreateService.isComment(ctx, message);
        if (isComment) {
            await createComment.exec(ctx, message);
        }

        if (!author) return;
        if (message.channelId === author.references.channelId) {
            if (!message.guild) { return };
            if (!author.guildId) { return };
            const postService = new PostService(ctx);

            let postImagesURL: string[] = [];
            const theme = await ctx.mongoService.getOne('themes', { name: author.styles.theme }) || defaultTheme;
            await message.react('📸');

            const isVideo = message.attachments.first()?.contentType === 'video/mp4' || message.attachments.first()?.contentType === 'video/quicktime'
            if (isVideo) {
                const videoUrl = message.attachments.first()?.url;
                if (!videoUrl) return;

                await postService.createVideoPost(ctx, message, author, theme);
                return;
            }
            else {
                const uploadChannel: TextChannel = await MomentoService.getUploadChannel(ctx.client);
                await Promise.all(
                    message.attachments.map(async (attachment: Attachment) => {
                        const postImage = await ImageCropper.cropImageFromURL(attachment.url);
                        const postImageLink = (await LinkService.uploadImageToMomento(uploadChannel, postImage.toBuffer())).url;
                        postImagesURL.push(postImageLink);
                    })
                )

                postImagesURL = postImagesURL.slice(0, 5);
                
                const post: IPost = {
                    content: {
                        images: postImagesURL,
                        description: message.content,
                        imagesCount: postImagesURL.length
                    },
                    references: {
                        ownerId: author.userId,
                        channelId: author.references.channelId,
                        guildId: author.guildId,
                        messageId: null,
                    },
                    stats: {
                        type: postImagesURL.length === 0 ? 'text' : postImagesURL.length > 1 ? 'carousel' : 'image',
                        likes: [],
                        date: new Date(),
                        status: IPostStatus.active,
                        isTrending: false,
                        isRepost: false,
                    }
                }

                await postService.createImagePost(message, post, author, theme)
            }

            await tryDeleteMessage(message);
        }
        return;
    }
    catch (err: any) {
        console.log(err);
        const reply = await message.reply(`Ocorreu um erro inesperado! - ${err.message}`);
        setTimeout(() => {
            tryDeleteMessage(reply);
            tryDeleteMessage(message);
        }, 4000);
    }
}

function isValidMessage(message: Message): boolean {
    if (!message || message.type == MessageType.ThreadCreated || message.type == MessageType.ThreadStarterMessage) {
        return false
    }
    return true
}