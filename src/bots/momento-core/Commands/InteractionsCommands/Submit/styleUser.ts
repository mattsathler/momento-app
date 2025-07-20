import { ComponentType, ModalSubmitInteraction } from "discord.js";
import { ICommand } from "../../../Interfaces/ICommand";
import { Permission } from "../../../Interfaces/IPermission";
import { IContext } from "../../../Interfaces/IContext";
import { ProfileServices } from "../../../Utils/ProfileServices";
import { Theme } from "src/shared/models/Theme";
import { Fonts } from "src/shared/models/Fonts";
import { fontsPaths } from "assets-paths";
import { User } from "src/shared/models/user";
import { MomentoService } from "src/shared/services/MomentoService";

interface IEditableFields {
    styles: {
        theme: string | null,
        collage: string | null,
        fonts: {
            primary: string | null,
            secondary: string | null
        }
    }
}

export const styleUser: ICommand = {
    permission: Permission.user,
    isProfileCommand: true,
    reply: 'Estilizando seu perfil',
    success: 'Perfil estilizado com sucesso!',
    exec: styleUserProfile
}

async function styleUserProfile(ctx: IContext, interaction: ModalSubmitInteraction) {
    const author = await ctx.mongoService.getOne('users', { userId: interaction.user.id, guildId: interaction.guildId }) as User;
    if (!author) { throw new Error('Invalid author') }

    const formField = fetchFormFields(interaction);
    if (!formField) { await interaction.reply({ content: 'Nada alterado em seu perfil. =)', ephemeral: true }); return }

    let newUserInfo: IEditableFields = {
        styles: {
            theme: formField.styles.theme?.toLocaleLowerCase() ?? author.styles.theme,
            collage: formField.styles?.collage ?? String(author.styles.collage),
            fonts: formField.styles?.fonts ?? author.styles.fonts
        }
    };

    if (newUserInfo.styles.theme) {
        const newTheme = await ctx.mongoService.getOne("themes", { name: newUserInfo.styles.theme || '' }) as Theme;
        if (!newTheme) { newUserInfo.styles.theme = author.styles.theme }
    }

    if (MomentoService.isUserVerified(author.stats.isVerified)) {
        if (newUserInfo.styles.fonts.primary) {
            const hasFont = fontsPaths.some(font => font.name === `${newUserInfo.styles.fonts.primary}`);
            newUserInfo.styles.fonts.primary = hasFont ? newUserInfo.styles.fonts.primary.toLocaleLowerCase() : author.styles.fonts.primary.toLocaleLowerCase();
        } else {
            newUserInfo.styles.fonts.primary = author.styles.fonts.primary.toLocaleLowerCase();
        }

        if (newUserInfo.styles.fonts.secondary) {
            const hasFont = fontsPaths.some(font => font.name === `${newUserInfo.styles.fonts.secondary}`);
            newUserInfo.styles.fonts.secondary = hasFont ? newUserInfo.styles.fonts.secondary.toLocaleLowerCase() : author.styles.fonts.secondary.toLocaleLowerCase();
        } else {
            newUserInfo.styles.fonts.secondary = author.styles.fonts.secondary.toLocaleLowerCase();
        }
    }


    const isEdittingProfile = formField.styles.theme || formField.styles.fonts.primary || formField.styles.fonts.secondary ? true : false;
    const isEdittingCollage = formField.styles?.collage || formField.styles.theme || formField.styles.fonts.primary || formField.styles.fonts.secondary ? true : false;

    if (newUserInfo.styles.collage !== String(author.styles.collage)) {
        const collagesCount = await ctx.mongoService.count('collages', {});
        if (isNaN(Number(newUserInfo.styles.collage)) || Number(newUserInfo.styles.collage) > collagesCount || Number(newUserInfo.styles.collage) < 1) { throw new Error(`Esse estilo de colagem não existe. Escolha um número entre 1 e ${collagesCount}.`) }
    }

    await ctx.mongoService.patch('users', { userId: interaction.user.id, guildId: interaction.guildId }, newUserInfo);
    author.styles.theme = newUserInfo.styles.theme ?? author.styles.theme;
    author.styles.collage = Number(newUserInfo.styles?.collage) ?? author.styles.collage;

    const profileServices: ProfileServices = new ProfileServices();
    await interaction.reply({ content: 'Estilizando seu perfil...', ephemeral: true })
    await profileServices.updateProfilePictures(ctx, author, isEdittingProfile, isEdittingCollage);
    if (interaction.isRepliable()) {
        await interaction.editReply('Seu perfil foi atualizado com sucesso!')
    }
    return
}

function fetchFormFields(interaction: ModalSubmitInteraction): IEditableFields | null {
    const themeField = interaction.fields.getField('theme_field', ComponentType.TextInput).value;
    const collageStyleField = interaction.fields.getField('collage_style_field', ComponentType.TextInput).value;
    const primaryFontField = interaction.fields.getField('primary_font_field', ComponentType.TextInput).value;
    const secondaryFontField = interaction.fields.getField('secondary_font_field', ComponentType.TextInput).value;


    const theme = themeField.length > 0 ? themeField : null;
    const collage = collageStyleField.length > 0 ? (collageStyleField).toString() : null;
    const fonts = {
        primary: primaryFontField.length > 0 ? (primaryFontField).toString() : null,
        secondary: secondaryFontField.length > 0 ? (secondaryFontField).toString() : null,
    }

    if (!theme && !collage && !fonts.primary && !fonts.secondary) { return null }
    return {
        styles: {
            theme,
            collage,
            fonts
        }
    }
}