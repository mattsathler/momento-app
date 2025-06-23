import { Message, TextChannel } from "discord.js"
import { Permission } from "../../../Interfaces/IPermission"
import { ICommand } from "../../../Interfaces/ICommand"
import { IContext } from "../../../Interfaces/IContext"
import { CollageService } from "./collage-service"
import { User } from "src/shared/models/User"

export const collage: ICommand = {
    reply: 'Alterando sua foto de collage',
    success: 'Foto de collage alterada com sucesso!',
    permission: Permission.user,
    isProfileCommand: true,
    deleteMessage: true,
    deleteReply: true,

    exec: async function (ctx: IContext, message: Message): Promise<void> {
        try {
            if (!message.guild) { throw new Error('Não foi possível encontrar o servidor.'); }
            const collageId = Number(message.content.split(' ')[1]);
            if (!collageId) { throw new Error('Você precisa informar o número da colagem que deseja usar! Use: ?collage 1-25 para escolher.'); }
            if (isNaN(Number(collageId)) || Number(collageId) < 1 || Number(collageId) > 25) { throw new Error('ID da collage inválido! Escolha um número entre 1 e 25.'); }

            if (message.attachments.size < 1 || !message.attachments) { throw new Error('Você precisa anexar uma imagem na mensagem para alterar sua foto de collage!'); }
            const pictureSize = message.attachments.first()?.size;
            if (pictureSize !== undefined && pictureSize >= 6000000) { throw new Error('A imagem não pode ser maior que 6MB!'); }

            const attachmentUrl: string | undefined = message.attachments.first()?.url;
            if (!attachmentUrl) { throw new Error('Você precisa anexar uma imagem na mensagem para alterar sua foto de collage!'); }

            const author = await ctx.mongoService.getOne('users', {
                userId: message.author.id,
                guildId: message.guildId
            }) as User || null;


            const service = new CollageService();
            const newProfilePictureURL = await service.treatCollagePicture(ctx, message.guild, attachmentUrl);
            if (!newProfilePictureURL) { throw new Error('Não foi possível tratar essa imagem, tente com outra.'); }

            await service.changeCollagePicture(ctx, newProfilePictureURL, collageId - 1, author, message);
            return;
        }
        catch (error: any) {
            throw new Error('Erro ao alterar foto de collage - ' + error.message);
        }
    }
}
