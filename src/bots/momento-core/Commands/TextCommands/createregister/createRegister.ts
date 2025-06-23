import { Permission } from "../../../Interfaces/IPermission"
import { ICommand } from "../../../Interfaces/ICommand"
import { IContext } from "../../../Interfaces/IContext"
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from "discord.js"

export const createRegister: ICommand = {
    reply: 'MOMENTO!',
    success: 'ESSE É O SEU MOMENTO!',
    permission: Permission.user,
    isProfileCommand: false,
    deleteMessage: true,
    deleteReply: true,

    exec: async function (ctx: IContext, message: Message): Promise<void> {
        createRegisterMessage(ctx, message);
    }
}

async function createRegisterMessage(ctx: IContext, message: Message) {
    if (message.author.id !== process.env.OWNER_ID) { return; }
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
}