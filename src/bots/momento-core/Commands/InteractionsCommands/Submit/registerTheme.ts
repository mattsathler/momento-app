import { ComponentType, ContainerBuilder, Guild, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, ModalSubmitInteraction, SeparatorBuilder, SeparatorSpacingSize, TextChannel, TextDisplayBuilder } from "discord.js"
import { ICommand } from "../../../Interfaces/ICommand"
import { IContext } from "../../../Interfaces/IContext"
import { Permission } from "../../../Interfaces/IPermission"
import { StringValidator } from "../../../Utils/StringValidator"
import { Theme } from "src/shared/models/Theme"
import { MomentoService } from "src/shared/services/MomentoService"
import { drawProfileCanvas } from "src/shared/services/canvas/ProfileCanvas"
import { LinkService } from "src/shared/services/LinkService"
import { DefaultUser } from "src/shared/models/DefaultUser"
import "dotenv/config";

interface IFormFields {
    name: string | null,
    primary: string | null,
    secondary: string | null,
    background: string | null,
}

export const registerTheme: ICommand = {
    permission: Permission.user,
    isProfileCommand: false,
    reply: 'Criando seu tema, aguarde...',
    success: 'Tema criado com sucess!',
    deleteMessage: false,
    deleteReply: false,

    exec: async function (ctx: IContext, interaction: ModalSubmitInteraction): Promise<void> {
        await interaction.reply({ content: 'Criando seu tema, aguarde...', flags: MessageFlags.Ephemeral });

        if (!interaction) { throw new Error('Invalid interaction type') }
        if (!interaction.guild) { throw new Error('Invalid guild') }
        if (!interaction.isButton) { throw new Error('Invalid interaction type') }

        const response = fetchFormFields(interaction)
        if (!response) { throw new Error('Invalid form fields') }

        if (!response.name) {
            await interaction.editReply('Você precisa escolher um nome para seu tema!')
            throw new Error('Você precisa escolher um nome para seu tema!')
        }
        if (!response.primary) {
            await interaction.editReply('Você precisa escolher uma cor primária para seu tema!')
            throw new Error('Você precisa escolher uma cor primária para seu tema!')
        }
        if (!response.secondary) {
            await interaction.editReply('Você precisa escolher uma cor secundária para seu tema!')
            throw new Error('Você precisa escolher uma cor secundária para seu tema!')
        }
        if (!response.background) {
            await interaction.editReply('Você precisa escolher uma cor de background para seu tema!')
            throw new Error('Você precisa escolher uma cor de background para seu tema!')
        }
        if (String(response.name).split(' ').length > 1) {
            await interaction.editReply('O nome do tema não pode conter espaços!')
            throw new Error('O nome do tema não pode conter espaços!')
        }
        if (StringValidator.hasSpecialCharacters(response.name)) {
            await interaction.editReply('O nome do tema não pode conter caracteres especiais!')
            throw new Error('O nome do tema não pode conter caracteres especiais!')
        }
        if (!isHexColor(response.primary)) {
            await interaction.editReply('A cor primária precisa ser um código hexadecimal válido!')
            throw new Error('A cor primária precisa ser um código hexadecimal válido!')
        }
        if (!isHexColor(response.secondary)) {
            await interaction.editReply('A cor secundária precisa ser um código hexadecimal válido!')
            throw new Error('A cor secundária precisa ser um código hexadecimal válido!')
        }
        if (!isHexColor(response.background)) {
            await interaction.editReply('A cor de background precisa ser um código hexadecimal válido!')
            throw new Error('A cor de background precisa ser um código hexadecimal válido!')
        }
        if (StringValidator.hasEmoji(response.name)) {
            await interaction.editReply('O nome do tema não pode conter emojis!')
            throw new Error('O nome do tema não pode conter emojis!')
        }
        if (StringValidator.hasEmoji(response.primary)) {
            await interaction.editReply('A cor primária não pode conter emojis!')
            throw new Error('A cor primária não pode conter emojis!')
        }
        if (StringValidator.hasEmoji(response.secondary)) {
            await interaction.editReply('A cor secundária não pode conter emojis!')
            throw new Error('A cor secundária não pode conter emojis!')
        }
        if (StringValidator.hasEmoji(response.background)) {
            await interaction.editReply('A cor de background não pode conter emojis!')
            throw new Error('A cor de background não pode conter emojis!')
        }

        const isThemeNameAvailable = await checkThemeNameAvailability(ctx, response.name.toLowerCase())
        if (!isThemeNameAvailable) {
            await interaction.editReply('Já existe um tema com esse nome!')
            throw new Error('Já existe um tema com esse nome!')
        }

        const newTheme: Theme = {
            name: response.name.toLowerCase(),
            creatorId: interaction.user.id,
            is_system_theme: interaction.user.id === process.env.OWNER_ID,
            last_use: new Date(),
            colors: {
                primary: `#${response.primary.toUpperCase()}`,
                secondary: `#${response.secondary.toUpperCase()}`,
                background: `#${response.background.toUpperCase()}`,
            }
        }
        await createTheme(ctx, interaction.guild, newTheme)
        if (interaction.isRepliable()) {
            await interaction.editReply({ content: 'Seu tema foi criado com sucesso!' });
        }
        return
    }
}

