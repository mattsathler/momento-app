import { ComponentType, ModalSubmitInteraction } from "discord.js";
import { ICommand } from "../../Interfaces/ICommand";
import { Permission } from "../../Interfaces/IPermission";
import { IContext } from "../../Interfaces/IContext";
import { drawAnswerCanvas } from "../../../../shared/services/canvas/Answer";
import { IPost, IPostStatus } from "../../Interfaces/IPost";
import { PostService } from "../Post/PostService";
import { defaultTheme, Theme } from "src/shared/models/Theme";
import { LinkService } from "src/shared/services/LinkService";
import { MomentoService } from "src/shared/services/MomentoService";
import { User } from "src/shared/models/User";


export const answerQuestion: ICommand = {
    permission: Permission.user,
    isProfileCommand: false,
    exec: answerQuestionExec
}

async function answerQuestionExec(ctx: IContext, interaction: ModalSubmitInteraction) {
    if (!interaction.guild) { throw new Error('Invalid guild') }

    const fields = fetchModalFields(interaction);
    await interaction.deferUpdate();

    const user = await ctx.mongoService.getOne('users', { userId: interaction.user.id, guildId: interaction.guildId }) as User;
    if (!user) { throw new Error('Invalid user') }
    const theme = await ctx.mongoService.getOne('themes', { name: user.styles.theme }) || defaultTheme;
    const answerCanvas = await drawAnswerCanvas(ctx, fields.question, fields.answer, fields.author, user, theme, user.styles.fonts);
    const uploadChannel = await MomentoService.getUploadChannel(ctx.client);
    const imageUrl = await LinkService.uploadImageToMomento(uploadChannel, await answerCanvas.toBuffer('jpeg'));
    if (!imageUrl) { throw new Error('Invalid image url') }
    if (!user.references.channelId) { throw new Error('Invalid user channel id') }
    if (!user.guildId) { throw new Error('Invalid user guild id') }

    const postService = new PostService(ctx);
    const userTheme = await ctx.mongoService.getOne('themes', { name: user.styles.theme }) as Theme ?? defaultTheme;
    if (!interaction.message) return;

    const post: IPost = {
        content: {
            images: [imageUrl.url],
            description: '',
            imagesCount: 1
        },
        references: {
            ownerId: user.userId,
            channelId: user.references.channelId,
            guildId: user.guildId,
            messageId: null,
        },
        stats: {
            type: "answer",
            likes: [],
            date: new Date(),
            status: IPostStatus.active,
            isTrending: false,
            isRepost: false,
        }
    }

    await postService.createImagePost(interaction.message, post, user, userTheme, false);
}

function fetchModalFields(interaction: ModalSubmitInteraction): { question: string, answer: string, author: string } {
    const answerField = interaction.fields.getField('answer_field', ComponentType.TextInput).value
    const answer = answerField.length > 0 ? answerField : null;
    if (!answer) { throw new Error('Invalid fields') }

    const question = interaction.message?.embeds[0].data.fields?.find(f => f.name === 'Pergunta')?.value;
    if (!question) { throw new Error('Invalid question') }

    const author = interaction.message?.embeds[0].data.fields?.find(f => f.name === 'Autor')?.value;
    if (!author) { throw new Error('Invalid author') }

    return { question, answer, author }
}