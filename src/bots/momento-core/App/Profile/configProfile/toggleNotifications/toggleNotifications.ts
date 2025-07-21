import { ButtonBuilder, ButtonInteraction, ButtonStyle, Embed, EmbedBuilder } from "discord.js";
import { ICommand } from "../../../../Interfaces/ICommand";
import { IContext } from "../../../../Interfaces/IContext";
import { Permission } from "../../../../Interfaces/IPermission";
import { NotificationService } from "../../../../../../shared/services/NotificationService";
import { NotificationType } from "../../../../Interfaces/INotification";
import { ProfileServices } from "../../../../Utils/ProfileServices";
import { User } from "src/shared/models/User";

export const toggleNotifications: ICommand = {
    permission: Permission.user,
    isProfileCommand: true,
    exec: async (ctx: IContext, interaction: ButtonInteraction) => {
        try {
            if (!interaction.guildId) { throw new Error('Invalid interaction type') }
            const author = await fetchAuthor(ctx, interaction.user.id, interaction.guildId)
            if (!author) { throw new Error('Invalid author') }

            author.stats.notifications = !author.stats.notifications;
            await ctx.mongoService.patch('users', { userId: author.userId, guildId: author.guildId }, { 'stats.notifications': author.stats.notifications })
            const notificationsService = new NotificationService(ctx);

            const profileService = new ProfileServices();
            const newButtons = await profileService.createEditProfileButtons(author);

            await interaction.update(
                {
                    components: [newButtons]
                }
            );
            await notificationsService.sendNotification(author, {
                type: NotificationType.Embed,
                targetUser: author,
                message: `Você ${author.stats.notifications ? 'ativou' : 'desativou'} as suas notificações!`
            }, true);
        }
        catch (err: any) {
            console.log(err)
            await interaction.reply({
                content: 'A interação falhou! - ' + err.message,
                ephemeral: true
            })
        }
    }
}

async function fetchAuthor(ctx: IContext, userId: string, guildId: string): Promise<User> {
    return ctx.mongoService.getOne('users', { userId: userId, guildId: guildId })
}