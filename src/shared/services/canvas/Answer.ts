import { createCanvas, loadImage, Canvas, registerFont, Image } from "canvas";
import { ImageCropper } from "../../../bots/momento-core/Utils/ImageCropper";
import { cropCirclePicture } from "../../../bots/momento-core/Utils/Pictures";
import { IContext } from "../../../bots/momento-core/Interfaces/IContext";
import { calculateSizes, Styles } from "src/shared/models/Style";
import { LinkService } from "src/shared/services/LinkService";
import { Theme } from "src/shared/models/Theme";
import { User } from "src/shared/models/User";
import { assetPaths, fontsPaths } from "assets-paths";
import { drawTextInCanvas } from "src/shared/services/canvas/TextCanvas";

export async function drawAnswerCanvas(context: IContext, question: string, answer: string, questionAuthor: string, user: User, theme: Theme): Promise<Canvas> {
    registerFont(fontsPaths.SFPROBOLD, { family: 'sfpro-bold' })
    registerFont(fontsPaths.SFPROMEDIUM, { family: 'sfpro-medium' })
    registerFont(fontsPaths.SFPROREGULAR, { family: 'sfpro-regular' })

    const asktheme: Theme = {
        name: 'AskTheme',
        creatorId: 'system',
        colors: {
            primary: '#FFFFFF',
            secondary: '#EAEAEA',
            background: '#DD247B'
        }

    }
    const canvas = createCanvas(Styles.sizes.large.post.width, Styles.sizes.large.post.height);
    const ctx = canvas.getContext('2d');
    const sizes = calculateSizes(canvas.width)
    ctx.quality = "best";

    let y = sizes.huge;
    let x = sizes.huge;

    // ctx.fillStyle = theme.colors.background;
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    // HEADER ========================================
    const questionIcon = await loadImage(assetPaths.questionIcon);
    const questionBoxSize = {
        width: canvas.width - (2 * sizes.huge),
        height: canvas.height / 3
    }
    ctx.fillStyle = "#DD247B";
    ctx.fillRect(x, y, questionBoxSize.width, questionBoxSize.height);
    x = questionBoxSize.width / 2 - sizes.huge + 70;
    y = questionBoxSize.height / 2 - 70;
    ctx.drawImage(questionIcon, x, y, 70, 70);
    y += 70 + sizes.huge;
    x += 35;

    ctx.textAlign = 'center';
    ctx.font = `${sizes.big}px sfpro-bold`;
    ctx.fillStyle = asktheme.colors.secondary;
    ctx.fillText(questionAuthor, x, y);

    y += sizes.medium;
    const questionCanvas = drawTextInCanvas(question, asktheme, 'SFPRODISPLAYMEDIUM', questionBoxSize.width - (2 * sizes.huge), sizes.big, 'center');
    ctx.drawImage(questionCanvas, sizes.huge * 2, y);

    // ANSWER ========================================
    y = questionBoxSize.height + sizes.huge + sizes.big;
    x = sizes.huge;

    // RECTANGLE BORDERS =============================
    ctx.strokeStyle = theme.colors.secondary;
    ctx.lineWidth = 3;
    ctx.fillStyle = theme.colors.background;
    ctx.fillRect(x, y, canvas.width - (2 * sizes.huge), canvas.height - y - sizes.huge);
    ctx.strokeRect(x + 1.5, y, canvas.width - (2 * sizes.huge) - 3, canvas.height - y - sizes.huge);

    y += sizes.huge;
    const profileImageUrl: string | undefined = await LinkService.readImageOfMomento(context.uploadChannel, user.imagesUrl.profilePicture);
    if (!profileImageUrl) { throw new Error('Erro ao carregar imagem de perfil') }
    
    const profilePicture = await loadImage(profileImageUrl);
    if (!profilePicture) { throw new Error('Invalid profile picture') }
    const circlePicture = cropCirclePicture(ImageCropper.cropImage(profilePicture, 150, 150, true), 150, 150);
    ctx.drawImage(circlePicture, canvas.width / 2 - 75, y);
    y += 150 + sizes.big;

    let answerSize: number;
    if (answer.length > 100) {
        answerSize = sizes.big;
    } else {
        answerSize = sizes.huge;
    }

    const answerCanvas = drawTextInCanvas(answer, theme, 'SFPRODISPLAYREGULAR', canvas.width - (4 * sizes.huge), answerSize, 'center');
    ctx.drawImage(answerCanvas, sizes.huge * 2, y);

    ctx.fillStyle = theme.colors.primary;
    y += answerCanvas.height + answerSize;
    ctx.fillText(`@${user.username}`, canvas.width / 2, y);

    return canvas;
}