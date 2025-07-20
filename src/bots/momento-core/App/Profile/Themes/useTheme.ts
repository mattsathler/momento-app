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
        await interaction.reply({ content: "Esse método está defasado! Acesse o HUB para ter acesso a biblioteca de temas e fontes", flags: MessageFlags.Ephemeral });
        return;
    }
}