import { Permission } from "../../../Interfaces/IPermission"
import { ICommand } from "../../../Interfaces/ICommand"
import { IContext } from "../../../Interfaces/IContext"
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed, EmbedBuilder, Message, TextChannel } from "discord.js"

export const createRegister: ICommand = {
    reply: 'MOMENTO!',
    success: 'ESSE É O SEU MOMENTO!',
    permission: Permission.user,
    isProfileCommand: false,
    deleteMessage: true,
    deleteReply: true,

    exec: async function (ctx: IContext, message: Message): Promise<void> {
        createRegisterMessage(ctx, message);
    }
}

async function createRegisterMessage(ctx: IContext, message: Message) {
    if (message.author.id !== process.env.OWNER_ID) { return; }
    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('openRegisterModal')
            .setLabel('REGISTRAR-SE')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('✨'),
        new ButtonBuilder()
            .setCustomId('redeemUser')
            .setLabel('PERDI ACESSO AO MEU PERFIL')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🔧'),
        new ButtonBuilder()
            .setURL('https://discord.gg/7DbwUcufMx')
            .setLabel('HUB DO MOMENTO')
            .setStyle(ButtonStyle.Link)
            .setEmoji('🌐')
    );

    const embed = new EmbedBuilder()

    embed.setDescription("Clique em \"Registrar-se\" para criar sua conta nesse RPG ou em \"Perdi acesso ao meu perfil\" caso não veja mais seu perfil entre os usuários!\n\nAcesse a HUB do momento para ver o catálogo de temas, collages e se tornar verificado na plataforma, além de ficar por dentro de novidades e avisos sobre o bot!\n\n🔗  https://discord.gg/7DbwUcufMx\n\n",)
    embed.setColor('#DD247B')
    embed.setTitle('BEM VINDO AO MOMENTO!')
    embed.setFooter({
        text: "Criado por: doug",
        iconURL: "https://imgur.com/ZWx9A3N.png"
    })
    embed.setThumbnail("https://imgur.com/ZWx9A3N.png")

    const channel = message.channel as TextChannel;
    await channel.send({
        embeds: [embed],
        components: [actionRow]
    })
}