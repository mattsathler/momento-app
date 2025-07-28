import { ComponentType, Message, ModalSubmitInteraction } from "discord.js";
import { ICommand } from "../../Interfaces/ICommand";
import { Permission } from "../../Interfaces/IPermission";
import { IContext } from "../../Interfaces/IContext";
import { IPost, IPostStatus } from "../../Interfaces/IPost";
import { PostService } from "./PostService";
import { validateImageURL } from "../../Utils/Pictures";
import { loadImage } from "skia-canvas";
import { ImageCropper } from "../../Utils/ImageCropper";
import { IServer } from "../../Interfaces/IServer";
import { defaultTheme, Theme } from "src/shared/models/Theme";
import { LinkService } from "src/shared/services/LinkService";
import { MomentoService } from "src/shared/services/MomentoService";
import { User } from "src/shared/models/User";

interface PostFields {
    url: string | null,
    description: string | null,
    music: string | null,
    location: string | null,
}

export const createPost: ICommand = {
    permission: Permission.user,
    isProfileCommand: true,
    reply: 'Criando seu momento',
    success: 'Momento postado com sucesso!',
    exec: createNewPost
}

async function createNewPost(ctx: IContext, interaction: ModalSubmitInteraction) {
    const serverConfig = await ctx.mongoService.getOne('servers', { id: interaction.guildId }) as IServer;
    ctx.serverConfig = serverConfig;

    if (!interaction.guild) { throw new Error('Invalid guild') };
    if (!ctx.serverConfig) { throw new Error('Invalid server config') };
    const author = await ctx.mongoService.getOne('users', { userId: interaction.user.id, guildId: interaction.guildId }) as User;
    if (!author) { throw new Error('Invalid author') }

    const theme = await ctx.mongoService.getOne('themes', { name: author.styles.theme }) as Theme;
    author.styles.fonts = author.styles.fonts;

    const formField = fetchFormFields(interaction);
    let imageMsg: Message | null = null;
    if (!formField) { throw new Error('Informações inválidas! Você precisa de um link de imagem ou descrição para postar!') }
    if (formField.url) {
        const url = LinkService.treatUrlForPost(formField.url)
        const isValid = await validateImageURL(url)
        if (!isValid) {
            throw new Error('Foto inválida! Tente outro link.');
        }
        try {
            const image = await loadImage(url)
            const uploadChannel = await MomentoService.getUploadChannel(ctx.client);
            imageMsg = await LinkService.uploadImageToMomento(uploadChannel, await ImageCropper.cropImage(image).toBuffer("png"))
        }
        catch (err) {
            console.log(err);
        }
    }
    if (interaction.isRepliable()) {
        await interaction.reply({ content: 'Criando seu momento...', ephemeral: true })
    }
    const postService = new PostService(ctx);

    if (!author.guildId) { throw new Error('Invalid author guild id') }
    if (!author.references.channelId) { throw new Error('Invalid author channel id') }

    if (!interaction.message) return;

    const post: IPost = {
        content: {
            images: imageMsg?.url ? [imageMsg.url] : undefined,
            description: formField.description ?? '',
            music: formField.music ?? undefined,
            location: formField.location ?? undefined,
            imagesCount: 1
        },
        references: {
            ownerId: author.userId,
            channelId: author.references.channelId,
            guildId: author.guildId,
            messageId: null,
        },
        stats: {
            type: imageMsg?.url ? 'image' : 'text',
            likes: [],
            date: new Date(),
            status: IPostStatus.active,
            isTrending: false,
            isRepost: false,
        }
    }
    await postService.createImagePost(interaction.message, post, author, theme);
    if (interaction.isRepliable()) {
        await interaction.editReply({ content: 'Momento postado com sucesso!' })
    }
    return
}

function fetchFormFields(interaction: ModalSubmitInteraction): PostFields | null {
    const pictureURLField = interaction.fields.getField('url_field', ComponentType.TextInput).value
    const descriptionField = interaction.fields.getField('description_field', ComponentType.TextInput).value
    const musicField = interaction.fields.getField('music_field', ComponentType.TextInput).value
    const locationField = interaction.fields.getField('location_field', ComponentType.TextInput).value

    const url = pictureURLField.length > 0 ? pictureURLField : null;
    const description = descriptionField.length > 0 ? descriptionField : null;
    const music = musicField.length > 0 ? musicField : null;
    const location = locationField.length > 0 ? locationField : null;

    if (!url && !description) { return null }
    return { url, description, music, location }
}
