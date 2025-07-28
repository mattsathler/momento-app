import { Canvas, loadImage } from "skia-canvas";
import { resizeCanvas } from "../../../bots/momento-core/Utils/Pictures";
import { drawPostActionBar } from "./Post";
import { IContext } from "../../../bots/momento-core/Interfaces/IContext";
import { User } from "src/shared/models/user";
import { Theme } from "src/shared/models/Theme";
import { calculateSizes, Styles } from "src/shared/models/Style";
import { LinkService } from "src/shared/services/LinkService";
import { drawTextInCanvas } from "src/shared/services/canvas/TextCanvas";
import { drawNotificationHeader } from "src/bots/momento-core/Styles/Canvas/Notifications/NotificationHeader";
import { MomentoService } from "../MomentoService";
import { Fonts } from "src/shared/models/Fonts";


export async function drawCommentCanvas(context: IContext, user: User, text: string, theme: Theme, fonts: Fonts): Promise<Canvas> {
    const sizes = calculateSizes(Styles.sizes.large.post.width);
    let canvas = new Canvas(Styles.sizes.large.post.width, 2000);
    const ctx = canvas.getContext('2d');
    const profileImageUrl: string | undefined = await LinkService.readImageOfMomento(context.uploadChannel, user.imagesUrl.profilePicture);
    if (!profileImageUrl) { throw new Error('Erro ao carregar imagem de perfil') }
    const userImage = await loadImage(profileImageUrl);
    const textCanvas = drawTextInCanvas(text, theme, fonts.secondary, canvas.width - (sizes.huge * 2), sizes.big);
    const postHeader = await drawNotificationHeader(theme, fonts, userImage, user.username, `${user.name} ${user.surname}`, '', canvas.width, MomentoService.isUserVerified(user.stats.isVerified));
    ctx.fillStyle = theme.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let y: number;
    ctx.drawImage(postHeader, 0, 0);
    y = postHeader.height;
    ctx.drawImage(textCanvas, sizes.huge, y);
    y += textCanvas.height;
    const actionBar = await drawPostActionBar(canvas.width, null, theme, fonts);
    ctx.drawImage(actionBar, 0, y);
    y += actionBar.height;

    canvas = resizeCanvas(canvas, canvas.width, y);
    return canvas;
}