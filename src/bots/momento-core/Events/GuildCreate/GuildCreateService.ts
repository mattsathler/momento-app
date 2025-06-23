import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";
// import { ButtonStyle, ChannelType, Guild, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

interface WelcomeMessage {
    embeds: EmbedBuilder[]
    components: ActionRowBuilder<ButtonBuilder>[]
}

export class GuildCreateService {
    constructor() { }

    // public sendWelcomeMessage({ guild }: { guild: Guild; }): void {
    //     const welcomeMsg = this.createWelcomeMessage()

    //     if (guild.systemChannel) {
    //         guild.systemChannel.send({
    //             content: '',
    //             embeds: welcomeMsg.embeds,
    //             components: welcomeMsg.components
    //         })
    //         return
    //     }

    //     guild.channels.cache.forEach(channel => {
    //         if (channel.type === ChannelType.GuildText) {
    //             channel.send({
    //                 content: '',
    //                 embeds: welcomeMsg.embeds,
    //                 components: welcomeMsg.components
    //             })
    //             return
    //         }
    //     })
    // }

    // public createWelcomeMessage(): WelcomeMessage {
    //     const welcomeMessageEmbed =
    //         new EmbedBuilder()
    //             .setDescription(`**Bem vindo a configuração inicial do momento em seu servidor**\n
    //                             Aqui você passará por um processo rápido para configurarmos seu server para receber e aproveitar tudo o que o nosso app tem a oferecer!\n
    //                             Começaremos preenchendo um pequeno formulário, basta clicar em \"**INICIAR**\" logo abaixo!`)
    //             .setColor(0xDD247B)
    //             .setThumbnail('https://imgur.com/LGKKMqg.png')
    //             .setAuthor({
    //                 name: 'Momento',
    //                 iconURL: 'https://imgur.com/diuZwFL.png'
    //             })

    //     const startButton = new ButtonBuilder()
    //         .setCustomId('startPreRegister')
    //         .setLabel('INICIAR')
    //         .setStyle(ButtonStyle.Primary)
    //         .setDisabled(false)
            
    //         const moreInfoButton = new ButtonBuilder()
    //         .setCustomId('moreInfo')
    //         .setLabel('Saiba mais')
    //         .setStyle(ButtonStyle.Secondary)
    //         .setDisabled(false)

    //     const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(startButton, moreInfoButton)
    //     const welcomeMsg: WelcomeMessage = {
    //         embeds: [welcomeMessageEmbed],
    //         components: [actionRow]
    //     }

    //     return welcomeMsg
    // }

    // public createRegisterModal(): ModalBuilder {
    //     const rpgNameInput = new TextInputBuilder()
    //         .setCustomId('rpg-name')
    //         .setStyle(TextInputStyle.Short)
    //         .setMinLength(4)
    //         .setMaxLength(15)
    //         .setLabel('Qual é o nome do RPG?')
    //         .setPlaceholder('nome do RPG')
    //         .setRequired(true)
    //     const rpgDescriptionInput = new TextInputBuilder()
    //         .setCustomId('rpg-description')
    //         .setLabel('Qual é a descrição do seu RPG')
    //         .setPlaceholder('descrição do RPG')
    //         .setRequired(true)
    //         .setStyle(TextInputStyle.Paragraph)
    //     const ownerNameInput = new TextInputBuilder()
    //         .setCustomId('owner-name')
    //         .setLabel('Qual é o seu nome?')
    //         .setPlaceholder('seu nome real')
    //         .setRequired(true)
    //         .setStyle(TextInputStyle.Short)
        
    //     const AR1 = new ActionRowBuilder<TextInputBuilder>().addComponents(rpgNameInput)
    //     const AR2 = new ActionRowBuilder<TextInputBuilder>().addComponents(rpgDescriptionInput)
    //     const AR3 = new ActionRowBuilder<TextInputBuilder>().addComponents(ownerNameInput)
        
    //     const modal = new ModalBuilder()
    //         .setCustomId('registerModal')
    //         .setTitle('MOMENTO - Configuração')
    //         .setComponents(AR1, AR2, AR3)
        
    //     return modal
    // }
}