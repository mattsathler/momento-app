import { Message, TextChannel, User } from "discord.js"
import { Permission } from "../../../Interfaces/IPermission"
import { ICommand } from "../../../Interfaces/ICommand"
import { IContext } from "../../../Interfaces/IContext"
import { ProfileServices } from "../../../Utils/ProfileServices"
import { INotification, NotificationType } from "../../../Interfaces/INotification"
import { NotificationService } from "../../../../../shared/services/NotificationService"
import { User as MomentoUser } from "src/shared/models/User"

export const addFollowers: ICommand = {
    reply: 'Adicionando seguidores',
    success: 'Seguidores adicionados com sucesso!',
    permission: Permission.developer,
    isProfileCommand: false,
    deleteMessage: true,
    deleteReply: true,
    exec: async function (ctx: IContext, message: Message): Promise<void> {
        const newFollowers = Number(message.content.split(' ')[1]);
        if (!newFollowers) await message.reply({ content: 'Defina a quantidade de seguidores!' });

        try {
            message.mentions.users.forEach(async (user: User) => {
                if (!message.guildId) return;

                const momentoUser = await ctx.mongoService.getOne('users', {
                    'userId': user.id,
                    'guildId': message.guildId
                }) as MomentoUser;
                if (!momentoUser) await message.reply({ content: `Usuário ${user.username} não encontrado!` });

                const followers = Number(momentoUser.stats.followers) + newFollowers;
                const newUser = await ctx.mongoService.patch('users', {
                    'userId': user.id,
                    'guildId': message.guildId
                }, {
                    'stats.followers': followers
                })

                const profileServices = new ProfileServices();
                await profileServices.updateProfilePictures(ctx, newUser, true, false);

                const createdNotification: INotification = {
                    targetUser: newUser,
                    type: NotificationType.Embed,
                    message: `Parabéns! Você recebeu ${newFollowers} novos seguidores!`,
                    pictureUrl: "https://i.imgur.com/as03K0u.png"
                };

                const notificationService = new NotificationService(ctx);
                await notificationService.sendNotification(newUser, createdNotification, true);
                return newUser;
            })
        }
        catch (err: any) {
            throw new Error(err)
        }
    }
}