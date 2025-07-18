import { Canvas } from "canvas";
import { Log, LogType } from "../../models/Log";
import { resizeCanvas } from "./TextCanvas";
import { Theme } from "src/shared/models/Theme";

function generateMockupLogs(count: number): Log[] {
    const now = Date.now();
    const logs: Log[] = [];

    for (let i = 0; i < count; i++) {
        const offset = Math.floor(Math.random() * 24 * 60 * 60 * 1000); // até 24h em ms
        const timestamp = new Date(now - offset);

        logs.push({
            type: LogType.Like,
            timestamp,
        });
    }

    return logs;
}

export function drawChart(postHour: number, logs: Log[], width: number, height: number, theme: Theme): Canvas {

    width -= 20;
    height -= 20;

    let canvas = new Canvas(width, height);
    let ctx = canvas.getContext('2d');

    ctx.font = '12px regular sfpro';
    ctx.fillStyle = theme.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let likesPerHour: number[] = Array(24).fill(0);
    logs.forEach((log) => {
        const timestamp = new Date(log.timestamp);
        const hour = timestamp.getHours();
        likesPerHour[hour] += 1;
    });

    const maxCount = Math.max(...likesPerHour);
    const shiftedLikes = likesPerHour.slice(postHour).concat(likesPerHour.slice(0, postHour));

    ctx.strokeStyle = theme.colors.surface || '#f0f0f0';
    ctx.beginPath();
    ctx.moveTo(8, 8);
    ctx.lineTo(8, height - 8);
    ctx.lineTo(width - 8, height - 8);
    ctx.stroke();
    ctx.closePath();

    const barWidth = (width - 16) / (shiftedLikes.length - 1);
    const barMaxHeight = (height - 16) / maxCount;

    for (let i = 0; i <= maxCount; i += 2) {
        ctx.beginPath();
        ctx.strokeStyle = theme.colors.surface || '#f0f0f0';
        ctx.lineWidth = 2;
        ctx.moveTo(8, barMaxHeight * i + 8);
        ctx.lineTo(width - 8, barMaxHeight * i + 8);
        ctx.stroke();
        ctx.closePath();
    }

    let x = 8;
    let y = height - 8;

    ctx.beginPath();
    const firstHeight = (shiftedLikes[0] / maxCount) * (height - 16);
    ctx.moveTo(x, y - firstHeight);

    for (let i = 0; i < shiftedLikes.length; i++) {
        ctx.lineJoin = 'round';
        ctx.strokeStyle = theme.colors.primary;

        const barHeight = (shiftedLikes[i] / maxCount) * (height - 16);
        ctx.lineTo(x, y - barHeight);

        if (shiftedLikes[i] !== 0) {
            ctx.fillStyle = theme.colors.primary;

            const isNextLower = i < shiftedLikes.length - 1 && shiftedLikes[i + 1] < shiftedLikes[i];
            const textOffsetY = isNextLower ? -8 : 16;

            ctx.fillText(shiftedLikes[i].toString(), x - 6, y - barHeight + textOffsetY);
        }
        x += barWidth;
    }
    ctx.stroke();
    ctx.closePath();

    x = 8;
    for (let i = 0; i < shiftedLikes.length; i++) {
        y = (height - 8) - (shiftedLikes[i] / maxCount) * (height - 16);
        ctx.beginPath();
        ctx.strokeStyle = i === 0 ? theme.colors.secondary : theme.colors.primary;
        ctx.lineWidth = 2;
        ctx.fillStyle = theme.colors.background;
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        x += barWidth;
    }

    canvas = resizeCanvas(canvas, canvas.width + 25, canvas.height + 25);
    ctx = canvas.getContext('2d');
    ctx.fillStyle = theme.colors.secondary;
    ctx.textAlign = 'left';

    ctx.fillText(maxCount.toString(), width + 4, 12);
    ctx.fillText('0', width + 4, height - 8);

    for (let i = 0; i < 24; i++) {
        const realHour = (i + postHour) % 24;
        const labelX = barWidth * i;
        ctx.fillText(`${realHour}h`, labelX, height + 14);
    }

    return canvas;

}

