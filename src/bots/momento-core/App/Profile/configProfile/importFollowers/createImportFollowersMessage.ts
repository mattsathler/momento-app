import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, Embed, EmbedBuilder, MessageFlags, SelectMenuInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { ICommand } from "../../../../Interfaces/ICommand";
import { IContext } from "../../../../Interfaces/IContext";
import { Permission } from "../../../../Interfaces/IPermission";
import { NotificationService } from "../../../../../../shared/services/NotificationService";
import { ProfileServices } from "../../../../Utils/ProfileServices";
import { tryDeleteMessage } from "../../../../Utils/Messages";
import { User } from "src/shared/models/User";
import { NotificationType } from "src/bots/momento-core/Interfaces/INotification";

export const createImportFollowersMessage: ICommand = {
    permission: Permission.user,
    isProfileCommand: true,
    exec: async (ctx: IContext, interaction: ButtonInteraction) => {
        let accounts: User[] = await ctx.mongoService.get("users", {
            userId: interaction.user.id
        })

        let user = accounts.find(user => (user.guildId === interaction.guildId));
        accounts = accounts.filter(account => account.guildId !== interaction.guildId);

        if (!user || accounts.length < 1) {
            await interaction.reply({ content: "Você não possui outras contas no momento.", flags: MessageFlags.Ephemeral });
            return;
        }

        const checkedUser = user;

        accounts = accounts.filter(account => account.stats.followers > checkedUser.stats.followers);

        if (accounts.length < 1) {
            await interaction.reply({ content: "Só é possível importar seguidores caso possua uma conta com mais seguidores que essa.", flags: MessageFlags.Ephemeral });
            return;
        }

        const importFollowersSelect = new StringSelectMenuBuilder()
            .setCustomId("accounts")
            .setPlaceholder("Escolha uma conta de outro RPG")

        accounts.forEach(account => {
            importFollowersSelect.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`@${account.username} | ${account.name} ${account.surname} - ${account.stats.followers} seguidores`)
                    .setValue(String(account.stats.followers))
                    .setEmoji("🫂")
            )
        })

        const row1 = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(importFollowersSelect)

        const response = await interaction.reply({ components: [row1], flags: MessageFlags.Ephemeral, fetchReply: true });
        const collector = response.channel.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 60000
        });
        collector.on('collect', async (i: SelectMenuInteraction) => {
            try {
                if (i.user.id !== user?.userId) {
                    await i.editReply({ content: "Você não tem permissões para alterar esse perfil!", components: [] })
                };

                const selection = i.values[0];

                await ctx.mongoService.patch('users', {
                    userId: interaction.user.id,
                    guildId: interaction.guildId
                }, {
                    'stats.followers': Number(selection)
                })

                const profileService = new ProfileServices();
                user.stats.followers = Number(selection);

                await profileService.updateProfilePictures(ctx, user, true, false);

                const notificationService = new NotificationService(ctx);
                await notificationService.sendNotification(user, {
                    targetUser: user,
                    type: NotificationType.Embed,
                    message: `Você importou ${selection} seguidores de seu outro perfil do momento!`,
                })

                await i.deferUpdate();
                await i.editReply({ content: 'Seguidores importados com sucesso!', attachments: [], components: [] });
            }
            catch (error) {
                console.log(error)
            }
        });

    }
}