import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, EmbedBuilder, InviteCreateOptions, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import { ICommand } from "../../Interfaces/ICommand";
import { Permission } from "../../Interfaces/IPermission";
import { IContext } from "../../Interfaces/IContext";
import { NotificationType } from "../../Interfaces/INotification";


export const askUser: ICommand = {
    permission: Permission.user,
    isProfileCommand: false,
    exec: askUserExec
}

async function askUserExec(ctx: IContext, interaction: ModalSubmitInteraction) {
    const fields = fetchModalFields(interaction);

    const AR = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('openAnswerModal')
            .setLabel('Responder')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('deleteMessage')
            .setLabel('🗑️') 
            .setStyle(ButtonStyle.Secondary)
    );
    const targetUser = await ctx.mongoService.getOne('users', { 'references.channelId': interaction.channelId, guildId: interaction.guildId })
    if (!targetUser) { throw new Error('Invalid target user') }

    await interaction.message?.thread?.send(
        {
            embeds: [{
                description: 'Você recebeu uma pergunta! Clique abaixo para responder ou ignorar a pergunta.',
                fields: [
                    {
                        name: 'Autor',
                        value: `${fields.username}`
                    },
                    {
                        name: 'Pergunta',
                        value: `${fields.question}`
                    }
                ],
                color: 0xdd247b
            }],
            components: [AR]
        }
    )

    if (!interaction.isRepliable()) return;
    await interaction.reply({ content: 'Pergunta enviada!', ephemeral: true })
}

function fetchModalFields(interaction: ModalSubmitInteraction): { username: string, question: string } {
    const usernameField = interaction.fields.getField('username_field', ComponentType.TextInput).value
    const questionField = interaction.fields.getField('question_field', ComponentType.TextInput).value

    const username = usernameField.length > 0 ? usernameField : "Anônimo";
    const question = questionField.length > 0 ? questionField : null;

    if (!username || !question) { throw new Error('Invalid fields') }
    return { username, question }
}

function generateAskEmbed(fields: { username: string, question: string }): EmbedBuilder {
    const questionEmbed = new EmbedBuilder()
        .setAuthor({
            name: 'MOMENTO ASK',
            iconURL: 'https://i.imgur.com/MTRsL7h.png'
        })
        .setThumbnail('https://i.imgur.com/MTRsL7h.png')
        .setColor('#DD247B')
        .setDescription('Você recebeu uma pergunta! Clique abaixo para responder ou ignorar a pergunta.')
        .addFields(
            {
                name: 'Autor',
                value: `${fields.username}`
            },
            {
                name: 'Pergunta',
                value: `${fields.question}`
            }
        )
        .setFooter({
            text: 'Clique no botão abaixo para responder a pergunta.',
        })
    return questionEmbed
}