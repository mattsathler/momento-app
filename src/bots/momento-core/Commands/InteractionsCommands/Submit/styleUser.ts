import { ComponentType, MessageFlags, ModalSubmitInteraction } from "discord.js";
import { ICommand } from "../../../Interfaces/ICommand";
import { Permission } from "../../../Interfaces/IPermission";
import { IContext } from "../../../Interfaces/IContext";
import { ProfileServices } from "../../../Utils/ProfileServices";
import { Theme } from "src/shared/models/Theme";
import { assetPaths, fontsPaths } from "assets-paths";
import { User } from "src/shared/models/user";
import { MomentoService } from "src/shared/services/MomentoService";
import { Collage } from "src/shared/models/Collage";

interface IEditableFields {
    theme: string | null,
    collage: number | null,
    fonts: {
        primary: string | null,
        secondary: string | null
    } | null
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

    const isVerified = MomentoService.isUserVerified(author.stats.isVerified);

    let formField = fetchFormFields(interaction);
    formField = MomentoService.removeNullOrUndefined(formField);
    if (!formField) { await interaction.reply({ content: 'Nada alterado em seu perfil. =)', flags: MessageFlags.Ephemeral }); return }

    let newUserStyle = author.styles;

    let isEdittingProfile = false;
    let isEdittingCollage = false;

    if (formField.theme) {
        const theme = await ctx.mongoService.getOne("themes", { name: formField.theme }) as Theme;
        if (theme && theme.name !== author.styles.theme) {
            if (theme.is_system_theme) {
                newUserStyle.theme = theme.name;
            }
            else {
                newUserStyle.theme = isVerified ? newUserStyle.theme = theme.name : author.styles.theme;
                ctx.mongoService.patch("themes", { name: formField.theme }, { last_use: new Date() });
            }

            isEdittingProfile = true;
            isEdittingCollage = true;
        }
    }

    if (formField.collage && formField.collage !== author.styles.collage) {
        const collage = await ctx.mongoService.getOne("collages", { id: formField.collage }) as Collage;
        if (collage) {
            newUserStyle.collage = formField.collage;
            isEdittingCollage = true;
        }
    }

    if (formField.fonts) {
        const primaryFont = fontsPaths.find(font => font.name === formField.fonts?.primary)?.name;
        const secondaryFont = fontsPaths.find(font => font.name === formField.fonts?.secondary)?.name;
        newUserStyle.fonts = {
            primary: primaryFont ?? newUserStyle.fonts.primary,
            secondary: secondaryFont ?? newUserStyle.fonts.secondary
        }
        isEdittingProfile = newUserStyle.fonts !== author.styles.fonts ? true : isEdittingProfile;
        isEdittingCollage = newUserStyle.fonts !== author.styles.fonts ? true : isEdittingCollage;
    }

    if (!isEdittingProfile && !isEdittingCollage) { await interaction.reply({ content: 'Nada alterado em seu perfil. =)', flags: MessageFlags.Ephemeral }); return }

    await ctx.mongoService.patch('users', { userId: interaction.user.id, guildId: interaction.guildId }, { styles: newUserStyle });

    const profileServices: ProfileServices = new ProfileServices();
    await interaction.reply({ content: 'Estilizando seu perfil...', flags: MessageFlags.Ephemeral })
    await profileServices.updateProfilePictures(ctx, author, isEdittingProfile, isEdittingCollage);
    if (interaction.isRepliable()) {
        await interaction.editReply('Seu perfil foi atualizado com sucesso!')
    }
    return
}

function safeGetValue(interaction: ModalSubmitInteraction, id: string): string | null {
    try {
        const input = interaction.fields.getTextInputValue(id);
        if (input && input.length > 0) {
            return input
        }
        return null;
    } catch {
        return null;
    }
}

function fetchFormFields(interaction: ModalSubmitInteraction): IEditableFields | null {
    const theme = safeGetValue(interaction, 'theme_field');
    const collage = Number(safeGetValue(interaction, 'collage_style_field'));
    const fonts = {
        primary: safeGetValue(interaction, 'primary_font_field'),
        secondary: safeGetValue(interaction, 'secondary_font_field')
    }

    if (!theme && !collage && !fonts.primary && !fonts.secondary) { return null }
    return {
        theme,
        collage,
        fonts
    }
}