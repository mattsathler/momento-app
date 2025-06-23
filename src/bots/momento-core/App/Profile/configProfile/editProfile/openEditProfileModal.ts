import { ButtonInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputStyle, UserSelectMenuBuilder } from "discord.js";
import { IContext } from "../../../../Interfaces/IContext";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from "@discordjs/builders";
import { ICommand } from "../../../../Interfaces/ICommand";
import { Permission } from "../../../../Interfaces/IPermission";
import { User } from "src/shared/models/User";

export const openEditProfileModal: ICommand = {
    permission: Permission.user,
    isProfileCommand: true,
    exec: async (ctx: IContext, interaction: ButtonInteraction) => {
        try {
            if (!interaction.guildId) { throw new Error('Invalid interaction type') }
            const author = await fetchAuthor(ctx, interaction.user.id, interaction.guildId)
            if (!author) { throw new Error('Invalid author') }
            const modal = createEditProfileModal(author)
            await interaction.showModal(modal)
        }
        catch (err: any) {
            console.log(err)
            await interaction.reply({
                content: 'A interação falhou! - ' + err.message,
                ephemeral: true
            })
        }
    }
}

function createEditProfileModal(author: User): ModalBuilder {
    const usernameField = new TextInputBuilder()
        .setCustomId('username_field')
        .setPlaceholder(author.username)
        .setRequired(false)
        .setStyle(TextInputStyle.Short)
        .setLabel('Nome de usuário')
        .setMinLength(3)
        .setMaxLength(20)

    const nameField = new TextInputBuilder()
        .setCustomId('name_field')
        .setPlaceholder(author.name)
        .setRequired(false)
        .setStyle(TextInputStyle.Short)
        .setLabel('Nome')
        .setMinLength(3)
        .setMaxLength(14)

    const surnameField = new TextInputBuilder()
        .setCustomId('surname_field')
        .setPlaceholder(author.surname)
        .setRequired(false)
        .setStyle(TextInputStyle.Short)
        .setLabel('Sobrenome')
        .setMinLength(3)
        .setMaxLength(14)

    const bioField = new TextInputBuilder()
        .setCustomId('bio_field')
        .setPlaceholder(author.bio)
        .setRequired(false)
        .setStyle(TextInputStyle.Short)
        .setLabel('Biografia')
        .setMinLength(3)
        .setMaxLength(50)

    const AR1 = new ActionRowBuilder<TextInputBuilder>().addComponents(nameField)
    const AR2 = new ActionRowBuilder<TextInputBuilder>().addComponents(surnameField)
    const AR3 = new ActionRowBuilder<TextInputBuilder>().addComponents(usernameField)
    const AR4 = new ActionRowBuilder<TextInputBuilder>().addComponents(bioField)

    const modal = new ModalBuilder()
        .setTitle('Editar Perfil')
        .setCustomId('editUser')
        .addComponents(AR1, AR2, AR3, AR4)

    return modal
}

async function fetchAuthor(ctx: IContext, userId: string, guildId: string): Promise<User> {
    return ctx.mongoService.getOne('users', { userId: userId, guildId: guildId })
}