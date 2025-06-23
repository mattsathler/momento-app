import { ActionRowBuilder, ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ICommand } from "../../Interfaces/ICommand";
import { Permission } from "../../Interfaces/IPermission";
import { IContext } from "../../Interfaces/IContext";


export const openAskUser: ICommand = {
    permission: Permission.user,
    isProfileCommand: false,
    exec: async (ctx: IContext, interaction: ButtonInteraction) => {
        const modal = createAskModal()
        await interaction.showModal(modal)
    }
}

function createAskModal(): ModalBuilder {
    const usernameField = new TextInputBuilder()
        .setCustomId('username_field')
        .setPlaceholder('Usuário para a pergunta (Deixe em branco para anônimo)')
        .setRequired(false)
        .setStyle(TextInputStyle.Short)
        .setLabel('Autor da pergunta')

    const questionField = new TextInputBuilder()
        .setCustomId('question_field')
        .setPlaceholder('Escreva sua pergunta ou mensagem.')
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph)
        .setLabel('Ask me anything!')
        .setMaxLength(100)

    const AR1 = new ActionRowBuilder<TextInputBuilder>().addComponents(usernameField)
    const AR2 = new ActionRowBuilder<TextInputBuilder>().addComponents(questionField)

    const modal = new ModalBuilder()
        .setTitle('Asking')
        .setCustomId('askUser')
        .addComponents(AR1, AR2)

    return modal
}