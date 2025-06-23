import { loadImage } from "canvas";
import { Guild, Message, TextChannel } from "discord.js";
import { ImageCropper } from "../../../Utils/ImageCropper";
import { ProfileServices } from "../../../Utils/ProfileServices";
import { IContext } from "../../../Interfaces/IContext";
import { User } from "src/shared/models/User";
import { LinkService } from "src/shared/services/LinkService";
import { MomentoService } from "src/shared/services/MomentoService";

export class PerfilService {
    constructor() { }

    public async treatProfilePicture(ctx: IContext, url: string): Promise<string> {
        const newProfileImg = await loadImage(url);
        const croppedImage = ImageCropper.cropImage(newProfileImg);
        const buffer = croppedImage.toBuffer();
        const uploadChannel = await MomentoService.getUploadChannel(ctx.client);

        const imageURL = (await LinkService.uploadImageToMomento(uploadChannel, buffer)).url;
        return imageURL
    }

    public async changeProfilePicture(ctx: IContext, profileURL: string, author: User, message: Message): Promise<void> {
        await ctx.mongoService.patch('users',
            {
                'userId': author.userId,
                'guildId': message.guildId,
            },
            {
                'imagesUrl.profilePicture': profileURL
            }
        )

        author.imagesUrl.profilePicture = profileURL;
        const profileServices: ProfileServices = new ProfileServices();
        await profileServices.updateProfilePictures(ctx, author, true, false);
        return
    }
}