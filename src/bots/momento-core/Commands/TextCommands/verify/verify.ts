import { Channel, Message, TextChannel, User } from "discord.js"
import { Permission } from "../../../Interfaces/IPermission"
import { ICommand } from "../../../Interfaces/ICommand"
import { IContext } from "../../../Interfaces/IContext"
import { ProfileServices } from "../../../Utils/ProfileServices"
import { INotification, NotificationType } from "../../../Interfaces/INotification"
import { NotificationService } from "../../../../../shared/services/NotificationService"
import { User as MomentoUser } from "../../../../../shared/models/User";

export const verify: ICommand = {
    reply: 'Verificando o usuário...',
    success: 'Usuário verificado com sucesso!',
    permission: Permission.ceo,
    isProfileCommand: false,
    deleteMessage: true,
    deleteReply: true,

    exec: async function (ctx: IContext, message: Message): Promise<void> {
        try {
            if (!message.guild) { throw new Error('Não foi possível encontrar o servidor.'); }

            message.mentions.channels.forEach(async (channel: Channel) => {
                if (!message.guildId) return;

                const momentoUser = await ctx.mongoService.getOne('users', {
                    'references.channelId': channel.id,
                    'guildId': message.guildId
                }) as MomentoUser;
                if (!momentoUser) {
                    await message.reply(`Usuário ${channel.id} não encontrado!`)
                    return;
                };

                const newUser = await ctx.mongoService.patch('users', {
                    'references.channelId': channel.id,
                    'guildId': message.guildId
                }, {
                    'stats.isVerified': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                })

                const profileServices = new ProfileServices();
                await profileServices.updateProfilePictures(ctx, newUser, true, false);

                const createdNotification: INotification = {
                    targetUser: newUser,
                    type: NotificationType.Embed,
                    message: `Percebemos que seu perfil está entre os mais badalados de nossa plataforma! Afinal, seus momentos alcançaram milhares pessoas e com certeza impactaram suas vidas!
                    \nPor isso, estamos te presenteando com o **passe vip** do MOMENTO para que você possa chegar ainda mais longe!
                    \nMas nem tudo são flores! Agora que seu perfil está chegando mais longe, terá que redobrar a sua atenção em relação ao que se compartilha em nossa plataforma.
                    \nSempre lembre-se de seguir nossas **diretrizes de comunidade** para não haver problemas! 
                    \n\n**Bem vindo(a)! Veja abaixo o que mudará a partir de agora...**`,
                    pictureUrl: "https://i.imgur.com/TvJJmjx.png",
                    thumbnail: 'https://imgur.com/cWBlUCh.png',
                    fields: [
                        {
                            name: '# Mais alcance!',
                            value: 'Agora seus momentos chegarão ainda mais longe! Muito mais pessoas verão seus posts e comentários!'
                        },
                        {
                            name: '# Trendings!',
                            value: 'Não será difícil ver um momento seu tendo seu espacinho dentre as trendings do momento!'
                        },
                        {
                            name: '# Insígnia de Verificado!',
                            value: 'Esbanje sua nova insígnia no seu perfil de verificado do momento!'
                        },
                    ],
                    image: 'https://imgur.com/cWBlUCh.png',
                };

                const notificationService = new NotificationService(ctx);
                await notificationService.sendNotification(newUser, createdNotification, true);
                return newUser;
            })
        }
        catch (error: any) {
            throw new Error('Erro ao alterar verificar perfil - ' + error.message);
        }
    }
}
