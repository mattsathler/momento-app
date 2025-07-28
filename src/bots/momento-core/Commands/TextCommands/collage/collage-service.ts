import { loadImage } from "skia-canvas";
import { Guild, Message, TextChannel } from "discord.js";
import { ImageCropper } from "../../../Utils/ImageCropper";
import { ProfileServices } from "../../../Utils/ProfileServices";
import { IContext } from "../../../Interfaces/IContext";
import { LinkService } from "src/shared/services/LinkService";
import { User } from "src/shared/models/User";
import { MomentoService } from "src/shared/services/MomentoService";

export class CollageService {
    public async treatCollagePicture(ctx: IContext, guild: Guild, url: string): Promise<string | undefined> {
        const newCollageImg = await loadImage(url);
        const croppedImage = ImageCropper.cropImage(newCollageImg);
        const buffer = await croppedImage.toBuffer('jpeg');
        const uploadChannel = await MomentoService.getUploadChannel(ctx.client);

        const imageURL = await LinkService.uploadImageToMomento(uploadChannel, buffer);
        return imageURL.url
    }

    public async changeCollagePicture(ctx: IContext, collageURL: string, collageId: number, author: User, message: Message): Promise<void> {
        await ctx.mongoService.patch('users',
            {
                'userId': author.userId,
                'guildId': message.guildId,
            },
            {
                [`imagesUrl.collage.${collageId}`]: collageURL
            }
        )

        author.imagesUrl.collage[collageId] = collageURL;
        const profileServices: ProfileServices = new ProfileServices();
        await profileServices.updateProfilePictures(ctx, author, false, true);
        return
    }
}