import { Canvas, Image,  loadImage } from "skia-canvas";

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

export function imageToCanvas(image: Image): Canvas {
    const canvas = new Canvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    return canvas;
}

export function calculateTextHeight(text: string, font: string, width: number, size: number): number {
    const canvas = new Canvas(600, 600);
    const ctx = canvas.getContext('2d');
    if (!ctx) { throw new Error("2D context not supported!") }

    ctx.font = font;
    const words = text.split(' ');

    let currentLine = '';
    let totalHeight = 0;

    for (let word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth > width || word === '/N') {
            totalHeight += size;
            if (word !== '/N') {
                currentLine = word;
            }
        } else {
            currentLine = testLine;
        }
    }

    totalHeight += size;
    return totalHeight;
}

export function resizeCanvas(originalCanvas: Canvas, newWidth: number, newHeight: number): Canvas {
    const newCanvas = new Canvas(newWidth, newHeight);
    newCanvas.width = newWidth;
    newCanvas.height = newHeight;

    const ctx = newCanvas.getContext('2d');
    if (!ctx) { throw new Error("2D context not supported!") }

    ctx.drawImage(originalCanvas, 0, 0);

    return newCanvas;
}


export function changePixelColor(image: Image, targetColor: number[], newColor: number[] | string) {
    if (typeof newColor === 'string') {
        newColor = hexToRgb(newColor);
    }
    var canvas = new Canvas(image.width, image.height);
    var ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0);
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;


    for (var i = 0; i < data.length; i += 4) {
        if (data[i] === targetColor[0] && data[i + 1] === targetColor[1] && data[i + 2] === targetColor[2]) {
            data[i] = newColor[0];
            data[i + 1] = newColor[1];
            data[i + 2] = newColor[2];
        }
    }


    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

function hexToRgb(hex: string): number[] {
    hex = hex.replace(/^#/, '');

    const hexRegex = /^[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(hex)) {
        throw new Error('Código HEX inválido. Certifique-se de fornecer um código de cor HEX válido de 6 caracteres (sem incluir o "#").');
    }

    const red = parseInt(hex.substring(0, 2), 16);
    const green = parseInt(hex.substring(2, 4), 16);
    const blue = parseInt(hex.substring(4, 6), 16);

    return [red, green, blue];
}

export async function validateImageURL(url: string): Promise<boolean> {
    try {
        const img = await loadImage(url);
        if (img) {
            return true;
        }
        return false;
    }
    catch {
        return false;
    }

}
