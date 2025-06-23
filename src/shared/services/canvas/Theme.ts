import { Canvas } from "canvas";
import { Styles } from "src/shared/models/Style";

export function drawThemeInCanvas(profileImage: Canvas, collageImage: Canvas): Canvas {
    const height = Styles.sizes.large.profile.stats.height + Styles.sizes.large.profile.collage.height + 20;
    const width = Styles.sizes.large.profile.stats.width;

    let canvas = new Canvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(profileImage, 0, 0);
    ctx.drawImage(collageImage, 0, Styles.sizes.large.profile.stats.height + 20);

    return canvas;
}
