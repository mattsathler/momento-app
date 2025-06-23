import { ActionRow, ActionRowBuilder, ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ICommand } from "../../Interfaces/ICommand";
import { Permission } from "../../Interfaces/IPermission";
import { IContext } from "../../Interfaces/IContext";


export const openAnswerModal: ICommand = {
    permission: Permission.user,
    isProfileCommand: true,
    exec: openAnswerModalExec
}

async function openAnswerModalExec(ctx: IContext, interaction: ButtonInteraction) {
    let question = interaction.message.embeds[0].data.fields?.find(f => f.name === 'Pergunta')?.value;
    let author = interaction.message.embeds[0].data.fields?.find(f => f.name === 'Autor')?.value;

    if (!question) { throw new Error('Invalid question') }
    if (!author) { throw new Error('Invalid author') }

    if (!author) { throw new Error('Invalid author') }
    if (!question) { throw new Error('Invalid question') }

    const modal = createAnswerModal(author, question);
    await interaction.showModal(modal);
}

function createAnswerModal(author: string, question: string): ModalBuilder {
    const answerField = new TextInputBuilder()
        .setRequired(true)
        .setLabel(`${author} perguntou:`)
        .setCustomId('answer_field')
        .setMinLength(1)
        .setMaxLength(500)
        .setPlaceholder(question)
        .setStyle(TextInputStyle.Paragraph)

    const AR = new ActionRowBuilder<TextInputBuilder>().addComponents(answerField)

    return new ModalBuilder()
        .setTitle('Responder pergunta')
        .setCustomId('answerQuestion')
        .addComponents(AR)
}