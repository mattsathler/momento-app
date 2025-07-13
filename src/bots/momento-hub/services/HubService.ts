import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelType, Client, EmbedBuilder, Message, SelectMenuBuilder, SelectMenuInteraction, StringSelectMenuBuilder, TextChannel } from "discord.js";
import { QrCodePix, QrCodePixParams } from "qrcode-pix";
import { LinkService } from "src/shared/services/LinkService";
import { MomentoService } from "src/shared/services/MomentoService";

export class HubService {
    public async createVerifyMessage(channel: TextChannel): Promise<void> {
        const verifiedEmbed = new EmbedBuilder()
            .setTitle("✦ SEJA VERIFICADO")
            .setDescription(
                "Seu photoplayer não é só mais um — ele é influente, único, e merece estar no centro dos holofotes.\n\n"
                + "💫 **Benefícios da assinatura:**\n"
                + "🔮 Posts com mais chances de entrar nos **Trends**\n"
                + "🎨 Temas **personalizados** para o seu perfil\n"
                + "📈 Até 3x mais **seguidores** nos seus analytics\n"
                + "✨ Acesso antecipado a recursos exclusivos\n"
                + "🤝 Apoio direto ao desenvolvimento do bot\n\n"
                + "**a partir de R$19,90/mês**\n"
                + "Um valor simbólico para quem quer viver a experiência completa — e ajudar o Momento a continuar evoluindo."
            )
            .setColor(0xDD247B)
            .setThumbnail("https://imgur.com/OfdUb2R.png")
            .setFooter({ text: "Clique abaixo e inicie sua verificação!" });

        const verifyButton = new ButtonBuilder()
            .setCustomId("createVerifyTicket")
            .setLabel("Assinar")
            .setEmoji("🎫")
            .setStyle(ButtonStyle.Success);
        const AR = new ActionRowBuilder<ButtonBuilder>().addComponents(verifyButton);

        await channel.send({
            embeds: [verifiedEmbed],
            components: [AR]
        })
    }

    public async createVerifyTicketChannel(client: Client, interaction: ButtonInteraction) {
        const channel = interaction.channel as TextChannel;
        const newTicketChannel = await interaction.guild?.channels.create({
            name: `verificação-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: channel.parentId,
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone,
                    deny: ['ViewChannel'],
                },
                {
                    id: interaction.user.id,
                    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                }
            ],
        }) as TextChannel;

        await newTicketChannel.send(`<@${interaction.user.id}>`)
            .then((msg: Message) => {
                msg.delete().then(() => {
                }).catch((error) => {
                    console.error("Error deleting ping message:", error);
                });
            })
            .catch((error) => console.error("Error sending ping message:", error));

        const subscriptionTypeEmbed = new EmbedBuilder()
            .setTitle("📬 Bem-vindo ao seu canal de verificação!")
            .setDescription(
                "Você está a um passo de se tornar **Verificado** no Momento.\n\n"
                + "Selecione abaixo por quanto tempo deseja assinar sua verificação:\n"
                + "\n🔒 O processo é seguro e automatizado, além de feito diretamente com o desenvolvedor do bot.\n\n"
                + "Após a escolha, enviaremos o código PIX para pagamento. Qualquer dúvida, basta perguntar aqui!"
            )
            .setColor(0xDD247B)
            .setFooter({ text: "Momento App" })
            .setThumbnail("https://imgur.com/OfdUb2R.png");

        const subscriptionSelect = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('selectSubscriptionType')
                .setPlaceholder("Escolha a duração da assinatura")
                .addOptions([
                    {
                        label: '1 mês – R$19,90',
                        value: '1',
                        emoji: "🎫",
                        description: 'Assinatura padrão mensal.'
                    },
                    {
                        label: '2 meses – R$29,90',
                        value: '2',
                        emoji: "🎫",
                        description: 'R$14,95/mês, desconto de 25%!'
                    },
                    {
                        label: '3 meses – R$39,90',
                        value: '3',
                        emoji: "🎫",
                        description: 'R$13,30/mês, desconto de 33%!'
                    }
                ])
        );

        await newTicketChannel.send({
            embeds: [subscriptionTypeEmbed],
            components: [subscriptionSelect]
        })

        await interaction.deferUpdate();
    }

    public async createPaymentQRCode(client: Client, interaction: SelectMenuInteraction): Promise<void> {
        const pixkey: string | undefined = process.env.HUB_PIX_KEY;
        if (!pixkey) throw new Error("Couldn't get pix key");
        const subscriptionType = Number(interaction.values[0]);
        const pixMessage = `Assinatura de ${interaction.values[0]} meses do momento app`;
        const value = subscriptionType === 1 ? 19.90 : subscriptionType === 2 ? 29.90 : 39.90;
        const valueInBRL = `R$ ${value.toFixed(2).replace('.', ',')}`;

        const QRCodeParams: QrCodePixParams = {
            name: `${interaction.message.id}${interaction.guildId}`,
            key: pixkey,
            version: "01",
            city: "RIO DE JANEIRO",
            message: pixMessage,
            value: value
        }

        const pixqrcode = await QrCodePix(QRCodeParams).base64();
        const base64Data = pixqrcode.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const uploadChannel = await MomentoService.getUploadChannel(client);
        const qrcodelink = await LinkService.uploadImageToMomento(uploadChannel, buffer);
        const channel = interaction.channel as TextChannel;

        await interaction.deferUpdate();

        const pixEmbed = new EmbedBuilder()
            .setTitle('Confirmação de Pagamento via Pix')
            .setDescription(`Você está prestes a realizar o pagamento da sua assinatura de **${subscriptionType} mes(es)** de verificado do momento.\nConfira atentamente os dados abaixo antes de prosseguir.\n\n**📌 Após efetuar o pagamento, envie o comprovante neste canal.**  
Nossa equipe irá validar o quanto antes.`)
            .setColor(0xDD247B)
            .addFields(
                { name: '🔗 Chave Pix', value: pixkey },
                { name: '🏷️ Referência', value: `Matheus William Sathler Lima`, inline: false },
                { name: '🏦 Banco', value: 'NuBank', inline: true },
                { name: '💰 Valor', value: String(valueInBRL), inline: true },
                { name: '🎫 Meses de Verificado', value: `${String(subscriptionType)} mes(es)` }
            )
            .setImage(qrcodelink.attachments.first()!.url)
            .setFooter({ text: 'Envie o comprovante neste canal assim que concluir o pagamento que o desenvolvedor entrará em contato.' });

        try {
            await interaction.message.delete()
        } catch { }

        await channel.send({
            embeds: [pixEmbed],
        })
    }
}