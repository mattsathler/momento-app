import { loadImage, Canvas, registerFont, Image } from "canvas";
import { ImageCropper } from "../../../Utils/ImageCropper";
import { cropCirclePicture, resizeCanvas } from "../../../Utils/Pictures";
import { defaultTheme, Theme } from "src/shared/models/Theme";
import { calculateSizes, Sizes } from "src/shared/models/Style";
import { assetPaths, fontsPaths } from "assets-paths";

export async function drawNotificationHeader(theme: Theme = defaultTheme, authorPicture: Image, authorUsername?: string, authorName?: string, music: string | null = null, width = 400, isVerified: boolean = false): Promise<Canvas> {
    let canvas = new Canvas(width, 2000);
    const ctx = canvas.getContext('2d');

    const sizes: Sizes = calculateSizes(canvas.width)

    ctx.quality = 'best';
    ctx.fillStyle = theme.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = theme.colors.primary;
    let x: number = sizes.big;
    let y: number = sizes.big;

    // AUTHOR PICTURE
    const authorPictureSize = canvas.width / 10;
    let canvasPicture = ImageCropper.cropImage(authorPicture, authorPictureSize, authorPictureSize, true);
    const croppedImg = cropCirclePicture(canvasPicture, authorPictureSize, authorPictureSize)
    ctx.drawImage(croppedImg, x, y);

    // AUTHOR NAME
    registerFont(fontsPaths.SFPROBOLD, { family: 'sfpro-bold' })
    registerFont(fontsPaths.SFPROMEDIUM, { family: 'sfpro-medium' })
    registerFont(fontsPaths.SFPROREGULAR, { family: 'sfpro-regular' })

    ctx.textAlign = 'center';
    ctx.fillStyle = theme.colors.secondary;

    x += authorPictureSize + sizes.medium;
    y += authorPictureSize / 2 - sizes.big / 4;

    ctx.textAlign = 'left';
    ctx.fillStyle = theme.colors.primary;
    ctx.font = `${sizes.big}px sfpro-bold`;
    ctx.fillText(authorName ?? 'MOMENTO APP', x, y);

    if (isVerified) {
        const measureGap = sizes.tiny + ctx.measureText(authorName ?? 'MOMENTO APP').width;
        const verifiedIcon = await loadImage(assetPaths.verifiedIcon)
        x += measureGap
        ctx.drawImage(verifiedIcon, x, y - 25, 25, 25);
        x -= measureGap
    }

    y += sizes.big;
    ctx.fillStyle = theme.colors.secondary;
    ctx.font = `${sizes.big}px sfpro-regular`;
    const author = authorUsername ? `@${authorUsername}` : '@momentoapp';
    ctx.fillText(author, x, y);
    if (music) {
        const musicIcon = await loadImage(assetPaths.musicIcon);
        if (!musicIcon) { throw new Error('Erro ao carregar icone de musica') }
        ctx.font = `${sizes.big}px sfpro-bold`;
        ctx.fillStyle = theme.colors.primary;

        let treatedMusicName = music;
        let isCutted = false;
        while (ctx.measureText(treatedMusicName).width > canvas.width - x - ctx.measureText(author).width - sizes.big - 100) {
            treatedMusicName = treatedMusicName.slice(0, treatedMusicName.length - 1);
            isCutted = true;
        }
        if (isCutted) {
            treatedMusicName = treatedMusicName.slice(0, treatedMusicName.length - 3);
            treatedMusicName += '...';
        }
        ctx.fillText(`• ${treatedMusicName}`, x + ctx.measureText(author).width, y);
        ctx.drawImage(musicIcon, x + ctx.measureText(author).width + ctx.measureText(`• ${treatedMusicName}`).width + sizes.small, y - 40, 50, 50);
    };

    y = authorPictureSize + sizes.huge;

    canvas = resizeCanvas(canvas, width, y)
    return canvas
}