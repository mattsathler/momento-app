import { Message, TextChannel } from "discord.js"
import { Permission } from "../../../Interfaces/IPermission"
import { ICommand } from "../../../Interfaces/ICommand"
import { IContext } from "../../../Interfaces/IContext"
import { PerfilService } from "./perfil-service"
import { User } from "src/shared/models/User"

export const perfil: ICommand = {
    reply: 'Alterando sua foto de perfil',
    success: 'Foto de perfil alterada com sucesso!',
    permission: Permission.user,
    isProfileCommand: true,
    deleteMessage: true,
    deleteReply: true,

    exec: async function (ctx: IContext, message: Message): Promise<void> {
        try {
            if (message.attachments.size < 1 || !message.attachments) { throw new Error('Você precisa anexar uma imagem na mensagem para alterar sua foto de perfil!'); }
            const pictureSize = message.attachments.first()?.size;
            if (pictureSize !== undefined && pictureSize >= 6000000) { throw new Error('A imagem não pode ser maior que 6MB!'); }
            
            const attachmentUrl: string | undefined = message.attachments.first()?.url;
            if (!attachmentUrl) { throw new Error('Você precisa anexar uma imagem na mensagem para alterar sua foto de perfil!'); }

            const author = await ctx.mongoService.getOne('users', {
                userId: message.author.id,
                guildId: message.guildId
            }) as User || null;

            const service = new PerfilService();

            if (!message.guild) { throw new Error('Não foi possível encontrar o servidor.'); }
            const newProfilePictureURL = await service.treatProfilePicture(ctx, attachmentUrl);
            if (!newProfilePictureURL) { throw new Error('Não foi possível tratar essa imagem, tente com outra.'); }

            await service.changeProfilePicture(ctx, newProfilePictureURL, author, message);
            return;
        }
        catch (error: any) {
            throw new Error('Erro ao alterar foto de perfil - ' + error.message);
        }
    }
}
