import { ComponentType, GuildMember, MessageFlags, ModalSubmitInteraction, TextChannel } from "discord.js";
import { ICommand } from "../../../Interfaces/ICommand";
import { Permission } from "../../../Interfaces/IPermission";
import { IContext } from "../../../Interfaces/IContext";
import { ProfileServices } from "../../../Utils/ProfileServices";
import { User } from "src/shared/models/User";
import { StringValidator } from "src/bots/momento-core/Utils/StringValidator";
import { MomentoService } from "src/shared/services/MomentoService";

interface IEditableFields {
    username: string | null,
    name: string | null,
    surname: string | null,
    bio: string | null,
}

export const editUser: ICommand = {
    permission: Permission.user,
    isProfileCommand: true,
    reply: 'Editando seu perfil',
    success: 'Perfil editado com sucesso!',
    exec: editUserProfile
}

async function editUserProfile(ctx: IContext, interaction: ModalSubmitInteraction) {
    try {

        const author = await ctx.mongoService.getOne('users', { userId: interaction.user.id, guildId: interaction.guildId }) as User;
        if (!author) { throw new Error('Invalid author') }

        const formField = fetchFormFields(interaction);
        if (!formField) { await interaction.reply({ content: 'Nada alterado em seu perfil. =)', ephemeral: true }); return }

        let newUserInfo: IEditableFields = {
            username: formField.username?.toLowerCase() ?? author.username,
            name: formField.name ?? author.name,
            surname: formField.surname ?? author.surname,
            bio: formField.bio ?? author.bio,
        };

        if (newUserInfo.username !== author.username) {
            const user = await ctx.mongoService.getOne('users', { username: newUserInfo.username, guildId: interaction.guildId })
            if (user) { await interaction.reply({ content: 'Esse nome de usuário já está em uso. =(', ephemeral: true }); return }
        }

        if (newUserInfo.username) {
            if (!ctx.serverConfig) { throw new Error('Invalid profile channel') }
            if (!author.references.channelId) { throw new Error('Invalid profile channel') }
            const profileChannel = await interaction.guild?.channels?.fetch(author.references.channelId) as TextChannel;
            if (!profileChannel) { throw new Error('Invalid profile channel') }
            try {
                if (StringValidator.hasEmoji(newUserInfo.username)) {
                    if (!MomentoService.isUserVerified(author.stats.isVerified)) {
                        newUserInfo.username = author.username;
                        await interaction.reply(
                            {
                                content: "Apenas verificados podem colocar emojis no nome de usuário!",
                                flags: MessageFlags.Ephemeral
                            });
                    }
                }
                await profileChannel.setName(newUserInfo.username!);
                const member = interaction.member as GuildMember;
                if (!member) { throw new Error('Invalid member') }
                await member.setNickname(newUserInfo.username);
            }
            catch (err) {
                console.log(err)
            }
        }

        await ctx.mongoService.patch('users', { userId: interaction.user.id, guildId: interaction.guildId }, newUserInfo);
        const profileServices: ProfileServices = new ProfileServices();
        author.username = newUserInfo.username ?? author.username;
        author.name = newUserInfo.name ?? author.name;
        author.surname = newUserInfo.surname ?? author.surname;
        author.bio = newUserInfo.bio ?? author.bio;

        await interaction.reply({ content: 'Editando perfil, aguarde...', ephemeral: true })
        await profileServices.updateProfilePictures(ctx, author, true, false);
        if (interaction.isRepliable()) {
            await interaction.editReply('Seu perfil foi atualizado com sucesso!')
        }
        return
    }
    catch (err: any) {
        console.log(err)
        return;
    }
}

function fetchFormFields(interaction: ModalSubmitInteraction): IEditableFields | null {
    const usernameField = interaction.fields.getField('username_field', ComponentType.TextInput).value
    const nameField = interaction.fields.getField('name_field', ComponentType.TextInput).value
    const surnameField = interaction.fields.getField('surname_field', ComponentType.TextInput).value
    const bioField = interaction.fields.getField('bio_field', ComponentType.TextInput).value

    const username = usernameField.length > 0 ? usernameField : null;
    const name = nameField.length > 0 ? nameField : null;
    const surname = surnameField.length > 0 ? surnameField : null;
    const bio = bioField.length > 0 ? bioField : null;

    if (!username && !name && !surname && !bio) { return null }
    return { username, name, surname, bio }
}