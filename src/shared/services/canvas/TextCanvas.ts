import { Canvas, registerFont } from "canvas";
import { Theme } from "../../models/Theme";

export function drawTextInCanvas(text: string, theme: Theme, fontName: string, maxWidth: number, size: number, textAlign = 'left'): Canvas {
    let canvas = new Canvas(maxWidth, 4000);
    const ctx = canvas.getContext('2d');

    ctx.quality = 'best';
    ctx.fillStyle = theme.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let x: number = 0;
    let y: number = size;

    ctx.textAlign = 'left';

    ctx.fillStyle = theme.colors.primary;
    registerFont(`./Styles/Assets/Fonts/${fontName}.otf`, { family: fontName })
    ctx.font = `${size}px ${fontName}`;

    const words = text.split(' ');
    let currentLine = '';

    for (let word of words) {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth > maxWidth || word === '/N') {
            if (textAlign == 'center') {
                x = (maxWidth - ctx.measureText(currentLine).width) / 2;
            }
            ctx.fillText(currentLine, Math.round(x), Math.round(y));
            y += size;
            if (word !== '/N') {
                currentLine = word;
            }
        } else {
            currentLine = testLine;
        }
    }

    if (textAlign == 'center') {
        x = (maxWidth - ctx.measureText(currentLine).width) / 2;
    }
    ctx.fillText(currentLine, Math.round(x), Math.round(y));
    y += size;

    canvas = resizeCanvas(canvas, canvas.width, y)
    return canvas;
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