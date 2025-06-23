import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, Embed, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { ICommand } from "../../../../Interfaces/ICommand";
import { IContext } from "../../../../Interfaces/IContext";
import { Permission } from "../../../../Interfaces/IPermission";
import { NotificationService } from "../../../../../../shared/services/NotificationService";
import { ProfileServices } from "../../../../Utils/ProfileServices";
import { tryDeleteMessage } from "../../../../Utils/Messages";
import { User } from "src/shared/models/User";

export const createImportFollowersMessage: ICommand = {
    permission: Permission.user,
    isProfileCommand: true,
    exec: async (ctx: IContext, interaction: ButtonInteraction) => {
        let accounts: User[] = await ctx.mongoService.get("users", {
            userId: interaction.user.id
        })

        let user = accounts.find(user => (user.guildId === interaction.guildId));
        accounts = accounts.filter(account => account.guildId !== interaction.guildId);

        if (!user) {
            await interaction.reply({ content: "Você não possui outras contas no momento.", ephemeral: true });
            return;
        }

        if (accounts.length < 1) {
            await interaction.reply({ content: "Você não possui outras contas no momento.", ephemeral: true });
            return;
        }
        
        const checkedUser = user;

        accounts = accounts.filter(account => account.stats.followers > checkedUser.stats.followers);

        if (accounts.length < 1) {
            await interaction.reply({ content: "Só é possível importar seguidores caso possua uma conta com mais seguidores que essa.", ephemeral: true });
            return;
        }
        const followersBefore: number = user.stats.followers;

        const importFollowersSelect = new StringSelectMenuBuilder()
            .setCustomId("accounts")
            .setPlaceholder("Escolha uma conta de outro RPG")

        importFollowersSelect.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Cancelar')
                .setValue("cancel")
                .setEmoji("❌")
        )
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

        const row2 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('deleteMessage')
                    .setLabel('Cancelar')
                    .setStyle(ButtonStyle.Secondary)
            )
        const response = await interaction.reply({ components: [row1, row2] })

        let collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });

        collector.on('collect', async i => {
            try {
                const message = await response.fetch()
                if (i.user.id !== user?.userId) {
                    await i.reply({content: "Você não tem permissões para alterar esse perfil!", ephemeral: true})
                };
                const selection = i.values[0];

                if (selection === 'cancel') {
                    await tryDeleteMessage(message);
                    return;
                }

                await ctx.mongoService.patch('users', {
                    userId: interaction.user.id,
                    guildId: interaction.guildId
                }, {
                    'stats.followers': Number(selection)
                })


                if (!user || accounts.length < 1) {
                    await interaction.reply({ content: "Você não possui outras contas no momento.", ephemeral: true });
                    return;
                };

                const profileService = new ProfileServices();
                user.stats.followers = Number(selection);
                await tryDeleteMessage(message);
                await tryDeleteMessage(interaction.message);
                await profileService.updateProfilePictures(ctx, user, true, false);

                const notificationService = new NotificationService(ctx);
                await notificationService.sendEmbedNotification(user,
                    new EmbedBuilder()
                        .setAuthor({
                            name: "MOMENTO",
                            iconURL: "https://imgur.com/diuZwFL.png",
                        })
                        .setColor("#dd247b")
                        .setTitle("Seguidores Importados")
                        .setDescription(`Você importou ${selection} seguidores de seu outro perfil do momento!`)
                        .setFooter({
                            text: `Antes, você tinha: ${followersBefore} seguidores`
                        })
                )
            }
            catch { }
        });
    }
}