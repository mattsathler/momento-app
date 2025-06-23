import { ButtonInteraction } from "discord.js";
import { IContext } from "../../../../Interfaces/IContext";
import { ICommand } from "../../../../Interfaces/ICommand";
import { Permission } from "../../../../Interfaces/IPermission";
import { tryDeleteMessage } from "../../../../Utils/Messages";

export const deleteMessage: ICommand = {
    permission: Permission.user,
    isProfileCommand: true,
    exec: async (ctx: IContext, interaction: ButtonInteraction) => {
        if (!interaction.deferred) {
            await interaction.deferUpdate();
        }
        await tryDeleteMessage(interaction.message);
        return;
    }
}
