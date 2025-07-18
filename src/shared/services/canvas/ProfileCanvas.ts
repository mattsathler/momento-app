import { createCanvas, loadImage, Canvas, Image } from "canvas";
import { cropCirclePicture, cropImage } from "./CanvasService";
import { TextChannel } from "discord.js";
import { StringService } from "../StringService";
import { calculateSizes, Sizes, Styles } from "../../models/Style";
import { LinkService } from "../LinkService";
import { User } from "../../models/User";
import { defaultTheme, Theme } from "../../models/Theme";
import { MomentoService } from "../MomentoService";
import { assetPaths } from "assets-paths";

export async function drawProfileCanvas(user: User, uploadChannel: TextChannel, theme: Theme, momentos: number, trendings: number): Promise<Canvas> {
    const canvas = createCanvas(Styles.sizes.large.profile.stats.width, Styles.sizes.large.profile.stats.height);
    const ctx = canvas.getContext('2d');
    theme = MomentoService.isUserVerified(user.stats.isVerified) ? theme : defaultTheme;

    ctx.fillStyle = theme.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let coverImage: Image | null = null;
    const profileImageUrl: string | undefined = await LinkService.readImageOfMomento(uploadChannel, user.imagesUrl.profilePicture);
    if (!profileImageUrl) { throw new Error('Erro ao carregar imagem de perfil') }

    if (user.imagesUrl.profileCover) {
        const coverImageURL = await LinkService.readImageOfMomento(uploadChannel, user.imagesUrl.profileCover);
        if (!coverImageURL) { throw new Error('Erro ao carregar imagem de perfil') }
        coverImage = await loadImage(coverImageURL);
    }
    const profileImage: Image = await loadImage(profileImageUrl);
    if (!profileImage) { throw new Error('Erro ao carregar imagem de perfil') }

    const profileImageSize = Styles.sizes.large.profile.stats.width / 5.5;
    const profileCoverWidth = canvas.width;
    const profileCoverHeight = profileImageSize;

    //CROPPERS ========================================
    const profileImageCanvas: Canvas = cropImage(profileImage, profileImageSize, profileImageSize, true);
    let coverCanvas: Canvas | null = null;
    if (coverImage) {
        coverCanvas = cropImage(coverImage, profileCoverWidth, profileCoverHeight, true);
    }
    const circleProfilePicture = cropCirclePicture(profileImageCanvas, profileImageSize, profileImageSize)

    if (!circleProfilePicture) { throw new Error('Erro ao cortar imagem de perfil') }

    let y = 0;

    const sizes: Sizes = calculateSizes(canvas.width)

    // // COVER ==========================================
    if (coverCanvas) {
        ctx.drawImage(
            coverCanvas,
            0, 0,
            profileCoverWidth,
            profileCoverHeight
        );
    }
    // // PROFILE ========================================
    ctx.drawImage(
        circleProfilePicture,
        canvas.width / 2 - profileImageSize / 2,
        profileImageSize / 2,
        profileImageSize,
        profileImageSize
    );
    y += profileImageSize * 1.5 + sizes.big;
    
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.colors.secondary;

    ctx.font = `${sizes.medium}px ${user.styles.fonts.secondary}`;
    ctx.fillText(`@${user.username}`, canvas.width / 2, y);
    y += sizes.big;


    ctx.fillStyle = theme.colors.primary;
    ctx.font = `${sizes.big}px ${user.styles.fonts.primary}`;
    ctx.fillText(`${user.name} ${user.surname}`, canvas.width / 2, y);

    if (MomentoService.isUserVerified(user.stats.isVerified)) {
        const measureGap = canvas.width / 2 + sizes.tiny + ((ctx.measureText(user.name).width + ctx.measureText(user.surname).width + sizes.small) / 2);
        const verifiedIcon = await loadImage(assetPaths.verifiedIcon)
        ctx.drawImage(verifiedIcon, measureGap, y - 40, 40, 40);
    }

    y += sizes.medium;

    ctx.fillStyle = theme.colors.secondary;
    ctx.font = `${sizes.medium}px ${user.styles.fonts.secondary}`;
    ctx.fillText(user.bio, canvas.width / 2, y);
    y += sizes.big;

    // HIGHLIGHTS ======================================
    const hightlightsSectionSize = canvas.width * 0.5;
    const highlightSize = (hightlightsSectionSize - (sizes.medium * 6)) / 5;

    for (let i = 0; i < user.imagesUrl.highlights.length; i++) {
        const highlightImageUrl: string | undefined = await LinkService.readImageOfMomento(uploadChannel, user.imagesUrl.highlights[i]);
        if (!highlightImageUrl) { throw new Error('Erro ao carregar imagem de perfil') }

        let highlightImage = await loadImage(highlightImageUrl);
        const x = (canvas.width - hightlightsSectionSize) / 2 + (i * (highlightSize + sizes.medium)) + sizes.medium

        const croppedHighlightImage: Canvas | undefined = cropImage(highlightImage, highlightSize, highlightSize, true);
        if (!croppedHighlightImage) { throw new Error('Erro ao carregar imagem de destaque') }
        const circleHighlightImage = cropCirclePicture(croppedHighlightImage, highlightSize, highlightSize);
        if (!circleHighlightImage) { throw new Error('Erro ao cortar imagem de destaque') }

        ctx.drawImage(
            circleHighlightImage,
            x,
            y,
            highlightSize,
            highlightSize
        );
    }
    y += (sizes.big * 1.6) + highlightSize;

    // STATS ===========================================
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.colors.primary;
    ctx.font = `${sizes.big}px ${user.styles.fonts.primary}`;

    ctx.fillText(momentos.toString(), canvas.width / 2 - (sizes.big * 5), y);
    ctx.fillText(trendings.toString(), canvas.width / 2, y);
    ctx.fillText(StringService.formatForProfile(user.stats.followers, 1), canvas.width / 2 + (sizes.big * 5), y);

    y += sizes.medium;

    // STATS LABELS ====================================
    ctx.fillStyle = theme.colors.secondary;
    ctx.font = `${sizes.medium}px ${user.styles.fonts.secondary}`;
    ctx.fillText('momentos', canvas.width / 2 - (sizes.big * 5), y);
    ctx.fillText('trends', canvas.width / 2, y);
    ctx.fillText('followers', canvas.width / 2 + (sizes.big * 5), y);

    y = canvas.height - sizes.small;

    ctx.textAlign = "left";
    ctx.font = `${sizes.small}px ${user.styles.fonts.secondary}`;
    ctx.fillText(`Último momento: ${StringService.formatDate(user.stats.lastOnline || 'Indisponível', 'DD/MM/YYYY')}`, sizes.small, y);
    return canvas
}