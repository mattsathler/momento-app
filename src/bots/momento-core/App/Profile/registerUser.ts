import { ComponentType, Guild, GuildMember, Message, ModalSubmitInteraction, TextChannel } from "discord.js";
import { ICommand } from "../../Interfaces/ICommand";
import { Permission } from "../../Interfaces/IPermission";
import { IContext } from "../../Interfaces/IContext";
import { StringValidator } from "../../Utils/StringValidator";
import { ProfileServices } from "../../Utils/ProfileServices";
import { NotificationType } from "../../Interfaces/INotification";
import { User } from "src/shared/models/User";
import { defaultTheme, Theme } from "src/shared/models/Theme";
import { defaultCollage } from "src/shared/models/Collage";
import { DefaultUser } from "src/shared/models/DefaultUser";

export const registerUser: ICommand = {
    permission: Permission.user,
    isProfileCommand: false,
    exec: registerNewUser
}

async function registerNewUser(ctx: IContext, interaction: ModalSubmitInteraction) {
    if (!interaction) { throw new Error('Invalid interaction type') }
    if (!interaction.guild) { throw new Error('Invalid guild') }
    if (!ctx.serverConfig) { throw new Error('Invalid server config') }
    if (!interaction.isButton) { throw new Error('Invalid interaction type') }

    const response = fetchFormFields(interaction)
    if (!response) { throw new Error('Invalid form fields') }

    const isUsernameAvailable = await checkUsernameAvailability(ctx, response.username)
    if (!isUsernameAvailable) { throw new Error('Usuário já cadastrado! Tente escolher outro usuário.') }

    let newUser: User = DefaultUser;
    newUser.userId = interaction.user.id;
    newUser.username = response.username.toLowerCase();
    newUser.name = response.name;
    newUser.surname = response.surname;

    await interaction.reply({ content: 'Criando seu perfil, aguarde...', ephemeral: true });
    await createUser(ctx, newUser, interaction.guild);
    const member = interaction.member as GuildMember;
    if (!member) { throw new Error('Invalid member') }
    await member.setNickname(newUser.username);

    if (interaction.isRepliable()) {
        await interaction.editReply({ content: 'Seu perfil foi criado com sucesso!' });
    }
    return
}

function fetchFormFields(interaction: ModalSubmitInteraction) {
    const username = interaction.fields.getField('username_field', ComponentType.TextInput).value;
    const name = interaction.fields.getField('name_field', ComponentType.TextInput).value;
    const surname = interaction.fields.getField('surname_field', ComponentType.TextInput).value;

    if (!username || !name || !surname) { return null }
    if (
        username.length < 3 || username.length > 20 ||
        name.length < 3 || name.length > 20 ||
        surname.length < 3 || surname.length > 20
    ) { throw new Error('Os campos de nome, sobrenome e usuário precisam ter entre 4 e 20 caracteres!') }
    if (String(username).split(' ').length > 1) { throw new Error('O nome de usuário não pode conter espaços!') }
    if (String(name).split(' ').length > 1) { throw new Error('O nome não pode conter espaços!') }
    if (String(surname).split(' ').length > 1) { throw new Error('O sobrenome não pode conter espaços!') }

    if (StringValidator.hasEmoji(username)) { throw new Error('O nome de usuário não pode conter emojis!') }
    if (StringValidator.hasEmoji(name)) { throw new Error('O nome não pode conter emojis!') }
    if (StringValidator.hasEmoji(surname)) { throw new Error('O sobrenome não pode conter emojis!') }

    return { username, name, surname }
}

async function createUser(ctx: IContext, newUser: User, guild: Guild) {
    const profileService = new ProfileServices();
    const createdUser = { ...newUser };
    const theme = await ctx.mongoService.getOne('themes', { name: createdUser.styles.theme }) as Theme || defaultTheme;
    const collageStyle = await ctx.mongoService.getOne('collages', { id: createdUser.styles.collage }) || defaultCollage;
    const images = await profileService.drawProfilePictures(ctx, createdUser, theme, collageStyle, 0, 0);
    const userChannel = await profileService.createUserChannel(guild, createdUser.username, createdUser.userId);
    const profileMessage: Message = await userChannel.send(images.profileImgURL);
    const collageMessage: Message = await userChannel.send(images.collageImgURL);

    const ProfileButtons = await profileService.createProfileButtons();
    await collageMessage.edit({ components: [ProfileButtons] });

    createdUser.guildId = userChannel.guildId;
    createdUser.references = {
        channelId: userChannel.id,
        statsId: profileMessage.id,
        collageId: collageMessage.id,
        notificationId: ''
    }

    await ctx.mongoService.post('users', createdUser);

    await ctx.notificationService?.sendNotification(createdUser,
        {
            type: NotificationType.Embed,
            message: 'Bem vindo ao seu perfil!',
            targetUser: createdUser
        }, true
    )
    return
}

async function checkUsernameAvailability(ctx: IContext, username: string): Promise<boolean> {
    const response: User = await ctx.mongoService.getOne('users', { username: username });
    return response ? false : true
}