import { Client, Guild, Message, TextChannel } from "discord.js";
import { ProfileUpdateRequest } from "../models/ProfileUpdateRequest";
import { user } from "../../../shared/models/user";
import { MongoService } from "../../../shared/services/mongoService";
import { drawProfileCanvas } from "../../../shared/services/canvas/profileCanvas";
import { theme } from "../../../shared/models/theme";
import { LinkService } from "../../../shared/services/LinkService";
import { MomentoService } from "../../../shared/services/momentoService";
import { error } from "../../../shared/models/error";
import { drawCollageCanvas } from "../../../shared/services/canvas/collageCanvas";
import { collage, defaultCollage } from "../../../shared/models/collage";

export class profileUpdaterService {
    public extractProfileUpdateRequest(message: Message): ProfileUpdateRequest {
        const fields = message?.embeds[0]?.fields;

        return {
            message: message,
            guildId: fields.find((f) => f.name === "guild_id")?.value || "",
            target_user_id: fields.find((f) => f.name === "target_user_id")?.value || "",
            update_profile: fields.find((f) => f.name === "update_profile")?.value === "true" || false,
            update_collage: fields.find((f) => f.name === "update_collage")?.value === "true" || false,
        };
    }

    public async requestUpdateProfilePictures(client: Client, mongoService: MongoService, request: ProfileUpdateRequest): Promise<void> {
    if (!request.message.guild) throw new Error("Missing guild!");

        const momentoService = new MomentoService();
        const uploadChannel = await momentoService.getUploadChannel(request.message.guild);

        const user = await mongoService.getOne("users", {
            'guildId': request.guildId,
            'userId': request.target_user_id
        }) as user;

        if (!uploadChannel) {
            throw new Error("Não foi possível encontrar o canal de imagens!")
        }
        if (!user) {
            throw new Error("Não foi possível encontrar esse usuário!")
        }

        const promise = await this.updateProfilePictures(client, mongoService, uploadChannel, user, request.update_profile, request.update_collage);
        if (promise === true) return
        throw new Error(promise?.message)
    }

    private async updateProfilePictures(client: Client, mongoService: MongoService, uploadChannel: TextChannel, user: user, profile: boolean = true, collage: boolean = true): Promise<true | error> {
        if (!user?.guildId) {
            return {
                code: 500,
                message: "Invalid Guild Id"
            }
        }
        if (!user?.references.channelId) {
            return {
                code: 500,
                message: "Invalid Profile Channel Id"
            }
        }
        try {
            const guild = await client.guilds.fetch(user.guildId) as Guild;
            const profileChannel = await guild.channels.fetch(user.references.channelId) as TextChannel;
            if (!guild || !profileChannel) {
                return {
                    code: 500,
                    message: "Invalid Guild or Profile Channel"
                }
            }

            const postCount = await mongoService.count('posts', {
                'references.ownerId': user.userId,
                'references.guildId': user.guildId,
                'stats.status': { $in: ['active', 'inactive'] },
                'stats.type': { $in: ['image', 'carousel', 'video'] }
            });
            const trendingCount = await mongoService.count('posts', {
                'references.ownerId': user.userId,
                'references.guildId': user.guildId, 'stats.isTrending': true,
                'stats.status': { $in: ['active', 'inactive'] },
                'stats.type': { $in: ['image', 'carousel', 'video'] }
            })

            if (profile) {
                const profileMessage = await profileChannel.messages.fetch(user.references.statsId);
                if (!profileMessage) {
                    return {
                        code: 500,
                        message: "Invalid Profile Channel"
                    }
                }

                const theme = await mongoService.getOne('themes', { name: user.styles.theme }) as theme;
                const newProfilePicture = await drawProfileCanvas(user, uploadChannel, theme, postCount, trendingCount)
                const imageURL = await LinkService.uploadImageToMomento(uploadChannel, newProfilePicture.toBuffer())

                if (!imageURL || !imageURL.attachments.first()) {
                    {
                        return {
                            code: 500,
                            message: "Invalid Image URL"
                        }
                    }
                }

                await profileMessage.edit(imageURL.attachments.first()?.url || '');
            }

            if (collage) {
                const collageMessage = await profileChannel.messages.fetch(user.references.collageId);
                if (!collageMessage) return {
                    code: 500,
                    message: "Invalid Collage Message"
                }

                const theme = await mongoService.getOne('themes', { name: user.styles.theme }) as theme;
                const collageStyle = await mongoService.getOne('collages', { id: user.styles.collage }) as collage || defaultCollage;
                const newCollagePicture = await drawCollageCanvas(uploadChannel, user, theme, collageStyle);

                const imageURL = await LinkService.uploadImageToMomento(uploadChannel, newCollagePicture.toBuffer());

                await collageMessage.edit(imageURL.attachments.first()?.url || '');
            }

            return true
        }

        catch (err: any) {
            console.log(`ERROR - Couldn't update profile picture - ${err}`);
            return {
                code: 500,
                message: err.message
            }
        }
    }
}