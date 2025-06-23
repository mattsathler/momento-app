import { Canvas, Image, loadImage } from "canvas";
import { drawNotificationHeader } from "./NotificationHeader";
import { defaultTheme, Theme } from "src/shared/models/Theme";
import { calculateSizes, Sizes } from "src/shared/models/Style";
import { drawTextInCanvas } from "src/shared/services/canvas/TextCanvas";

export async function drawTextNotification(text: string, theme?: Theme, authorPicture?: Image, authorUsername: string = 'momentoapp', authorName: string = 'MOMENTO APP'): Promise<Canvas> {
    authorPicture = authorPicture ?? await loadImage('https://imgur.com/fZdmjLn.png');
    theme = theme ?? defaultTheme;
    const font = 'SFPRODISPLAYREGULAR';
    
    const width = 1280;
    const sizes: Sizes = calculateSizes(width)
    const notificationHeader = await drawNotificationHeader(theme, authorPicture, authorUsername, authorName, undefined, width);
    const notificationText = drawTextInCanvas(text, theme, font, width - 2 * sizes.big, sizes.big);
    
    const canvas = new Canvas(width, notificationHeader.height + notificationText.height + sizes.medium);
    const ctx = canvas.getContext('2d');

    ctx.quality = 'best';
    ctx.fillStyle = theme.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(notificationHeader, 0, 0);
    ctx.drawImage(notificationText, sizes.big, notificationHeader.height);

    return canvas
}