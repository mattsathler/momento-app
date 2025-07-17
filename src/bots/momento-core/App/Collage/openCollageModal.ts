import { ActionRowBuilder, ButtonInteraction, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ICommand } from "../../Interfaces/ICommand";
import { Permission } from "../../Interfaces/IPermission";
import { IContext } from "../../Interfaces/IContext";
import { User } from "src/shared/models/user";
import { MomentoService } from "src/shared/services/MomentoService";


export const openCollageModal: ICommand = {
    permission: Permission.user,
    isProfileCommand: false,
    exec: async (ctx: IContext, interaction: ButtonInteraction) => {
        const user: User = await ctx.mongoService.getOne("users", { userId: interaction.user.id }) as User;

        if (MomentoService.isUserVerified(user.stats.isVerified)) {
            const modal = createCollageModal()
            await interaction.showModal(modal)

        } else {
            await interaction.reply({ content: "Esse conteúdo é exclusivo apenas para verificados no momento! Confira: <#1390674632016658585>", flags: MessageFlags.Ephemeral });
        }
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