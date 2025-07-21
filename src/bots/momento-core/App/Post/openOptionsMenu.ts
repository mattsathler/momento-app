import { ButtonBuilder, ButtonInteraction, ButtonStyle, MessageFlags, ModalSubmitInteraction } from "discord.js";
import { ICommand } from "../../Interfaces/ICommand";
import { IContext } from "../../Interfaces/IContext";
import { Permission } from "../../Interfaces/IPermission";
import { ActionRowBuilder } from "@discordjs/builders";
import { tryDeleteMessage } from "../../Utils/Messages";
import { User } from "src/shared/models/User";

export const openOptionsMenu: ICommand = {
    permission: Permission.user,
    isProfileCommand: true,
    exec: openOptionsMenuMessage
}

async function openOptionsMenuMessage(ctx: IContext, interaction: ButtonInteraction) {
    const interactionAuthor = await ctx.mongoService.getOne('users', { userId: interaction.user.id, guildId: interaction.guildId }) as User;
    const deleteButton = new ButtonBuilder()
        .setCustomId('deletePost')
        .setLabel('Apagar')
        .setStyle(ButtonStyle.Danger)

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(deleteButton)
    if (interactionAuthor.permission > Permission.moderator) {
        actionRow.addComponents(
            new ButtonBuilder()
                .setCustomId('reportPost')
                .setLabel('Denunciar')
                .setStyle(ButtonStyle.Danger)
        )
    }

    try {
        const reply = await interaction.reply({
            content: 'O que fazer com esse momento?',
            components: [actionRow],
            flags: MessageFlags.Ephemeral
        })
        if (interaction.isRepliable() && !interaction.deferred) {
            await interaction.deferUpdate();
        }
    }
    catch { return }
}