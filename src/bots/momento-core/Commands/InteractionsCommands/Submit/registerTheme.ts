import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, Guild, ModalSubmitInteraction, TextChannel } from "discord.js"
import { ICommand } from "../../../Interfaces/ICommand"
import { IContext } from "../../../Interfaces/IContext"
import { Permission } from "../../../Interfaces/IPermission"
import { StringValidator } from "../../../Utils/StringValidator"
import { DefaultUser } from "../../../GuildDefaults/DefaultUser"
import { drawThemeInCanvas } from "../../../../../shared/services/canvas/Theme"
import { Theme } from "src/shared/models/Theme"
import { MomentoService } from "src/shared/services/MomentoService"
import { drawProfileCanvas } from "src/shared/services/canvas/ProfileCanvas"
import { drawCollageCanvas } from "src/shared/services/canvas/CollageCanvas"
import { defaultCollage } from "src/shared/models/Collage"
import { LinkService } from "src/shared/services/LinkService"
import { createThemeEmbed } from "src/shared/services/ThemeService"

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
        await interaction.reply({ content: 'Criando seu tema, aguarde...', ephemeral: true });

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

        const isThemeNameAvailable = await checkThemeNameAvailability(ctx, response.name)
        if (!isThemeNameAvailable) {
            await interaction.editReply('Já existe um tema com esse nome!')
            throw new Error('Já existe um tema com esse nome!')
        }

        const newTheme: Theme = {
            name: response.name.toLowerCase(),
            creatorId: interaction.user.id,
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
    const theme = await ctx.mongoService.getOne('themes', { name: name });
    return theme ? false : true
}

async function createTheme(ctx: IContext, guild: Guild, theme: Theme) {
    await ctx.mongoService.post('themes', theme);
    await displayThemeInCatalogue(ctx, guild, theme);
    return
}

export async function displayThemeInCatalogue(ctx: IContext, guild: Guild, theme: Theme) {
    const hubGuildId = process.env.HUB_GUILD_ID;
    const hubGuild = await ctx.client.guilds.fetch(hubGuildId!);

    const themeUploaderChannel = await hubGuild.channels.fetch(process.env.HUB_THEMES_CHANNEL_ID!) as TextChannel;
    const uploadChannel = await MomentoService.getUploadChannel(ctx.client);
    const postCount = 0;
    const trendingCount = 0;
    const newThemeProfile = await drawProfileCanvas(DefaultUser, uploadChannel, theme, postCount, trendingCount);
    const themeLink = await LinkService.uploadImageToMomento(uploadChannel, newThemeProfile.toBuffer());

    const themeEmbed = createThemeEmbed(guild.members.cache.get(theme.creatorId)?.displayName || 'Indisponível', theme).setImage(themeLink.attachments.first()?.url || '')

    await themeUploaderChannel.send({ embeds: [themeEmbed] });
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