import { Canvas, Image, loadImage, registerFont } from "canvas";
import { Post } from "../../models/Post";
import { Log } from "../../models/Log";
import { LinkService } from "../linkService";
import { TextChannel } from "discord.js";
import { cropCirclePicture } from "./CanvasService";
import { ImageCropper } from "../ImageCropper";
import { drawTextInCanvas } from "./TextCanvas";
import { drawChart } from "./ChartCanvas";
import { User } from "../../models/user";
import { calculateSizes, Sizes, Styles } from "../../models/style";
import { defaultTheme, Theme } from "../../models/theme";
import { assetPaths, fontsPaths } from "assets-paths";
import { generateSurface } from "../ThemeService";
import { drawCard } from "src/momento-ui/atoms/cards";

export async function drawPostAnalytics(uploadChannel: TextChannel, post: Post, author: User, likesLogs: Log[], newFollowers: number, theme: Theme) {
    registerFont(fontsPaths.SFPROBOLD, { family: 'sfpro-bold' })
    registerFont(fontsPaths.SFPROMEDIUM, { family: 'sfpro-medium' })
    const analyticsWidth = Styles.sizes.large.post.width;
    theme = theme ?? defaultTheme;
    theme.colors.surface = generateSurface(theme.colors.background);

    let x = 0, y = 0;;
    const sizes = calculateSizes(analyticsWidth);
    let canvas = new Canvas(1080, 720);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = theme.colors.surface;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ANALYTICS HEADER ========================
    x = sizes.medium;
    y += sizes.medium;
    ctx.quality = 'best';
    const analyticsIcon = await loadImage(assetPaths.analyticsIcon);
    const profileImageUrl: string | undefined = await LinkService.readImageOfMomento(uploadChannel, author.imagesUrl.profilePicture);
    if (!profileImageUrl) { throw new Error('Erro ao carregar imagem de perfil') }

    const authorUserImage = await loadImage(profileImageUrl);
    const followersIcon = await loadImage(assetPaths.followersIcon);
    const likesIcon = await loadImage(assetPaths.likesIcon);
    const circularUserImage = cropCirclePicture(ImageCropper.cropImage(authorUserImage, 40, 40), 40, 40);

    drawCard(ctx, x, y, canvas.width - (sizes.medium * 2), (sizes.big * 2), 24, theme.colors.background);

    x += sizes.medium;
    y += sizes.small;

    ctx.drawImage(analyticsIcon, x, y, 40, 40);
    ctx.drawImage(circularUserImage, canvas.width - (sizes.medium * 4), y);

    x += 40 + sizes.medium;

    ctx.font = '24px sfpro-bold';
    const titleSize = ctx.measureText('Analytics');
    ctx.textBaseline = "middle";
    y += sizes.medium;
    ctx.fillStyle = theme.colors.primary;
    ctx.fillText('Analytics', x, y);
    ctx.font = '20px sfpro-medium';
    ctx.fillText('Confira o alcance do seu momento!', (x + sizes.medium + titleSize.width), y);

    x = sizes.medium;
    y += sizes.big;

    const cardWidth = canvas.width / 2 - sizes.small - sizes.small;
    const cardHeight = (canvas.height - y - (sizes.medium * 3)) / 3;

    y += sizes.small;

    const contentY = y;


    drawCard(ctx, x, y, cardWidth, cardHeight, 24, theme.colors.background);

    x = sizes.medium;

    // POST IMAGE ==============================
    const postImageURL: string | undefined = post.content.thumbUrl ? await LinkService.readImageOfMomento(uploadChannel, post.content.thumbUrl) : undefined;
    const postImage: Image = post.content.imagesCount > 0 && postImageURL ? await loadImage(postImageURL) : await loadImage(assetPaths.noPhoto);
    ctx.drawImage(ImageCropper.cropImage(postImage, cardWidth, canvas.height - y - sizes.medium, true, 24), x, y);

    // POST DESCRIPTION ========================
    if (post.content.description) {
        const descriptionWidth = cardWidth;
        drawCard(ctx, x, canvas.height - sizes.medium - ((canvas.height - y - sizes.medium) / 3), cardWidth, (canvas.height - y - sizes.medium) / 3, 24, theme.colors.background);
        const description = drawTextInCanvas(post.content.description || '', theme, '', descriptionWidth - x - sizes.medium, sizes.medium, 'left', ((canvas.height - y - sizes.medium) / 3) - sizes.medium * 2);
        y = canvas.height - sizes.medium - ((canvas.height - y - sizes.medium) / 3);
        y += sizes.medium;

        ctx.drawImage(description, x + sizes.medium, y);
    }


    y = contentY;

    // STATS ===================================
    x += cardWidth + sizes.small;
    const contentX = x;

    drawCard(ctx, x, y, cardWidth, cardHeight, 24, theme.colors.background);
    y += (cardHeight / 2) - 60;
    x += (cardWidth / 2) - 30;


    // FOLLOWERS
    ctx.drawImage(followersIcon, x, y, 60, 60);

    y += 60;

    y += sizes.medium
    x = sizes.medium;
    x = cardWidth + sizes.big;
    x += (cardWidth / 2);


    ctx.textAlign = "center";

    ctx.fillStyle = theme.colors.primary;
    ctx.font = '20px sfpro-bold';
    ctx.fillText(`+${String(newFollowers)}`, x, y);

    ctx.fillStyle = theme.colors.secondary;
    ctx.font = '20px sfpro-medium';
    y += sizes.medium;
    ctx.fillText(`Novos Seguidores`, x, y);

    // LIKES
    y = contentY + cardHeight + sizes.small;
    x = contentX;

    drawCard(ctx, x, y, cardWidth, cardHeight, 24, theme.colors.background);

    y += (cardHeight / 2) - 60;
    x += (cardWidth / 2) - 30;

    ctx.drawImage(likesIcon, x, y, 60, 60);

    y += 60;

    y += sizes.medium
    x = sizes.medium;
    x = cardWidth + sizes.big;
    x += (cardWidth / 2);

    ctx.textAlign = "center";

    ctx.fillStyle = theme.colors.primary;
    ctx.font = '20px sfpro-bold';
    ctx.fillText(`${String(likesLogs.length || 0)}`, x, y);

    ctx.fillStyle = theme.colors.secondary;
    ctx.font = '20px sfpro-medium';
    y += sizes.medium;
    ctx.fillText(`Curtidas`, x, y);

    // CHART

    y = contentY + (cardHeight * 2) + (sizes.small * 2);
    x = contentX;

    drawCard(ctx, x, y, cardWidth, cardHeight, 24, theme.colors.background);
    const likesChart = drawChart(post.stats.date.getHours(), likesLogs, cardWidth - sizes.medium, cardHeight - sizes.medium, theme);
    ctx.drawImage(likesChart, x + sizes.small, y + sizes.small);

    return canvas;
}