import { ActionRowBuilder, ButtonInteraction, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ICommand } from "../../Interfaces/ICommand";
import { Permission } from "../../Interfaces/IPermission";
import { IContext } from "../../Interfaces/IContext";


export const openConfigurePostsModal: ICommand = {
    permission: Permission.moderator,
    isProfileCommand: false,
    exec: async (ctx: IContext, interaction: ButtonInteraction) => {
        const modal = createPostsConfigurationModal(ctx, interaction)
        await interaction.showModal(modal)
    }
}

function createPostsConfigurationModal(ctx: IContext, interaction: Interaction): ModalBuilder {
    const likesToTrendField = new TextInputBuilder()
        .setCustomId('likesToTrendField')
        .setPlaceholder(`Quantos likes para o trend? Atual: ${ctx.serverConfig?.analytics.likesToTrend || '?'}`)
        .setRequired(false)
        .setStyle(TextInputStyle.Short)
        .setLabel(`Likes para Trending`)

    const momentosToVerifyField = new TextInputBuilder()
        .setCustomId(`momentosToVerifyField`)
        .setPlaceholder(`Quantos posts para virar verificado? Atual: ${ctx.serverConfig?.analytics.momentosToVerify || '?'}`)
        .setRequired(false)
        .setStyle(TextInputStyle.Short)
        .setLabel(`Momentos para Verificado`)

    const followersToVerifyField = new TextInputBuilder()
        .setCustomId(`followersToVerifyField`)
        .setPlaceholder(`Quantos seguidores para virar verificado? Atual: ${ctx.serverConfig?.analytics.followersToVerify || '?'}`)
        .setRequired(false)
        .setStyle(TextInputStyle.Short)
        .setLabel(`Seguidores para Verificado`)

    const trendsToVerifyField = new TextInputBuilder()
        .setCustomId(`trendsToVerifyField`)
        .setPlaceholder(`Quantas trends para virar verificado? Atual: ${ctx.serverConfig?.analytics.trendsToVerify || '?'}`)
        .setRequired(false)
        .setStyle(TextInputStyle.Short)
        .setLabel(`Momentos para Verificado`)

    const AR1 = new ActionRowBuilder<TextInputBuilder>().addComponents(likesToTrendField)
    const AR2 = new ActionRowBuilder<TextInputBuilder>().addComponents(momentosToVerifyField)
    const AR3 = new ActionRowBuilder<TextInputBuilder>().addComponents(followersToVerifyField)
    const AR4 = new ActionRowBuilder<TextInputBuilder>().addComponents(trendsToVerifyField)

    const modal = new ModalBuilder()
        .setTitle(`Configurar Analytics`)
        .setCustomId(`configurePosts`)
        .addComponents(AR1, AR2, AR3, AR4)

    return modal
}