import { assetPaths } from "assets-paths";
import { Canvas, loadImage } from "canvas";
import { calculateSizes, Sizes } from "src/shared/models/Style";
import { cropCirclePicture } from "src/shared/services/canvas/CanvasService";
import { ImageCropper } from "src/shared/services/ImageCropper";
import { LinkService } from "src/shared/services/LinkService";
import { drawCard } from "./cards";
import { Theme } from "src/shared/models/Theme";
import { MomentoService } from "src/shared/services/MomentoService";
import { Client, TextChannel } from "discord.js";

export async function drawHeader(client: Client, title: string, width: number, theme: Theme, description?: string, icon?: string, userIcon?: string): Promise<Canvas> {
    const sizes = calculateSizes(width);
    const momentoService: MomentoService = new MomentoService();
    const uploadChannel = await momentoService.getUploadChannel(client) as TextChannel;

    if (!uploadChannel) throw new Error("Invalid Upload Channel!");

    let canvas = new Canvas(width, 60);

    const ctx = canvas.getContext("2d");
    let x: number = 0;
    let y: number = 0;

    // ANALYTICS HEADER ========================
    x = sizes.medium;
    y += sizes.medium;
    ctx.quality = 'best';

    drawCard(ctx, x, y, canvas.width - (sizes.medium * 2), (sizes.big * 2), 24, theme.colors.background);
    x += sizes.medium;
    y += sizes.small;

    if (userIcon) {
        const authorUserImage = await loadImage(userIcon);
        const followersIcon = await loadImage(assetPaths.followersIcon);
        const likesIcon = await loadImage(assetPaths.likesIcon);
        const circularUserImage = cropCirclePicture(ImageCropper.cropImage(authorUserImage, 40, 40), 40, 40);
        ctx.drawImage(circularUserImage, canvas.width - (sizes.medium * 4), y);
    }

    if (icon) {
        const headerIcon = await loadImage(assetPaths.analyticsIcon);
        ctx.drawImage(headerIcon, x, y, 40, 40);
    };

    x += 40 + sizes.medium;

    ctx.font = '24px sfpro-bold';
    const titleSize = ctx.measureText('Analytics');
    ctx.textBaseline = "middle";
    y += sizes.medium;
    ctx.fillStyle = theme.colors.primary;
    ctx.fillText(title, x, y);

    if (description) {
        ctx.font = '20px sfpro-medium';
        ctx.fillText('Confira o alcance do seu momento!', (x + sizes.medium + titleSize.width), y);
    }

    return canvas;
}