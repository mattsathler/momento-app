import { Canvas } from "canvas";
import { Log } from "../../models/Log";
import { resizeCanvas } from "./TextCanvas";
export function drawChart(postHour: number, logs: Log[], width: number, height: number): Canvas {
    width -= 20;
    height -= 20;
    let canvas = new Canvas(width, height)
    let ctx = canvas.getContext('2d');

    ctx.font = '12px bold sfpro-medium';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let likesPerHour: number[] = Array(24).fill(0);
    logs.forEach((log) => {
        const timestamp = new Date(log.timestamp);
        const hour = timestamp.getHours();
        likesPerHour[hour] += 1;
    });

    const maxCount = Math.max(...likesPerHour);

    ctx.strokeStyle = '#AEAEAE';
    ctx.beginPath();
    ctx.moveTo(8, 8);
    ctx.lineTo(8, height - 8);
    ctx.lineTo(width - 8, height - 8);
    ctx.stroke();
    ctx.closePath();

    const barWidth = (width - 16) / (likesPerHour.length - 1);
    ctx.lineWidth = 1;
    let x = 8;
    let y = height - 8;
    const barMaxHeight = (height - 16) / (maxCount);

    for (let i = 0; i <= maxCount; i += 2) {
        ctx.beginPath();
        ctx.strokeStyle = '#EAEAEA';
        ctx.lineWidth = 2;
        ctx.moveTo(8, barMaxHeight * i + 8);
        ctx.lineTo(width - 8, barMaxHeight * i + 8);
        ctx.stroke();
        ctx.closePath();
    }
    x = 8;
    y = height - 8;

    ctx.moveTo(x, y)
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < likesPerHour.length; i++) {
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#DD247B';
        const barHeight = (likesPerHour[i] / maxCount) * (height - 16);
        ctx.lineTo(x, y - barHeight);
        ctx.fillStyle = '#DD247B';

        if (likesPerHour[i] != 0 && likesPerHour[i] != maxCount) {
            ctx.fillText(likesPerHour[i].toString(), x + 8, y - barHeight + 16);
        }
        x += barWidth;
    }
    ctx.stroke();
    ctx.closePath();
    x = 8;
    y = height - 8;
    for (let i = 0; i < likesPerHour.length; i++) {
        y = ((height - 8) - (likesPerHour[i] / maxCount) * (height - 16));
        ctx.beginPath();
        ctx.strokeStyle = i === postHour ? '#D75413' : '#DD247B';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'white';
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();

        x += barWidth;
        ctx.moveTo(x, y)
        ctx.closePath();
        ctx.stroke();
    }
    ctx.closePath();
    x = barWidth + 8;
    y = height - 8;

    //ADD LABELS
    canvas = resizeCanvas(canvas, canvas.width + 25, canvas.height + 25);
    ctx = canvas.getContext('2d');
    ctx.fillStyle = '#AEAEAE';
    ctx.textAlign = 'left';

    ctx.fillText(maxCount.toString(), width + 4, 12);
    ctx.fillText('0', width + 4, y);

    for (let i = 0; i < 24; i++) {
        ctx.fillText(i.toString() + 'h', barWidth * i, y + 22);
        x += barWidth;
    }
    return canvas;
}
