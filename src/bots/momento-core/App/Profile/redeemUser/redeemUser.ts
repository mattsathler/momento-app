import { ButtonInteraction } from "discord.js";
import { IContext } from "../../../Interfaces/IContext";
import { TextChannel } from "discord.js";
import { ICommand } from "../../../Interfaces/ICommand";
import { Permission } from "../../../Interfaces/IPermission";
import { ProfileServices } from "../../../Utils/ProfileServices";
import { NotificationType } from "../../../Interfaces/INotification";
import { User } from "src/shared/models/User";
import { defaultTheme, Theme } from "src/shared/models/Theme";
import { Collage, defaultCollage } from "src/shared/models/Collage";
import { MomentoService } from "src/shared/services/MomentoService";

export const redeemUser: ICommand = {
    isProfileCommand: false,
    permission: Permission.user,
    exec: async (ctx: IContext, interaction: ButtonInteraction) => {
        await interaction.reply({
            content: 'Aguarde enquanto verificamos seu perfil',
            ephemeral: true
        })

        const user = await ctx.mongoService.getOne('users', {
            userId: interaction.user.id, guildId: interaction.guildId
        }) as User || null;
        if (!user) {
            await interaction.editReply({
                content: 'Não encontramos seu perfil, tente se registrar novamente!'
            });
            return
        }

        try {
            if (!user.references.channelId) { throw new Error('Invalid user channel') }
            const userChannel: TextChannel | null = await ctx.client.channels.fetch(user.references.channelId) as TextChannel | null;
            if (!userChannel) { throw new Error('Invalid user channel') }
            await userChannel.permissionOverwrites.create(interaction.user.id, {
                AddReactions: false,
                SendMessages: true,
                SendMessagesInThreads: true,
                AttachFiles: true,
            })

            const everyoneId = interaction.guild?.roles.everyone.id;
            if (!everyoneId) { throw new Error('Invalid everyone role') }
            await userChannel.permissionOverwrites.create(everyoneId, {
                AddReactions: false,
                SendMessages: false,
                SendMessagesInThreads: true,
                AttachFiles: false,
            })

            if (interaction.isRepliable()) {
                await interaction.editReply('Prontinho! Você pode acessar seu perfil em <#' + userChannel.id + '>')
            }
        }
        catch {
            if (interaction.isRepliable()) {
                await interaction.editReply({
                    content: 'Não encontramos seu perfil, vamos criar um novo automaticamente!',
                });
            }
            if (!ctx.serverConfig) { throw new Error('Invalid server config') }
            if (!interaction.guild) { throw new Error('Invalid guild') }
            const profileService: ProfileServices = new ProfileServices();
            const newUserChannel = await profileService.createUserChannel(interaction.guild, user.username, user.userId);
            if (!newUserChannel) { throw new Error('Invalid user channel') }

            const theme = MomentoService.isUserVerified(user.stats.isVerified) ? await ctx.mongoService.getOne('themes', { name: user.styles.theme }) as Theme ?? defaultTheme : defaultTheme;
            user.styles.fonts = MomentoService.isUserVerified(user.stats.isVerified) ? user.styles.fonts : { primary: 'sfpro', secondary: 'sfpro' };

            const collage = await ctx.mongoService.getOne('collages', { id: user.styles.collage }) as Collage || defaultCollage;

            if (!collage) { throw new Error('Invalid collage') }

            const postCount = await ctx.mongoService.count('posts', {
                'references.ownerId': user.userId,
                'references.guildId': user.guildId,
                'stats.status': { $in: ['active', 'inactive'] },
                'stats.type': { $in: ['image', 'carousel', 'video'] }
            });

            const trendingCount = await ctx.mongoService.count('posts', {
                'references.ownerId': user.userId,
                'references.guildId': user.guildId, 'stats.isTrending': true,
                'stats.status': { $in: ['active', 'inactive'] },
                'stats.type': { $in: ['image', 'carousel', 'video'] }
            })

            const profileImages = await profileService.drawProfilePictures(ctx, user, theme, collage, postCount, trendingCount);
            if (!profileImages) { throw new Error('Invalid profile images') }

            const profileButtons = await profileService.createProfileButtons();
            const statsMessage = await newUserChannel.send(profileImages.profileImgURL);
            const collageMessage = await newUserChannel.send({ content: profileImages.collageImgURL, components: [profileButtons] });
            await collageMessage.react('🫂');

            const newReferences = {
                references: {
                    channelId: newUserChannel.id,
                    statsId: statsMessage.id,
                    collageId: collageMessage.id,
                    notificationId: null
                }
            }
            await ctx.mongoService.patch('users', { userId: user.userId, guildId: user.guildId }, newReferences)

            user.references = {
                channelId: newReferences.references.channelId,
                statsId: newReferences.references.statsId,
                collageId: newReferences.references.collageId,
                notificationId: user.references.notificationId
            }
            if (interaction.isRepliable()) {
                await interaction.editReply('Prontinho! Você pode acessar seu perfil em <#' + newUserChannel.id + '>')
            }
        }

        await ctx.notificationService?.sendNotification(
            user,
            {
                type: NotificationType.Embed,
                message: 'Bem vindo ao seu perfil!',
                targetUser: user
            }, true
        )
        return
    }
}   