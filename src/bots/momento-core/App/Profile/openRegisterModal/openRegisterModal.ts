import { ActionRowBuilder, ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { IContext } from "../../../Interfaces/IContext";
import { ICommand } from "../../../Interfaces/ICommand";
import { Permission } from "../../../Interfaces/IPermission";
import { User } from "src/shared/models/User";

export const openRegisterModal: ICommand = {
    permission: Permission.user,
    isProfileCommand: false,
    exec: async (ctx: IContext, interaction: ButtonInteraction) => {
        try {
            const userAlreadyRegistered = await ctx.mongoService.getOne('users', { userId: interaction.user.id, guildId: interaction.guildId } as User)
            if (userAlreadyRegistered) {
                throw new Error(`Você já está registrado! - <#${userAlreadyRegistered.references.channelId}>. Caso seu perfil tenha sido excluído, clique em "PERDI ACESSO AO MEU PERFIL"`)
            }
        }
        catch (err: any) {
            await interaction.reply({ content: err.message, ephemeral: true });
            return
        }
        const modal = createRegisterModal();
        await interaction.showModal(modal);
    }
}

function createRegisterModal(): ModalBuilder {
    const usernameField = new TextInputBuilder()
        .setCustomId('username_field')
        .setPlaceholder('Digite seu nome de usuário')
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setLabel('Nome de usuário')
        .setMinLength(3)
        .setMaxLength(20)

    const nameField = new TextInputBuilder()
        .setCustomId('name_field')
        .setPlaceholder('Digite o nome do seu personagem')
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setLabel('Nome')
        .setMinLength(3)
        .setMaxLength(14)

    const surnameField = new TextInputBuilder()
        .setCustomId('surname_field')
        .setPlaceholder('Digite o sobrenome do seu personagem')
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setLabel('Sobrenome')
        .setMinLength(3)
        .setMaxLength(14)

    const AR1 = new ActionRowBuilder<TextInputBuilder>().addComponents(nameField)
    const AR2 = new ActionRowBuilder<TextInputBuilder>().addComponents(surnameField)
    const AR3 = new ActionRowBuilder<TextInputBuilder>().addComponents(usernameField)

    const modal = new ModalBuilder()
        .setTitle('Cadastro')
        .setCustomId('registerUser')
        .addComponents(AR1, AR2, AR3)

    return modal
}