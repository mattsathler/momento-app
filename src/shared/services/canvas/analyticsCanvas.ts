import { Canvas, Image, loadImage } from "canvas";
import { Post } from "../../models/Post";
import { User } from "../../models/User";
import { Log } from "../../models/Log";
import { calculateSizes, Sizes, Styles } from "../../models/Style";
import { defaultTheme } from "../../models/Theme";
import { LinkService } from "../linkService";
import { TextChannel } from "discord.js";
import { cropCirclePicture } from "./canvasService";
import { ImageCropper } from "../ImageCropper";
import { drawTextInCanvas } from "./TextCanvas";
import { drawChart } from "./ChartCanvas";

export async function drawPostAnalytics(uploadChannel: TextChannel, post: Post, author: User, likesLogs: Log[], newFollowers: number) {
    const analyticsWidth = Styles.sizes.large.post.width;
    const theme = defaultTheme;
    let x = 0, y = 0;;
    const sizes = calculateSizes(analyticsWidth);
    let canvas = new Canvas(1080, 720);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = theme.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ANALYTICS HEADER ========================
    x = sizes.medium;
    y += sizes.medium;
    ctx.quality = 'best';
    const analyticsIcon = await loadImage('./Styles/Assets/Icons/analytics.png');
    ctx.drawImage(analyticsIcon, sizes.medium, y, 40, 40);
    const profileImageUrl: string | undefined = await LinkService.readImageOfMomento(uploadChannel, author.imagesUrl.profilePicture);
    if (!profileImageUrl) { throw new Error('Erro ao carregar imagem de perfil') }
    const authorUserImage = await loadImage(profileImageUrl);
    const circularUserImage = cropCirclePicture(ImageCropper.cropImage(authorUserImage, 60, 60), 60, 60);
    ctx.drawImage(circularUserImage, canvas.width - 80, y - 10);

    ctx.fillStyle = theme.colors.primary;
    ctx.font = `${sizes.medium}px sfpro-medium`;
    ctx.fillText('Analytics - Confira o alcance do seu post!', x + 40 + sizes.small, y + 26);
    y += 40 + sizes.medium;
    ctx.fillRect(x, y, canvas.width - x * 2, 1);
    y += sizes.medium;

    // POST IMAGE ==============================
    const postImageURL: string | undefined = post.content.thumbUrl ? await LinkService.readImageOfMomento(uploadChannel, post.content.thumbUrl) : undefined;
    const postImage: Image = post.content.imagesCount > 0 && postImageURL ? await loadImage(postImageURL) : await loadImage('./Styles/Assets/Templates/no-photo.png');
    ctx.drawImage(ImageCropper.cropImage(postImage, canvas.width / 3, canvas.height - y - sizes.medium), x, y);

    // POST CONTENT ============================
    ctx.fillStyle = '#eaeaea';
    ctx.font = `${sizes.medium}px sfpro-medium`;
    x += canvas.width / 3 + sizes.medium;
    ctx.fillRect(x, y, canvas.width - x - sizes.medium, canvas.height - y - sizes.medium);

    x += sizes.small;
    y += sizes.small;

    ctx.fillStyle = theme.colors.background;
    let descriptionBoxHeight = 120;
    if (post.content.description) {
        const descriptionBox = drawTextInCanvas(`@${author.username}: "${post.content.description.length > 100 ? post.content.description.slice(0, 100) + "..." : post.content.description}"`, defaultTheme, 'SFPRODISPLAYMEDIUM', canvas.width - x - sizes.small * 2 - sizes.medium, sizes.medium);
        descriptionBoxHeight = descriptionBox.height + 4;
        ctx.fillRect(x, y, canvas.width - x - sizes.small - sizes.medium, descriptionBoxHeight);
        ctx.drawImage(descriptionBox, x + sizes.small, y + 4);
    }

    y += descriptionBoxHeight + sizes.small;
    const highlightsBoxSize = ((canvas.width - x - sizes.medium - sizes.small * 3) / 3);


    const likesIcon = await loadImage('./Styles/Assets/Icons/likes.png');
    createInfoBox(canvas, likesIcon, `Teve ${likesLogs.length} curtida(s) e ${newFollowers} novos seguidor(es)`, x, y, highlightsBoxSize, sizes)
    x += highlightsBoxSize + sizes.small

    if (post.stats.isTrending) {
        const trendingIcon = await loadImage('./Styles/Assets/Icons/trending.png');
        createInfoBox(canvas, trendingIcon, 'Esse momento estava entre os Trendings Topics!', x, y, highlightsBoxSize, sizes)
        x += highlightsBoxSize + sizes.small
    }

    y += highlightsBoxSize + sizes.small;

    x = canvas.width / 3 + sizes.medium * 2 + sizes.small;
    const likesChart = drawChart(post.stats.date.getHours(), likesLogs, canvas.width - x - sizes.small - sizes.medium, canvas.height - y - sizes.small - sizes.medium);
    ctx.drawImage(likesChart, x, y);
    return canvas;
}

function createInfoBox(canvas: Canvas, icon: Image, text: string, x: number, y: number, size: number, sizes: Sizes): void {
    const ctx = canvas.getContext('2d');
    const boxText = drawTextInCanvas(text, defaultTheme, 'SFPRODISPLAYMEDIUM', size - sizes.small * 2, sizes.medium, 'center');
    ctx.fillRect(x, y, size, 80 + boxText.height + sizes.medium * 2);

    y += size / 2
    ctx.drawImage(icon, x + size / 2 - 40, y - 80, 80, 80);
    ctx.drawImage(boxText, x + sizes.small, y + sizes.small);
    x += size + sizes.small

    return
}