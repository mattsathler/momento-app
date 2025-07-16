import { createCanvas, loadImage, Canvas, registerFont, Image } from "canvas";
import { TextChannel } from "discord.js";
import { calculateSizes, Styles } from "../../models/Style";
import { cropImage } from "./CanvasService";
import { LinkService } from "../LinkService";
import { User } from "../../models/User";
import { defaultTheme, Theme } from "../../models/Theme";
import { Collage } from "../../models/Collage";
import { fontsPaths } from "assets-paths";
import { MomentoService } from "../MomentoService";

export async function drawCollageCanvas(uploadChannel: TextChannel, user: User, theme: Theme, userCollageStyle: Collage): Promise<Canvas> {
    const canvas = createCanvas(Styles.sizes.large.profile.collage.width, Styles.sizes.large.profile.collage.height);
    const ctx = canvas.getContext('2d');
    const sizes = calculateSizes(canvas.width)
    ctx.quality = "best";
    let y = sizes.medium * 2;

    theme = MomentoService.isUserVerified(user.stats.isVerified) ? theme : defaultTheme;


    ctx.fillStyle = theme.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // HEADER ========================================
    registerFont(fontsPaths.SFPROBOLD, { family: 'sfpro-bold' })
    registerFont(fontsPaths.SFPROMEDIUM, { family: 'sfpro-medium' })
    registerFont(fontsPaths.SFPROREGULAR, { family: 'sfpro-regular' })

    ctx.textAlign = 'center';

    ctx.fillStyle = theme.colors.primary;
    ctx.font = `${sizes.medium}px sfpro-bold`;
    ctx.fillText('COLLAGES', canvas.width / 2 - (sizes.big * 4), y);

    ctx.fillStyle = theme.colors.secondary;
    ctx.font = `${sizes.medium}px sfpro-regular`;
    ctx.fillText('MOMENTOS', canvas.width / 2, y);
    ctx.fillText('TRENDS', canvas.width / 2 + (sizes.big * 4), y);

    y += sizes.medium;

    ctx.strokeStyle = theme.colors.secondary;
    ctx.lineWidth = sizes.lineWidth;

    ctx.beginPath();
    ctx.moveTo(sizes.huge, y);
    ctx.lineTo(canvas.width - sizes.huge, y);
    ctx.stroke();

    ctx.strokeStyle = theme.colors.primary;
    ctx.lineWidth = sizes.lineWidth * 2;

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - (sizes.big * 4) - sizes.huge, y);
    ctx.lineTo(canvas.width / 2 - (sizes.big * 4) + sizes.huge, y);
    ctx.stroke();


    y += sizes.medium;

    // COLLAGE ========================================
    const collageStyle = userCollageStyle;

    const numColumns = collageStyle.gridTemplateColumns;
    const numRows = collageStyle.gridTemplateRows;

    const cellWidth = ((canvas.width - sizes.tiny) / numColumns);
    const cellHeight = ((canvas.height - y) / numRows) - sizes.tiny / 2;

    let i = 0;
    const defaultPic = await LinkService.readImageOfMomento(uploadChannel, 'https://discord.com/channels/1084823963974246414/1210763625250291772/1210763928473436180')
    if (!defaultPic) throw new Error('Invalid default picture!')
    const image = await loadImage(defaultPic)

    let images: Image[] = await Promise.all(user.imagesUrl.collage.map(
        async (photo) => {
            if (!photo) return image;
            const msgURL = await LinkService.readImageOfMomento(uploadChannel, photo)
            if (!msgURL) throw new Error('Não foi possível achar a collage!');
            const img = await loadImage(msgURL);
            return img
        })
    );

    for (i = 0; i < 25; i++) {
        const [startRow, startColumn, endRow, endColumn] = collageStyle.positions[i].split(' / ');
        if (collageStyle.positions[i] === '0 / 0 / 0 / 0') { continue }
        const photoX = (parseInt(startColumn) - 1) * cellWidth + sizes.tiny;
        const photoY = (parseInt(startRow) - 1) * cellHeight + sizes.tiny;
        const photoWidth = (parseInt(endColumn) - parseInt(startColumn)) * cellWidth - sizes.tiny;
        const photoHeight = (parseInt(endRow) - parseInt(startRow)) * cellHeight - sizes.tiny;

        if (!images[i]) {
            ctx.drawImage(cropImage(image, photoWidth, photoHeight, true), photoX, y + photoY);
            continue;
        }
        ctx.drawImage(cropImage(images[i], photoWidth, photoHeight, true), photoX, y + photoY);
    }
    return canvas
}