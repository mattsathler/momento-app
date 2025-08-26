import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Embed, Guild, PermissionsBitField, TextChannel, ThreadChannel } from "discord.js";
import { IContext } from "../Interfaces/IContext";
import { Canvas } from "skia-canvas";
import { tryDeleteMessage } from "./Messages";
import "dotenv";
import { getSecureToken } from "src/shared/services/TokenService";
import { AxiosService } from "src/shared/services/AxiosService";
import { LinkService } from "src/shared/services/LinkService";
import { MomentoService } from "src/shared/services/MomentoService";
import { Collage } from "src/shared/models/Collage";
import { drawCollageCanvas } from "src/shared/services/canvas/CollageCanvas";
import { drawProfileCanvas } from "src/shared/services/canvas/ProfileCanvas";
import { User } from "src/shared/models/user";
import { Theme } from "src/shared/models/Theme";

export class ProfileServices {
    public async updateProfilePictures(
        ctx: IContext,
        user: User,
        profile: boolean = true,
        collage: boolean = true
    ): Promise<boolean> {
        if (!ctx.serverConfig) { return false }
        if (!user?.guildId) { return false }
        if (!user?.references.channelId) { return false }
        try {
            const axiosService = new AxiosService();
            const body = {
                content: null,
                embeds: [
                    {
                        color: 14492795,
                        fields: [
                            {
                                name: "guild_id",
                                value: user.guildId
                            },
                            {
                                name: "target_user_id",
                                value: user.userId
                            },
                            {
                                name: "sent_from",
                                value: "momento_core"
                            },
                            {
                                name: "update_profile",
                                value: profile ? "true" : "false"
                            },
                            {
                                name: "update_collage",
                                value: collage ? "true" : "false"
                            },
                            {
                                name: "token",
                                value: getSecureToken(process.env.SECRET_TOKEN || "")
                            }
                        ]
                    }
                ],
                attachments: []
            }

            await axiosService.postWebhook(process.env.PROFILE_UPDATER_WEBHOOK || "", body);
            return true;
        }
        catch (err: any) {
            console.log(`ERROR - Couldn't update profile picture - ${err}`);
            return false;
        }
    }


    public async createUserChannel(guild: Guild, username: string, userId: string): Promise<TextChannel> {
        const channel = await guild.channels.create({
            name: username,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    allow: PermissionsBitField.Flags.SendMessagesInThreads,
                    deny: [
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.AttachFiles,
                        PermissionsBitField.Flags.AddReactions,
                    ]
                },
                {
                    id: userId,
                    allow: [PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.SendMessages],
                }
            ],
            position: guild.channels.cache.size
        });

        return channel as TextChannel
    }

    public async createProfileButtons(): Promise<ActionRowBuilder<ButtonBuilder>> {
        let ProfileButtons: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder();

        const postButton = new ButtonBuilder()
            .setCustomId('openPostModal')
            .setLabel('📸')
            .setStyle(ButtonStyle.Success);

        const configButton = new ButtonBuilder()
            .setCustomId('openProfileConfigurations')
            .setLabel('⚙️')
            .setStyle(ButtonStyle.Secondary);

        ProfileButtons.addComponents(postButton, configButton);
        return ProfileButtons;
    }

    public async createEditProfileButtons(user: User, isVerified: boolean): Promise<ActionRowBuilder<ButtonBuilder>> {
        let ProfileButtons: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder();

        const editProfileButton = new ButtonBuilder()
            .setCustomId('openEditProfileModal')
            .setLabel('Configurar')
            .setStyle(ButtonStyle.Secondary);

        const styleProfileButton = new ButtonBuilder()
            .setCustomId('openStyleProfileModal')
            .setLabel('Estilizar')
            .setStyle(ButtonStyle.Secondary);

        const nofiticationToggler = new ButtonBuilder()
            .setCustomId('toggleNotifications')
            .setLabel(user.stats.notifications ? '🔕' : '🔔')
            .setStyle(ButtonStyle.Secondary);

        const importFollowersButton = new ButtonBuilder()
            .setCustomId('createImportFollowersMessage')
            .setLabel('Importar Seguidores 👑')
            .setStyle(ButtonStyle.Success)


        ProfileButtons.addComponents(editProfileButton, styleProfileButton, nofiticationToggler);

        if (isVerified) {
            ProfileButtons.addComponents(importFollowersButton);
        }
        return ProfileButtons;
    }

    public async drawProfilePictures(ctx: IContext, user: User, theme: Theme, collage: Collage, momentos: number, trendings: number): Promise<{ profileImgURL: string, collageImgURL: string }> {
        const uploadChannel: TextChannel = await MomentoService.getUploadChannel(ctx.client);
        const newProfilePicture: Canvas = await drawProfileCanvas(user, uploadChannel, theme, momentos, trendings);
        const newProfileCollage: Canvas = await drawCollageCanvas(uploadChannel, user, theme, collage);
        const uploadedProfileUrl = await LinkService.uploadImageToMomento(uploadChannel, await newProfilePicture.toBuffer('jpeg'));
        const uploadedCanvasUrl = await LinkService.uploadImageToMomento(uploadChannel, await newProfileCollage.toBuffer('jpeg'));


        return {
            profileImgURL: uploadedProfileUrl.attachments.first()?.url || '',
            collageImgURL: uploadedCanvasUrl.attachments.first()?.url || ''
        }
    }

    public async pingUser(userId: string, channel: TextChannel | ThreadChannel) {
        await channel.send(`<@${userId}>`).then(async (message) => { tryDeleteMessage(message) })
    }
}