import { createCanvas, Canvas, loadImage, Image } from "canvas";
import { drawNotificationHeader } from "../../../bots/momento-core/Styles/Canvas/Notifications/NotificationHeader";
import { ImageCropper } from "../../../bots/momento-core/Utils/ImageCropper";
import { changePixelColor, resizeCanvas } from "../../../bots/momento-core/Utils/Pictures";
import { IPost } from "../../../bots/momento-core/Interfaces/IPost";
import { IContext } from "../../../bots/momento-core/Interfaces/IContext";
import { TextChannel } from "discord.js";
import { User } from "src/shared/models/user";
import { defaultTheme, Theme } from "src/shared/models/Theme";
import { calculateSizes, Styles } from "src/shared/models/Style";
import { LinkService } from "src/shared/services/LinkService";
import { assetPaths } from "assets-paths";
import { drawTextInCanvas } from "src/shared/services/canvas/TextCanvas";
import { MomentoService } from "../MomentoService";


export async function drawPostCanvas(context: IContext, user: User, theme: Theme, post: IPost): Promise<Canvas> {
    const postWidth = Styles.sizes.large.post.width;
    const sizes = calculateSizes(postWidth);
    let canvas = new Canvas(postWidth, 4000);
    const ctx = canvas.getContext('2d');

    const profileImageUrl = await LinkService.readImageOfMomento(context.uploadChannel, user.imagesUrl.profilePicture);
    if (!profileImageUrl) { throw new Error('Erro ao carregar imagem de perfil'); }

    const userImage = await loadImage(profileImageUrl);

    const postHeader = await drawNotificationHeader(theme, userImage, user.username, `${user.name} ${user.surname}`, post.content.music, postWidth, MomentoService.isUserVerified(user.stats.isVerified));
    const postBar = await drawPostActionBar(postWidth, post, theme);

    let y = 0;
    let x = 0;

    ctx.fillStyle = theme.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(postHeader, 0, 0);
    y += postHeader.height;

    const postImageURL = post.content.images && post.content.images?.length > 0 ? await LinkService.readImageOfMomento(context.uploadChannel, post.content.images[0]) : undefined;
    if (postImageURL) {
        const postImage = await loadImage(postImageURL);
        const croppedImage = ImageCropper.cropImage(postImage, postWidth - (2 * sizes.small), Styles.sizes.large.post.height, true);
        ctx.drawImage(croppedImage, sizes.small, y);
        y += croppedImage.height + sizes.medium;
    }

    if (post.content.description) {
        const font = `SFPRODISPLAYMEDIUM`;
        const textDescriptionCanvas = drawTextInCanvas(post.content.description, theme, font, postWidth - (sizes.huge * 2), sizes.big);
        x += sizes.huge;
        ctx.drawImage(textDescriptionCanvas, x, y);
        y += textDescriptionCanvas.height;
    }

    ctx.drawImage(postBar, 0, y);
    y += postBar.height;

    canvas = resizeCanvas(canvas, postWidth, y);
    return canvas;
}


export async function drawPostActionBar(width: number, post: IPost | null, theme: Theme = defaultTheme) {
    const likeIcon = await loadImage(assetPaths.likeIcon);
    const commentIcon = await loadImage(assetPaths.commentIcon);
    const shareIcon = await loadImage(assetPaths.shareIcon);
    const locationIcon = await loadImage(assetPaths.locationIcon);


    const treatedLikeIcon = changePixelColor(likeIcon, [55, 52, 53], theme.colors.primary);
    const treatedCommentIcon = changePixelColor(commentIcon, [55, 52, 53], theme.colors.primary);
    const treatedShareIcon = changePixelColor(shareIcon, [55, 52, 53], theme.colors.primary);

    const sizes = calculateSizes(width);
    let canvas = createCanvas(width, 4000);
    const ctx = canvas.getContext('2d');

    let x: number = sizes.medium;
    let y: number = 0;

    ctx.strokeStyle = theme.colors.secondary;
    ctx.lineWidth = 2;
    ctx.moveTo(x, y);
    ctx.lineTo(width - x, y);

    ctx.stroke();
    y += sizes.medium;

    ctx.drawImage(treatedLikeIcon, x, y, 50, 50);
    x += 50 + sizes.medium;

    ctx.drawImage(treatedCommentIcon, x, y, 50, 50);
    x += 50 + sizes.medium;

    ctx.drawImage(treatedShareIcon, x, y, 50, 50);
    x += 50 + sizes.medium;

    if (post?.content.location) {
        ctx.fillStyle = theme.colors.secondary;
        ctx.font = `${sizes.big}px sfpro-regular`;
        ctx.textAlign = 'right';

        let isCutted = false;
        while (ctx.measureText(post.content.location).width > canvas.width - x - sizes.big - 100) {
            post.content.location = post.content.location.slice(0, -1);
            isCutted = true;
        }
        if (isCutted) {
            post.content.location = post.content.location.slice(0, -3);
            post.content.location += '...';
        }
        ctx.fillText(post.content.location, canvas.width - sizes.huge - 50, y + sizes.medium + 15);
        ctx.drawImage(locationIcon, canvas.width - sizes.huge - ctx.measureText(post.content.location).width - 110, y, 50, 50);
    }
    y += 50 + sizes.medium;

    canvas = resizeCanvas(canvas, width, y);
    return canvas;
}