function fetchFormFields(interaction: ModalSubmitInteraction): IFormFields {
    const nameField = interaction.fields.getField('name_field', ComponentType.TextInput).value;
    const primaryField = interaction.fields.getField('primary_field', ComponentType.TextInput).value;
    const secondaryField = interaction.fields.getField('secondary_field', ComponentType.TextInput).value;
    const backgroundField = interaction.fields.getField('background_field', ComponentType.TextInput).value;

    const response: IFormFields = {
        name: nameField !== '' ? nameField : null,
        primary: primaryField !== '' ? primaryField : null,
        secondary: secondaryField !== '' ? secondaryField : null,
        background: backgroundField !== '' ? backgroundField : null,
    }

    return response
}

async function checkThemeNameAvailability(ctx: IContext, name: string): Promise<boolean> {
    const theme = await ctx.mongoService.get('themes', { name: name });
    return theme.length > 0 ? false : true
}

async function createTheme(ctx: IContext, guild: Guild, theme: Theme) {
    await ctx.mongoService.post('themes', theme);
    await displayThemeInCatalogue(ctx, guild, theme);
    return
}

export async function displayThemeInCatalogue(ctx: IContext, guild: Guild, theme: Theme) {
    const hubGuildId = process.env.HUB_GUILD_ID;
    const hubGuild = await ctx.client.guilds.fetch(hubGuildId!);

    const themeUploaderChannelId = theme.is_system_theme ? process.env.HUB_SYSTEM_THEMES_CHANNEL_ID : process.env.HUB_THEMES_CHANNEL_ID
    const themeUploaderChannel = await hubGuild.channels.fetch(themeUploaderChannelId!) as TextChannel;
    const uploadChannel = await MomentoService.getUploadChannel(ctx.client);
    const postCount = 0;
    const trendingCount = 0;
    const newThemeProfile = await drawProfileCanvas(DefaultUser, uploadChannel, theme, postCount, trendingCount);
    const themeLink = await LinkService.uploadImageToMomento(uploadChannel, await newThemeProfile.toBuffer('jpeg'));

    const components = [
        new ContainerBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# ${theme.name} ${theme.is_system_theme ? "👑" : ""}`),
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
            )
            .addMediaGalleryComponents(
                new MediaGalleryBuilder()
                    .addItems(
                        new MediaGalleryItemBuilder()
                            .setURL(themeLink.attachments.first()?.url!),
                    ),
            )
    ];
    await themeUploaderChannel.send({
        flags: MessageFlags.IsComponentsV2,
        components: components
    });
}


function isHexColor(str: string): boolean {
    if (typeof str !== 'string') {
        return false;
    }

    if (str.length !== 6) {
        return false;
    }

    const hexDigits = '0123456789abcdefABCDEF';
    for (let i = 0; i < str.length; i++) {
        if (hexDigits.indexOf(str[i]) === -1) {
            return false;
        }
    }

    return true;
}