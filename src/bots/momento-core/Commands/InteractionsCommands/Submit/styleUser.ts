import { ComponentType, ModalSubmitInteraction } from "discord.js";
import { ICommand } from "../../../Interfaces/ICommand";
import { Permission } from "../../../Interfaces/IPermission";
import { IContext } from "../../../Interfaces/IContext";
import { ProfileServices } from "../../../Utils/ProfileServices";

interface IEditableFields {
    styles: {
        theme: string | null,
        collage: string | null
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
    const author = await ctx.mongoService.getOne('users', { userId: interaction.user.id, guildId: interaction.guildId });
    if (!author) { throw new Error('Invalid author') }

    const formField = fetchFormFields(interaction);
    if (!formField) { await interaction.reply({ content: 'Nada alterado em seu perfil. =)', ephemeral: true }); return }

    let newUserInfo: IEditableFields = {
        styles: {
            theme: formField.styles.theme ?? author.styles.theme,
            collage: formField.styles?.collage ?? author.styles.collage
        }
    };

    const isEdittingProfile = formField.styles.theme ? true : false;
    const isEdittingCollage = formField.styles?.collage || formField.styles.theme ? true : false;

    if (newUserInfo.styles.collage !== author.styles.collage) {
        const collagesCount = await ctx.mongoService.count('collages', {});
        if (isNaN(Number(newUserInfo.styles.collage)) || Number(newUserInfo.styles.collage) > collagesCount || Number(newUserInfo.styles.collage) < 1) { throw new Error(`Esse estilo de colagem não existe. Escolha um número entre 1 e ${collagesCount}.`) }
    }

    await ctx.mongoService.patch('users', { userId: interaction.user.id, guildId: interaction.guildId }, newUserInfo);
    author.styles.theme = newUserInfo.styles.theme ?? author.styles.theme;
    author.styles.collage = newUserInfo.styles?.collage ?? author.styles.collage;

    const profileServices: ProfileServices = new ProfileServices();
    await interaction.reply({ content: 'Estilizando seu perfil...', ephemeral: true })
    await profileServices.updateProfilePictures(ctx, author, isEdittingProfile, isEdittingCollage);
    if (interaction.isRepliable()) {
        await interaction.editReply('Seu perfil foi atualizado com sucesso!')
    }
    return
}

function fetchFormFields(interaction: ModalSubmitInteraction): IEditableFields | null {
    const themeField = interaction.fields.getField('theme_field', ComponentType.TextInput).value
    const collageStyleField = interaction.fields.getField('collage_style_field', ComponentType.TextInput).value

    const theme = themeField.length > 0 ? themeField : null;
    const collage = collageStyleField.length > 0 ? (collageStyleField).toString() : null;

    if (!theme && !collage) { return null }
    return {
        styles: {
            theme,
            collage
        }
    }
}