import { ActionRowBuilder, ButtonInteraction, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ICommand } from "../../Interfaces/ICommand";
import { Permission } from "../../Interfaces/IPermission";
import { IContext } from "../../Interfaces/IContext";


export const openConfigurePostsModal: ICommand = {
    permission: Permission.moderator,
    isProfileCommand: false,
    exec: async (ctx: IContext, interaction: ButtonInteraction) => {
        const modal = createPostsConfigurationModal(ctx);
        await interaction.showModal(modal)
    }
}

function createPostsConfigurationModal(ctx: IContext): ModalBuilder {
    const likesToTrendField = new TextInputBuilder()
        .setCustomId('likesToTrendField')
        .setPlaceholder(`Quantos likes para o trend? Atual: ${ctx.serverConfig?.analytics.likesToTrend || '?'}`)
        .setRequired(false)
        .setStyle(TextInputStyle.Short)
        .setLabel(`Likes para Trending`)

    const AR1 = new ActionRowBuilder<TextInputBuilder>().addComponents(likesToTrendField);

    const modal = new ModalBuilder()
        .setTitle(`Configurar Analytics`)
        .setCustomId(`configurePosts`)
        .addComponents(AR1)

    return modal
}