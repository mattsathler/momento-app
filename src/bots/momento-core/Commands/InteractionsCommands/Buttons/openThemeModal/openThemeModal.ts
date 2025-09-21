import { ActionRowBuilder, ButtonInteraction, MessageFlags, ModalBuilder, Options, TextInputBuilder, TextInputStyle } from "discord.js";
import { IContext } from "../../../../Interfaces/IContext";
import { ICommand } from "../../../../Interfaces/ICommand";
import { Permission } from "../../../../Interfaces/IPermission";
import { User } from "src/shared/models/user";
import { MomentoService } from "src/shared/services/MomentoService";

export const openThemeModal: ICommand = {
    permission: Permission.user,
    isProfileCommand: false,
    exec: async (ctx: IContext, interaction: ButtonInteraction) => {
        const user: User = await ctx.mongoService.getOne("users", { userId: interaction.user.id }) as User;

        if (MomentoService.isUserVerified(user.stats.isVerified)) {
            const modal = createThemeModal()
            await interaction.showModal(modal)
        } else {
            await interaction.reply({ content: "Esse conteúdo é exclusivo apenas para verificados no momento! Confira: <#1390674632016658585>", flags: MessageFlags.Ephemeral });
        }
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
        
    const profileImageField = new TextInputBuilder()
        .setCustomId('profile_background_field')
        .setPlaceholder('A IMAGEM DE FUNDO DO PERFIL (opcional)')
        .setRequired(false)
        .setStyle(TextInputStyle.Short)
        .setLabel('IMAGEM DE FUNDO DO PERFIL')

    const collageImageField = new TextInputBuilder()
        .setCustomId('collage_background_field')
        .setPlaceholder('A IMAGEM DE FUNDO DO COLLAGE (opcional)')
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setLabel('IMAGEM DE FUNDO DO COLLAGE')



    const AR1 = new ActionRowBuilder<TextInputBuilder>().addComponents(nameField)
    const AR2 = new ActionRowBuilder<TextInputBuilder>().addComponents(primaryField)
    const AR3 = new ActionRowBuilder<TextInputBuilder>().addComponents(secondaryField)
    const AR4 = new ActionRowBuilder<TextInputBuilder>().addComponents(backgroundField)
    const AR5 = new ActionRowBuilder<TextInputBuilder>().addComponents(profileImageField)

    const modal = new ModalBuilder()
        .setTitle('Criar tema')
        .setCustomId('registerTheme')
        .setComponents(
            AR1, AR2, AR3, AR4, AR5
        )

    return modal
}