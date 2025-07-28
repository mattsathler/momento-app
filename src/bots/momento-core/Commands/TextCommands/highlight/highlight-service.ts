import { loadImage } from "skia-canvas";
import { Guild, Message, TextChannel } from "discord.js";
import { ImageCropper } from "../../../Utils/ImageCropper";
import { ProfileServices } from "../../../Utils/ProfileServices";
import { IContext } from "../../../Interfaces/IContext";
import { IServer } from "../../../Interfaces/IServer";
import { LinkService } from "src/shared/services/LinkService";
import { User } from "src/shared/models/User";
import { MomentoService } from "src/shared/services/MomentoService";

export class HighlightService {
    public async treatHighlightPicture(ctx: IContext, guild: Guild, url: string): Promise<string> {
        const newCollageImg = await loadImage(url);
        const croppedImage = ImageCropper.cropImage(newCollageImg);
        const buffer = await croppedImage.toBuffer('jpeg');
        const uploadChannel = await MomentoService.getUploadChannel(ctx.client);

        const imageURL = await LinkService.uploadImageToMomento(uploadChannel, buffer);
        return imageURL.url
    }

    public async changeHighlightPicture(ctx: IContext, highlightURL: string, highlightId: number, author: User, message: Message): Promise<void> {
        await ctx.mongoService.patch('users',
            {
                'userId': author.userId,
                'guildId': message.guildId,
            },
            {
                [`imagesUrl.highlights.${highlightId}`]: highlightURL
            }
        )

        author.imagesUrl.highlights[highlightId] = highlightURL;
        const profileServices: ProfileServices = new ProfileServices();

        const serverConfig = await ctx.mongoService.getOne('servers', { id: message.guildId }) as IServer;
        ctx.serverConfig = serverConfig;

        await profileServices.updateProfilePictures(ctx, author, true, false);
        return
    }
}