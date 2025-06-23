import { Guild, Message, TextChannel } from "discord.js";
import { loadImage } from "canvas";
import { ImageCropper } from "../../../Utils/ImageCropper";
import { IContext } from "../../../Interfaces/IContext";
import { ProfileServices } from "../../../Utils/ProfileServices";
import { LinkService } from "src/shared/services/LinkService";
import { User } from "src/shared/models/User";
import { MomentoService } from "src/shared/services/MomentoService";

export class CapaService {
    public async treatCoverPicture(ctx: IContext, url: string): Promise<Message> {
        const newcoverImg = await loadImage(url);
        const croppedImage = ImageCropper.cropImage(newcoverImg).toBuffer();
        const uploadChannel = await MomentoService.getUploadChannel(ctx.client);
        const imageURL = await LinkService.uploadImageToMomento(uploadChannel, croppedImage);
        return imageURL
    }

    public async changeCoverPicture(ctx: IContext, coverURL: string, author: User, message: Message): Promise<void> {
        await ctx.mongoService.patch('users',
            {
                'userId': author.userId,
                'guildId': message.guildId,
            },
            {
                'imagesUrl.profileCover': coverURL
            }
        )


        author.imagesUrl.profileCover = coverURL;
        const profileServices: ProfileServices = new ProfileServices();
        await profileServices.updateProfilePictures(ctx, author, true, false);
        return
    }
}