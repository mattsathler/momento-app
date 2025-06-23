import { Permission } from "../../../Interfaces/IPermission"
import { ICommand } from "../../../Interfaces/ICommand"
import { IContext } from "../../../Interfaces/IContext"
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildEmoji, GuildEmojiManager, Message, TextChannel } from "discord.js"
import { displayThemeInCatalogue } from "../../InteractionsCommands/Submit/registerTheme"
import { Theme } from "src/shared/models/Theme"

export const sample: ICommand = {
    reply: 'MOMENTO!',
    success: 'ESSE É O SEU MOMENTO!',
    permission: Permission.user,
    isProfileCommand: false,
    deleteMessage: false,
    deleteReply: false,

    exec: async function (ctx: IContext, message: Message): Promise<void> {
        await sendThemes(ctx, message)
    }
}

async function sendThemes(ctx: IContext, message: Message) {
    const themes = await ctx.mongoService.get('themes', {}) as Theme[];
    themes.forEach(async theme => {
        if (!message.guild) return;
        await displayThemeInCatalogue(ctx, message.guild, theme)
    })
}

async function createRegister(ctx: IContext, message: Message) {
    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('openRegisterModal')
            .setLabel('REGISTRAR-SE')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('✨'),
        new ButtonBuilder()
            .setCustomId('redeemUser')
            .setLabel('PERDI ACESSO AO MEU PERFIL')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🔧'),
        new ButtonBuilder()
            .setCustomId('openThemeModal')
            .setLabel('CRIAR TEMA')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🖌️'),
        new ButtonBuilder()
            .setCustomId('openCollageModal')
            .setLabel('CRIAR COLLAGE')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🪟'),
        new ButtonBuilder()
            .setLabel('SAIBA MAIS')
            .setStyle(ButtonStyle.Link)
            .setEmoji('🔗')
            .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    );

    await message.reply({
        content: 'Clique no botão abaixo para se registrar',
        components: [actionRow]
    })

    console.log('done')
}