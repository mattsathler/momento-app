import { ButtonBuilder, ButtonInteraction, ButtonStyle, ModalSubmitInteraction } from "discord.js";
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


    const cancelButton = new ButtonBuilder()
        .setCustomId('backButton')
        .setLabel('Voltar')
        .setStyle(ButtonStyle.Secondary)

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(deleteButton)
    if (interactionAuthor.permission > Permission.moderator) {
        actionRow.addComponents(
            new ButtonBuilder()
                .setCustomId('reportPost')
                .setLabel('Denunciar')
                .setStyle(ButtonStyle.Danger)
        )
    }
    actionRow.addComponents(cancelButton)

    try {
        const reply = await interaction.message.reply({
            content: 'O que fazer com esse momento?',
            components: [actionRow],
        })
        if(interaction.isRepliable() && !interaction.deferred) { 
            await interaction.deferUpdate();
        }
        setTimeout(() => {
            tryDeleteMessage(reply);
        }, 6000);
    }
    catch { return }
}