import { ActionRowBuilder, ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { IContext } from "../../../../Interfaces/IContext";
import { ICommand } from "../../../../Interfaces/ICommand";
import { Permission } from "../../../../Interfaces/IPermission";

export const openThemeModal: ICommand = {
    permission: Permission.user,
    isProfileCommand: false,
    exec: async (ctx: IContext, interaction: ButtonInteraction) => {
        try {
            const userAlreadyRegistered = await ctx.mongoService.getOne('users', { userId: interaction.user.id, guildId: interaction.guildId })
            if (!userAlreadyRegistered) { throw new Error('Você precisa estar cadastrado para criar um tema!') }
        }
        catch (err: any) {
            await interaction.reply({ content: err.message, ephemeral: true })
            return
        }
        const modal = createThemeModal()
        await interaction.showModal(modal)
    }
}

function createThemeModal(): ModalBuilder {
    const nameField = new TextInputBuilder()
        .setCustomId('name_field')
        .setPlaceholder('Digite um nome para seu tema')
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setLabel('Nome do tema')
        .setMinLength(4)
        .setMaxLength(12)

    const primaryField = new TextInputBuilder()
        .setCustomId('primary_field')
        .setPlaceholder('A COR DE TEXTO (HEX)')
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setLabel('PRIMÁRIA')
        .setMinLength(6)
        .setMaxLength(6)

    const secondaryField = new TextInputBuilder()
        .setCustomId('secondary_field')
        .setPlaceholder('A COR SECUNDÁRIA DE TEXTO (HEX)')
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setLabel('SECUNDÁRIA')
        .setMinLength(6)
        .setMaxLength(6)

    const backgroundField = new TextInputBuilder()
        .setCustomId('background_field')
        .setPlaceholder('A COR DE FUNDO DO PERFIL (HEX)')
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setLabel('BACKGROUND')
        .setMinLength(6)
        .setMaxLength(6)


    const AR1 = new ActionRowBuilder<TextInputBuilder>().addComponents(nameField)
    const AR2 = new ActionRowBuilder<TextInputBuilder>().addComponents(primaryField)
    const AR3 = new ActionRowBuilder<TextInputBuilder>().addComponents(secondaryField)
    const AR4 = new ActionRowBuilder<TextInputBuilder>().addComponents(backgroundField)

    const modal = new ModalBuilder()
        .setTitle('Criar tema')
        .setCustomId('registerTheme')
        .addComponents(AR1, AR2, AR3, AR4)

    return modal
}