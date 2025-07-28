import { Canvas, Image, loadImage } from "skia-canvas"

export class ImageCropper {
    static cropImage(src: Image, width?: number, height?: number, keepRatio?: boolean): Canvas {
        width = width ?? src.width;
        height = height ?? src.height;
        keepRatio = keepRatio ?? true;

        const canvas = new Canvas(width, height);
        const context = canvas.getContext('2d');

        if (keepRatio) {
            const imgRatio = src.height / src.width;
            const canvasRatio = canvas.height / canvas.width;

            if (imgRatio >= canvasRatio) {
                const h = canvas.width * imgRatio;
                context.drawImage(src, 0, (canvas.height - h) / 2, canvas.width, h);
            }
            if (imgRatio < canvasRatio) {
                const w = canvas.width * canvasRatio / imgRatio;
                context.drawImage(src, (canvas.width - w) / 2, 0, w, canvas.height);
            }
        }
        else {
            const canvas = new Canvas(width, height);
            const context = canvas.getContext('2d');
            context.drawImage(src, 0, 0, canvas.width, canvas.height);
        }

        return canvas
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