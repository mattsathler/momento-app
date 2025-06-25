import { Client, Guild, Message, TextChannel } from "discord.js";
import { ProfileUpdateRequest } from "../models/ProfileUpdateRequest";
import { MongoService } from "../../../shared/services/MongoService";
import { drawProfileCanvas } from "../../../shared/services/canvas/ProfileCanvas";
import { defaultTheme, Theme } from "../../../shared/models/Theme";
import { MomentoService } from "../../../shared/services/MomentoService";
import { drawCollageCanvas } from "../../../shared/services/canvas/CollageCanvas";
import { Collage, defaultCollage } from "../../../shared/models/Collage";
import { LinkService } from "../../../shared/services/LinkService";
import { User } from "../../../shared/models/User";

export class ProfileUpdaterService {
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

        const uploadChannel = await MomentoService.getUploadChannel(request.message.client);

        const user = await mongoService.getOne("users", {
            'guildId': request.guildId,
            'userId': request.target_user_id
        }) as User

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

    private async updateProfilePictures(client: Client, mongoService: MongoService, uploadChannel: TextChannel, user: User, profile: boolean = true, collage: boolean = true): Promise<true | Error> {
        if (!user?.guildId) throw new Error("Invalid Guild Id");
        if (!user?.references.channelId) throw new Error("Invalid Profile Channel Id");

        const guild = await client.guilds.fetch(user.guildId) as Guild;
        const profileChannel = await guild.channels.fetch(user.references.channelId) as TextChannel;
        if (!guild || !profileChannel) throw new Error("Invalid Guild or Profile Channel");

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
            if (!profileMessage) throw new Error("Invalid Profile Channel");

            const theme = await mongoService.getOne('themes', { name: user.styles.theme }) as Theme || defaultTheme;
            const newProfilePicture = await drawProfileCanvas(user, uploadChannel, theme, postCount, trendingCount)
            const imageURL = await LinkService.uploadImageToMomento(uploadChannel, newProfilePicture.toBuffer())

            if (!imageURL || !imageURL.attachments.first()) throw new Error("Invalid Image URL");

            await profileMessage.edit(imageURL.attachments.first()?.url || '');
        }

        if (collage) {
            const collageMessage = await profileChannel.messages.fetch(user.references.collageId);
            if (!collageMessage) throw new Error("Invalid Collage Message");

            const theme = await mongoService.getOne('themes', { name: user.styles.theme }) as Theme || defaultTheme;
            const collageStyle = await mongoService.getOne('collages', { id: user.styles.collage }) as Collage || defaultCollage;
            const newCollagePicture = await drawCollageCanvas(uploadChannel, user, theme, collageStyle);

            const imageURL = await LinkService.uploadImageToMomento(uploadChannel, newCollagePicture.toBuffer());

            await collageMessage.edit(imageURL.attachments.first()?.url || '');
        }

        return true
    }
}