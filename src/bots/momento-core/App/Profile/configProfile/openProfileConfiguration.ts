import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, ModalSubmitInteraction } from "discord.js";
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
        const cancelButton = new ButtonBuilder()
            .setCustomId('backButton')
            .setLabel('Voltar')
            .setStyle(ButtonStyle.Secondary)

        profileButtonsActionRow.addComponents(cancelButton)

        const embed = new EmbedBuilder()
            .setColor('#DD247B')
            .setTitle('Configurações do perfil')
            .setDescription('Selecione uma opção abaixo para editar seu perfil.')

        if (interaction && !interaction.deferred && interaction.isRepliable()) {
            const reply = await interaction.message.reply({
                embeds: [embed],
                components: [profileButtonsActionRow],
            })
            await interaction.deferUpdate();

            setTimeout(() => {
                tryDeleteMessage(reply);
            }, 6000);
        }
    }
    catch (err) {
        console.log(err)
    }
}