export async function drawPostFrame(uploadChannel: TextChannel, user: User, post: IPost | null, theme: Theme): Promise<Canvas> {
    const postWidth = Styles.sizes.large.post.width;

    const sizes = calculateSizes(postWidth);
    let canvas = new Canvas(postWidth + (2 * sizes.small), 4000);
    const ctx = canvas.getContext('2d');

    const profileImageUrl: string | undefined = await LinkService.readImageOfMomento(uploadChannel, user.imagesUrl.profilePicture);
    if (!profileImageUrl) { throw new Error('Erro ao carregar imagem de perfil') }

    const userImage = await loadImage(profileImageUrl);

    const postHeader = await drawNotificationHeader(theme, userImage, user.username, `${user.name} ${user.surname}`, null, postWidth, MomentoService.isUserVerified(user.stats.isVerified));
    const postBar = await drawPostActionBar(postWidth, post || null, theme);

    let y: number;
    let x: number = 0;

    ctx.fillStyle = theme.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(postHeader, 0, 0);
    y = postHeader.height;

    y += Styles.sizes.large.post.height + sizes.medium;
    if (post?.content.description) {
        const font = `SFPRODISPLAYMEDIUM`
        const textDescriptionCanvas = drawTextInCanvas(post.content.description, theme, font, canvas.width - (sizes.huge * 2), sizes.big);
        x += sizes.huge;
        ctx.drawImage(textDescriptionCanvas, x, y);
        y += textDescriptionCanvas.height;
    }

    ctx.drawImage(postBar, sizes.big, y);
    y += postBar.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(sizes.small, postHeader.height, postWidth - sizes.small * 2, Styles.sizes.large.post.height);
    ctx.globalCompositeOperation = 'source-over';

    canvas = resizeCanvas(canvas, postWidth, y);
    return canvas;
}

export async function drawMultiplePostsCanvas(uploadChannel: TextChannel, user: User, theme: Theme, post: IPost, buffers?: Image[]): Promise<Canvas[]> {
    const postImages = post.content.images ? post.content.images : null;
    if (!postImages && !buffers) { throw new Error("Invalid post images or video buffer.") }
    let postCanvases: Canvas[] = [];
    const postWidth = Styles.sizes.large.post.width;

    const sizes = calculateSizes(postWidth);
    let canvas = new Canvas(postWidth + (2 * sizes.small), 4000);
    const ctx = canvas.getContext('2d');

    const profileImageUrl: string | undefined = await LinkService.readImageOfMomento(uploadChannel, user.imagesUrl.profilePicture);
    if (!profileImageUrl) { throw new Error('Erro ao carregar imagem de perfil') }

    const userImage = await loadImage(profileImageUrl);

    const postHeader = await drawNotificationHeader(theme, userImage, user.username, `${user.name} ${user.surname}`, post.content.music, postWidth, MomentoService.isUserVerified(user.stats.isVerified));
    const postBar = await drawPostActionBar(postWidth, post, theme);

    let y: number;
    let x: number = 0;

    ctx.fillStyle = theme.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(postHeader, 0, 0);
    y = postHeader.height;

    y += Styles.sizes.large.post.height + sizes.medium;
    let descriptionHeight = 0;
    if (post.content.description) {
        const font = `SFPRODISPLAYMEDIUM`
        const textDescriptionCanvas = drawTextInCanvas(post.content.description, theme, font, canvas.width - (sizes.huge * 2), sizes.big);
        x += sizes.huge;
        ctx.drawImage(textDescriptionCanvas, x, y);
        y += textDescriptionCanvas.height;
        descriptionHeight += textDescriptionCanvas.height;
    }

    ctx.drawImage(postBar, sizes.big, y);
    y += postBar.height;

    if (postImages && postImages?.length > 0) {
        const dotsCanvas = new Canvas(canvas.width, 20);
        const dotsCtx = dotsCanvas.getContext('2d');
        const totalWidth = postImages.length * 24;
        const startX = (dotsCanvas.width - totalWidth) / 2;

        for (let i = 0; i < postImages.length; i++) {
            dotsCtx.beginPath();
            const dotx = startX + (i * 32) + 12;
            const doty = (dotsCanvas.height / 2);
            dotsCtx.lineWidth = 0;
            dotsCtx.fillStyle = theme.colors.background;
            dotsCtx.arc(dotx, doty, 10, 0, Math.PI * 2);
            dotsCtx.fill();
            dotsCtx.closePath();
        }
        canvas = resizeCanvas(canvas, postWidth, y);

        await Promise.all(postImages.map(async (postImage: string, index: number) => {
            const postImageURL = await LinkService.readImageOfMomento(uploadChannel, postImage);
            if (!postImageURL) return;

            const img = await loadImage(postImageURL);
            const newCanvas = new Canvas(canvas.width, canvas.height);
            const newCtx = newCanvas.getContext('2d');
            const croppedImage = ImageCropper.cropImage(img, Styles.sizes.large.post.width - (2 * sizes.small), Styles.sizes.large.post.height, true);

            newCtx.drawImage(canvas, 0, 0);
            newCtx.drawImage(croppedImage, sizes.small, postHeader.height);
            newCtx.drawImage(dotsCanvas, -24, y - postBar.height - 55 - descriptionHeight);

            const dotx = startX + (index * 32) - 12;
            newCtx.lineWidth = 0;
            newCtx.fillStyle = theme.colors.primary;
            newCtx.arc(dotx, newCanvas.height - descriptionHeight - postBar.height - 45, 10, 0, Math.PI * 2);
            newCtx.fill();
            newCtx.closePath();

            postCanvases[index] = newCanvas;
        }));
    }

    return postCanvases;
}
