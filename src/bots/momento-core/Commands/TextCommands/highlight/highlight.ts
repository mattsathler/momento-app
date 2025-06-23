import { Message, TextChannel } from "discord.js"
import { Permission } from "../../../Interfaces/IPermission"
import { ICommand } from "../../../Interfaces/ICommand"
import { IContext } from "../../../Interfaces/IContext"
import { HighlightService } from "./highlight-service"
import { User } from "src/shared/models/User"

export const highlight: ICommand = {
    reply: 'Alterando sua foto de highlight',
    success: 'Foto de highlight alterada com sucesso!',
    permission: Permission.user,
    isProfileCommand: true,
    deleteMessage: true,
    deleteReply: true,

    exec: async function (ctx: IContext, message: Message): Promise<void> {
        try {
            if (!message.guild) { throw new Error('Não foi possível encontrar o servidor.'); }
            const highlightId = Number(message.content.split(' ')[1]);
            if (!highlightId) { throw new Error('Você precisa informar o número da highlight que deseja trocar! Use: ?highlight 1-5 para escolher.'); }
            if (isNaN(Number(highlightId)) || Number(highlightId) < 1 || Number(highlightId) > 5) { throw new Error('ID da highlight inválido! Escolha um número entre 1 e 5.'); }

            if (message.attachments.size < 1 || !message.attachments) { throw new Error('Você precisa anexar uma imagem na mensagem para alterar sua foto de highlight!'); }
            const pictureSize = message.attachments.first()?.size;
            if (pictureSize !== undefined && pictureSize >= 6000000) { throw new Error('A imagem não pode ser maior que 6MB!'); }

            const attachmentUrl: string | undefined = message.attachments.first()?.url;
            if (!attachmentUrl) { throw new Error('Você precisa anexar uma imagem na mensagem para alterar sua foto de highlight!'); }

            const author = await ctx.mongoService.getOne('users', {
                userId: message.author.id,
                guildId: message.guildId
            }) as User || null;


            const service = new HighlightService();
            const newProfilePictureURL = await service.treatHighlightPicture(ctx, message.guild, attachmentUrl);
            if (!newProfilePictureURL) { throw new Error('Não foi possível tratar essa imagem, tente com outra.'); }

            await service.changeHighlightPicture(ctx, newProfilePictureURL, highlightId - 1, author, message);
            return;
        }
        catch (error: any) {
            throw new Error('Erro ao alterar foto de highlight - ' + error.message);
        }
    }
}
