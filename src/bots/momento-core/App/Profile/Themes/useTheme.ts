import { ButtonInteraction, MessageFlags } from "discord.js";
import { IContext } from "../../../Interfaces/IContext";
import { TextChannel } from "discord.js";
import { ICommand } from "../../../Interfaces/ICommand";
import { Permission } from "../../../Interfaces/IPermission";
import { ProfileServices } from "../../../Utils/ProfileServices";
import { NotificationType } from "../../../Interfaces/INotification";
import { tryDeleteMessage } from "../../../Utils/Messages";
import { NotificationService } from "../../../../../shared/services/NotificationService";
import { Theme } from "src/shared/models/Theme";
import { User } from "src/shared/models/User";

export const useTheme: ICommand = {
    isProfileCommand: false,
    permission: Permission.user,
    exec: async (ctx: IContext, interaction: ButtonInteraction) => {

        const themeName = interaction.message.embeds[0].fields.find(field => field.name === 'Nome')?.value;
        if (!themeName) { throw new Error('Invalid theme name') }

        const theme = await ctx.mongoService.getOne('themes', { name: themeName }) as Theme;
        if (!theme) {
            tryDeleteMessage(interaction.message);
            throw new Error('Esse tema não está mais disponível')
        }

        await interaction.reply({content: "Esse método está defasado! Acesse o HUB do momento para alterar o tema.", flags: MessageFlags.Ephemeral});
        return;
    }
}