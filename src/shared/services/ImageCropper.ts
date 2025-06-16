import { Canvas, Image, createCanvas, loadImage } from "canvas"

export class ImageCropper {
    static cropImage(
        src: Image,
        width?: number,
        height?: number,
        keepRatio: boolean = true,
        borderRadius: number = 0
    ): Canvas {
        width = width ?? src.width;
        height = height ?? src.height;
        borderRadius = Math.max(borderRadius, 0); // garante que não seja negativo

        const canvas = createCanvas(width, height);
        const context = canvas.getContext('2d');
        context.quality = 'best';

        // Desenha o clipping com bordas arredondadas (antes do drawImage)
        if (borderRadius > 0) {
            context.beginPath();
            context.moveTo(borderRadius, 0);
            context.lineTo(width - borderRadius, 0);
            context.quadraticCurveTo(width, 0, width, borderRadius);
            context.lineTo(width, height - borderRadius);
            context.quadraticCurveTo(width, height, width - borderRadius, height);
            context.lineTo(borderRadius, height);
            context.quadraticCurveTo(0, height, 0, height - borderRadius);
            context.lineTo(0, borderRadius);
            context.quadraticCurveTo(0, 0, borderRadius, 0);
            context.closePath();
            context.clip();
        }

        if (keepRatio) {
            const imgRatio = src.height / src.width;
            const canvasRatio = height / width;

            if (imgRatio >= canvasRatio) {
                const h = width * imgRatio;
                context.drawImage(src, 0, (height - h) / 2, width, h);
            } else {
                const w = height / imgRatio;
                context.drawImage(src, (width - w) / 2, 0, w, height);
            }
        } else {
            context.drawImage(src, 0, 0, width, height);
        }

        return canvas;
    }


    static async cropImageFromURL(url: string, width?: number, height?: number, keepRatio?: boolean): Promise<Canvas> {
        const img = await loadImage(url);
        return this.cropImage(img, width, height, keepRatio);
    }

    static async cropImageFromBuffer(buffer: Buffer, width?: number, height?: number, keepRatio?: boolean): Promise<Canvas> {
        const img = await loadImage(buffer);
        return this.cropImage(img, width, height, keepRatio);
    }
}