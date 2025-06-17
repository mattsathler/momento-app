import { drawRoundedRect } from "../primitives/drawRect";
import { CanvasRenderingContext2D } from 'canvas';

export function drawCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number, fill: string) {
    drawRoundedRect(ctx, x, y, w, h, radius);
    ctx.fillStyle = fill;
    ctx.fill();
}