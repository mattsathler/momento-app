import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, MessageFlags, ModalSubmitInteraction } from "discord.js";
import { ICommand } from "../../../Interfaces/ICommand";
import { Permission } from "../../../Interfaces/IPermission";
import { IContext } from "../../../Interfaces/IContext";
import { tryDeleteMessage } from "../../../Utils/Messages";
import { ProfileServices } from "../../../Utils/ProfileServices";
import { User } from "src/shared/models/User";

export const openProfileConfigurations: ICommand = {
    permission: Permission.user,
    isProfileCommand: true,
    exec: openProfileConfigurationsMenu
}

async function openProfileConfigurationsMenu(ctx: IContext, interaction: ButtonInteraction) {
    const interactionAuthor = await ctx.mongoService.getOne('users', { userId: interaction.user.id, guildId: interaction.guildId }) as User;
    const profileService = new ProfileServices;
    const profileButtonsActionRow = await profileService.createEditProfileButtons(interactionAuthor);
    try {
        const embed = new EmbedBuilder()
            .setColor('#DD247B')
            .setTitle('Configurações do perfil')
            .setDescription('Selecione uma opção abaixo para editar seu perfil.')

        if (interaction && !interaction.deferred && interaction.isRepliable()) {
            const reply = await interaction.reply({
                embeds: [embed],
                components: [profileButtonsActionRow],
                flags: MessageFlags.Ephemeral
            })
            await interaction.deferUpdate();
        }
    }
    catch (err) {
        console.log(err)
    }
}