import { ButtonInteraction } from "discord.js";
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

        await interaction.reply({
            content: 'Aplicando o tema, aguarde...',
            ephemeral: true
        })

        const user = await ctx.mongoService.getOne('users', { userId: interaction.user.id, guildId: interaction.guildId }) as User;
        if (!user) { throw new Error('Invalid user') }

        const updatedUser = await ctx.mongoService.patch('users', { userId: user.userId, guildId: user.guildId }, { 'styles.theme': theme.name }) as User;
        const profileServices = new ProfileServices();
        const notificationService = new NotificationService(ctx);
        await profileServices.updateProfilePictures(ctx, updatedUser, true, true);
        await notificationService.sendNotification(user,
            {
                type: NotificationType.Embed,
                targetUser: user,
                message: 'Tema aplicado com sucesso!'
            }, true
        )
        if (interaction.isRepliable()) {
            await interaction.editReply({
                content: 'Tema aplicado com sucesso!',
            })
        }
        return;
    }
}