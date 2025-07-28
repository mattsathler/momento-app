import { ButtonInteraction, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputStyle, UserSelectMenuBuilder } from "discord.js";
import { IContext } from "../../../../Interfaces/IContext";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from "@discordjs/builders";
import { ICommand } from "../../../../Interfaces/ICommand";
import { Permission } from "../../../../Interfaces/IPermission";
import { User } from "src/shared/models/User";
import { MomentoService } from "src/shared/services/MomentoService";

export const openStyleProfileModal: ICommand = {
    permission: Permission.user,
    isProfileCommand: true,
    exec: async (ctx: IContext, interaction: ButtonInteraction) => {
        try {
            if (!interaction.guildId) { throw new Error('Invalid interaction type') }
            const author = await fetchAuthor(ctx, interaction.user.id, interaction.guildId)
            if (!author) { throw new Error('Invalid author') }
            const collagesCount = await fetchCollageListCount(ctx);
            const modal = createStyleProfileModal(author, collagesCount)
            await interaction.showModal(modal)
        }
        catch (err: any) {
            console.log(err)
            await interaction.reply({
                content: 'A interação falhou! - ' + err.message,
                flags: MessageFlags.Ephemeral
            })
        }
    }
}

function createStyleProfileModal(author: User, collagesCount: number): ModalBuilder {
    const collageStyleField = new TextInputBuilder()
        .setCustomId('collage_style_field')
        .setPlaceholder((author.styles.collage).toString())
        .setRequired(false)
        .setStyle(TextInputStyle.Short)
        .setLabel('Estilo de colagem (1 a ' + (collagesCount) + ')')
        .setMinLength(1)
        .setMaxLength(collagesCount.toString().length)

    const themeField = new TextInputBuilder()
        .setCustomId('theme_field')
        .setPlaceholder(MomentoService.isUserVerified(author.stats.isVerified) ? author.styles.theme : "Apenas para temas do sistema")
        .setRequired(false)
        .setStyle(TextInputStyle.Short)
        .setLabel('Tema do Perfil')
        .setMinLength(4)
        .setMaxLength(14)

    const primaryFontField = new TextInputBuilder()
        .setCustomId('primary_font_field')
        .setPlaceholder(MomentoService.isUserVerified(author.stats.isVerified) ? author.styles.fonts.primary : "Apenas para verificados 👑")
        .setRequired(false)
        .setStyle(TextInputStyle.Short)
        .setLabel('Fonte Primária 👑')
        .setMinLength(4)
        .setMaxLength(14)

    const secondaryFontField = new TextInputBuilder()
        .setCustomId('secondary_font_field')
        .setPlaceholder(MomentoService.isUserVerified(author.stats.isVerified) ? author.styles.fonts.secondary : "Apenas para verificados 👑")
        .setRequired(false)
        .setStyle(TextInputStyle.Short)
        .setLabel('Fonte Secundária 👑')
        .setMinLength(4)
        .setMaxLength(14)

    const AR1 = new ActionRowBuilder<TextInputBuilder>().addComponents(collageStyleField)
    const AR2 = new ActionRowBuilder<TextInputBuilder>().addComponents(themeField)
    const AR3 = new ActionRowBuilder<TextInputBuilder>().addComponents(primaryFontField)
    const AR4 = new ActionRowBuilder<TextInputBuilder>().addComponents(secondaryFontField)

    const modal = new ModalBuilder()
        .setTitle('Estilizar Perfil')
        .setCustomId('styleUser')
        .addComponents(AR1, AR2)

    if (MomentoService.isUserVerified(author.stats.isVerified)) {
        modal.addComponents(AR3, AR4);
    }

    return modal
}

async function fetchAuthor(ctx: IContext, userId: string, guildId: string): Promise<User> {
    return ctx.mongoService.getOne('users', { userId: userId, guildId: guildId })
}

async function fetchCollageListCount(ctx: IContext): Promise<number> {
    const count: number = await ctx.mongoService.count('collages', {}) as number
    return count
}