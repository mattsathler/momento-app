import { ActionRowBuilder, ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ICommand } from "../../Interfaces/ICommand";
import { Permission } from "../../Interfaces/IPermission";
import { IContext } from "../../Interfaces/IContext";


export const openCollageModal: ICommand = {
    permission: Permission.user,
    isProfileCommand: false,
    exec: async (ctx: IContext, interaction: ButtonInteraction) => {
        const modal = createCollageModal()
        await interaction.showModal(modal)
    }
}

function createCollageModal(): ModalBuilder {
    const gridStyle = new TextInputBuilder()
        .setCustomId('grid_style')
        .setPlaceholder(`.div1 { grid-area: x / x / x / x; }\n.div2 { grid-area: x / x / x / x; }\n...`)
        .setRequired(false)
        .setStyle(TextInputStyle.Paragraph)
        .setLabel('Estilo do Grid')

    const AR1 = new ActionRowBuilder<TextInputBuilder>().addComponents(gridStyle)

    const modal = new ModalBuilder()
        .setTitle('Criar collage')
        .setCustomId('createCollage')
        .addComponents(AR1)

    return modal
}