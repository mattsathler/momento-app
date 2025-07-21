import { ActionRowBuilder, ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ICommand } from "../../Interfaces/ICommand";
import { Permission } from "../../Interfaces/IPermission";
import { IContext } from "../../Interfaces/IContext";


export const openPostModal: ICommand = {
    permission: Permission.user,
    isProfileCommand: true,
    exec: async (ctx: IContext, interaction: ButtonInteraction) => {
        const modal = createPostModal()
        await interaction.showModal(modal)
    }
}

function createPostModal(): ModalBuilder {
    const descriptionField = new TextInputBuilder()
        .setCustomId('description_field')
        .setPlaceholder('No que está pensando?')
        .setRequired(false)
        .setStyle(TextInputStyle.Paragraph)
        .setLabel('Descrição do Momento')
        .setMaxLength(366)

    const musicField = new TextInputBuilder()
        .setCustomId('music_field')
        .setPlaceholder('Uma música para seu momento!')
        .setRequired(false)
        .setStyle(TextInputStyle.Short)
        .setLabel('Música')

    const locationField = new TextInputBuilder()
        .setCustomId('location_field')
        .setPlaceholder('Uma local para seu momento!')
        .setRequired(false)
        .setStyle(TextInputStyle.Short)
        .setLabel('Localização')
        .setMaxLength(25)


    const AR1 = new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionField)
    const AR3 = new ActionRowBuilder<TextInputBuilder>().addComponents(musicField)
    const AR4 = new ActionRowBuilder<TextInputBuilder>().addComponents(locationField)

    const modal = new ModalBuilder()
        .setTitle('Criar momento')
        .setCustomId('createPost')
        .addComponents(AR1, AR3, AR4)

    return modal
}