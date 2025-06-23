import { Message, TextChannel } from "discord.js"
import { Permission } from "../../../Interfaces/IPermission"
import { ICommand } from "../../../Interfaces/ICommand"
import { IContext } from "../../../Interfaces/IContext"
import { CapaService } from "./capa-service"
import { User } from "src/shared/models/User"

export const capa: ICommand = {
    reply: 'Alterando sua foto de capa',
    success: 'Foto de capa alterada com sucesso!',
    permission: Permission.user,
    isProfileCommand: true,
    deleteMessage: true,
    deleteReply: true,

    exec: async function (ctx: IContext, message: Message): Promise<void> {
        try {
            if (!message.guild) { throw new Error('Não foi possível encontrar o servidor.'); }
            const author = await ctx.mongoService.getOne('users', {
                userId: message.author.id,
                guildId: message.guild?.id,
                'references.channelId': message.channel.id
            }) as User | null;
            if (!author) { throw new Error('Você não pode alterar sua foto de capa sem estar registrado!'); }
            const pictureSize = message.attachments.first()?.size;
            if (pictureSize !== undefined && pictureSize >= 6000000) { throw new Error('A imagem não pode ser maior que 6MB!'); }

            const attachmentUrl: string = message.attachments.first()?.url || '';
            const service = new CapaService();

            if(attachmentUrl === '') {
                await service.changeCoverPicture(ctx, '', author, message);
                return;
            }

            const newCoverPictureURL = await service.treatCoverPicture(ctx, attachmentUrl);
            await service.changeCoverPicture(ctx, newCoverPictureURL.url, author, message);
            return;
        }
        catch (error: any) {
            throw new Error('Erro ao alterar foto de capa - ' + error.message);
        }
    }
}