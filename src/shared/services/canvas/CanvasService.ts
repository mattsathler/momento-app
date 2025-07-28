import { Canvas,  Image, loadImage } from "skia-canvas";

export function cropCirclePicture(image: Canvas, width: number = 80, height: number = 80): Canvas {
    try {
        const canvas: Canvas = new Canvas(width, height);
        const context = canvas.getContext('2d');

        context.save();
        context.beginPath();
        context.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, 2 * Math.PI, false);
        context.clip();
        context.drawImage(image, 0, 0);
        context.restore();

        return canvas
    }
    catch (err) {
        console.error(err)
        throw new Error('Erro ao cortar imagem de perfil');
    }
}

export function cropImage(src: Image, width?: number, height?: number, keepRatio?: boolean): Canvas {
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

export async function cropImageFromURL(url: string, width?: number, height?: number, keepRatio?: boolean): Promise<Canvas> {
    const img = await loadImage(url);
    return cropImage(img, width, height, keepRatio);
}

export async function cropImageFromBuffer(buffer: Buffer, width?: number, height?: number, keepRatio?: boolean): Promise<Canvas> {
    const img = await loadImage(buffer);
    return cropImage(img, width, height, keepRatio);
}
