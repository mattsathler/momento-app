import { fontsPaths } from "assets-paths";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelType, Client, ContainerBuilder, EmbedBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, Message, MessageActionRowComponentBuilder, MessageFlags, PermissionOverwrites, SelectMenuBuilder, SelectMenuInteraction, SeparatorBuilder, SeparatorSpacingSize, StringSelectMenuBuilder, TextChannel, TextDisplayBuilder } from "discord.js";
import { QrCodePix, QrCodePixParams } from "qrcode-pix";
import { DefaultUser } from "src/shared/models/DefaultUser";
import { defaultTheme } from "src/shared/models/Theme";
import { User } from "src/shared/models/user";
import { drawProfileCanvas } from "src/shared/services/canvas/ProfileCanvas";
import { LinkService } from "src/shared/services/LinkService";
import { MomentoService } from "src/shared/services/MomentoService";
import { MongoService } from "src/shared/services/MongoService";

export class HubService {
    public async createVerifyMessage(channel: TextChannel): Promise<void> {
        const components =
            new ContainerBuilder()
                .setAccentColor(14492795)
                .addMediaGalleryComponents(
                    new MediaGalleryBuilder()
                        .addItems(
                            new MediaGalleryItemBuilder()
                                .setURL("https://imgur.com/yTEFZAt.png"),
                        ),
                )
                .addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
                )
                .addMediaGalleryComponents(
                    new MediaGalleryBuilder()
                        .addItems(
                            new MediaGalleryItemBuilder()
                                .setURL("https://imgur.com/75Z3RzS.png"),
                        ),
                )
                .addMediaGalleryComponents(
                    new MediaGalleryBuilder()
                        .addItems(
                            new MediaGalleryItemBuilder()
                                .setURL("https://imgur.com/xobVr8x.png"),
                            new MediaGalleryItemBuilder()
                                .setURL("https://imgur.com/PTOGXyN.png"),
                            new MediaGalleryItemBuilder()
                                .setURL("https://imgur.com/acD2aPx.png"),
                        ),
                )
                .addMediaGalleryComponents(
                    new MediaGalleryBuilder()
                        .addItems(
                            new MediaGalleryItemBuilder()
                                .setURL("https://imgur.com/0iBVt7w.png"),
                        ),
                )


        const verifyButton = new ButtonBuilder()
            .setCustomId("createVerifyTicket")
            .setLabel("Assinar")
            .setEmoji("🎫")
            .setStyle(ButtonStyle.Success);
        const AR = new ActionRowBuilder<ButtonBuilder>().addComponents(verifyButton);

        await channel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [components, AR]
        })
    }

    public async createCommandsMessage(channel: TextChannel): Promise<void> {
        const container = new ContainerBuilder()
            .setAccentColor(14492795)
            .addMediaGalleryComponents(
                new MediaGalleryBuilder()
                    .addItems(
                        new MediaGalleryItemBuilder()
                            .setURL("https://imgur.com/yTEFZAt.png"),
                    ),
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
            )
            .addMediaGalleryComponents(
                new MediaGalleryBuilder()
                    .addItems(
                        new MediaGalleryItemBuilder()
                            .setURL("https://imgur.com/jF4Ml7R.png"),
                    ),
            )
            .addMediaGalleryComponents(
                new MediaGalleryBuilder()
                    .addItems(
                        new MediaGalleryItemBuilder()
                            .setURL("https://imgur.com/nlDc0Hy.png"),
                    ),
            )
            .addMediaGalleryComponents(
                new MediaGalleryBuilder()
                    .addItems(
                        new MediaGalleryItemBuilder()
                            .setURL("https://imgur.com/nFRNU0b.png"),
                    ),
            )
            .addMediaGalleryComponents(
                new MediaGalleryBuilder()
                    .addItems(
                        new MediaGalleryItemBuilder()
                            .setURL("https://imgur.com/x8fwYpB.png"),
                    ),
            )
            .addMediaGalleryComponents(
                new MediaGalleryBuilder()
                    .addItems(
                        new MediaGalleryItemBuilder()
                            .setURL("https://imgur.com/xvIfWI4.png"),
                    ),
            )
            .addMediaGalleryComponents(
                new MediaGalleryBuilder()
                    .addItems(
                        new MediaGalleryItemBuilder()
                            .setURL("https://imgur.com/a5dTKS1.png"),
                    ),
            )

        await channel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        })
    }

    public async createVerifyTicketChannel(client: Client, interaction: ButtonInteraction, mongoservice: MongoService) {
        const channel = interaction.channel as TextChannel;
        const user: User[] = await mongoservice.get("users", { userId: interaction.user.id }) as User[];
        if (user.length === 0) {
            await interaction.reply({ content: "É necessário ter pelo menos uma conta em algum RPG do momento para assinar o verificado.", flags: MessageFlags.Ephemeral })
            return;
        }

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

        const container = new ContainerBuilder()
            .setAccentColor(14492795)
            .addMediaGalleryComponents(
                new MediaGalleryBuilder()
                    .addItems(
                        new MediaGalleryItemBuilder()
                            .setURL("https://imgur.com/yTEFZAt.png"),
                    ),
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
            )
            .addMediaGalleryComponents(
                new MediaGalleryBuilder()
                    .addItems(
                        new MediaGalleryItemBuilder()
                            .setURL("https://imgur.com/WfkIAa1.png"),
                    ),
            )
            .addMediaGalleryComponents(
                new MediaGalleryBuilder()
                    .addItems(
                        new MediaGalleryItemBuilder()
                            .setURL("https://imgur.com/JGAQalc.png"),
                    ),
            )
            .addMediaGalleryComponents(
                new MediaGalleryBuilder()
                    .addItems(
                        new MediaGalleryItemBuilder()
                            .setURL("https://imgur.com/HFHnseC.png"),
                    ),
            )

        const subscriptionSelect = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('selectSubscriptionType')
                .setPlaceholder("Escolha a duração da assinatura")
                .addOptions([
                    {
                        label: '1 mês – R$19,90',
                        value: '1',
                        emoji: "👑",
                        description: 'Assinatura padrão mensal.'
                    },
                    {
                        label: '2 meses – R$29,90',
                        value: '2',
                        emoji: "👑",
                        description: 'R$14,95/mês, desconto de 25%!'
                    },
                    {
                        label: '3 meses – R$39,90',
                        value: '3',
                        emoji: "👑",
                        description: 'R$13,30/mês, desconto de 33%!'
                    }
                ])
        );

        await newTicketChannel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [container, subscriptionSelect]
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
                { name: '🎫 Meses de Verificado', value: `${String(subscriptionType)} mes(es)` },
                { name: 'id', value: interaction.user.id },
                { name: 'subscription', value: String(subscriptionType) }
            )
            .setImage(qrcodelink.attachments.first()!.url)
            .setFooter({ text: 'Envie o comprovante neste canal assim que concluir o pagamento que o desenvolvedor entrará em contato.' });

        const confirmPaymentButton: ButtonBuilder = new ButtonBuilder()
            .setCustomId("confirmPayment")
            .setEmoji("💵")
            .setLabel("Confirmar Pagamento")
            .setStyle(ButtonStyle.Success)
        const AR: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>();
        AR.addComponents(confirmPaymentButton);

        try {
            await interaction.message.delete()
        } catch { }

        await channel.send({
            embeds: [pixEmbed],
            components: [AR]
        })
    }

    public async confirmPayment(client: Client, interaction: ButtonInteraction, mongoservice: MongoService): Promise<void> {
        if (interaction.user.id !== process.env.OWNER_ID) {
            await interaction.reply({ content: "Opa! Esse botão é apenas para administradores...", flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.reply({ content: "Confirmando pagamento...", flags: MessageFlags.Ephemeral });

        const fields = interaction.message.embeds[0].fields;
        const subscriptionType = fields.find(field => field.name === "subscription")?.value;
        const userId = fields.find(field => field.name === "id")?.value;

        const user = await mongoservice.getOne("users", { userId: userId }) as User;

        if (!subscriptionType || !userId) {
            throw new Error("Invalid subscriptiontype or userId");
        }

        const now = new Date();

        const currentVerification = user.stats.isVerified ? new Date(user.stats.isVerified) : null;
        const baseDate = currentVerification && currentVerification > now ? currentVerification : now;

        const newVerificationExpirationDate = new Date(
            baseDate.getFullYear(),
            baseDate.getMonth() + Number(subscriptionType),
            baseDate.getDate()
        );

        await mongoservice.patch("users", { userId: userId }, {
            'stats.isVerified': newVerificationExpirationDate
        });

        const date = newVerificationExpirationDate.toLocaleDateString("pt-BR", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const component = new ContainerBuilder()
            .setAccentColor(14492795)
            .addMediaGalleryComponents(
                new MediaGalleryBuilder()
                    .addItems(
                        new MediaGalleryItemBuilder()
                            .setURL("https://imgur.com/yTEFZAt.png"),
                    ),
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
            )
            .addMediaGalleryComponents(
                new MediaGalleryBuilder()
                    .addItems(
                        new MediaGalleryItemBuilder()
                            .setURL("https://imgur.com/TsiGHts.png"),
                    ),
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`📅 **Válido até: **${date}\n\n*Obrigado por apoiar o universo do Momento. Nos vemos entre as luzes do palco e as sombras do roleplay. 🎭*`),
            )

        const channel: TextChannel = interaction.channel as TextChannel;
        await interaction.message.delete();
        await channel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [component]
        })

        await channel.send(`<@${interaction.user.id}>`)
            .then((msg: Message) => {
                msg.delete().then(() => {
                }).catch((error) => {
                    console.error("Error deleting ping message:", error);
                });
            })
            .catch((error) => console.error("Error sending ping message:", error));

        await channel.permissionOverwrites.edit(interaction.user.id, {
            SendMessages: false
        });

        return;
    }

    public async createFontList(client: Client, channel: TextChannel): Promise<void> {
        console.log("Creating font list...");
        const fonts = fontsPaths;
        for (const font of fonts) {
            try {
                const defaultUser = { ...DefaultUser };
                defaultUser.styles.fonts.primary = font.name;
                defaultUser.styles.fonts.secondary = font.name;

                const uploadChannel = await MomentoService.getUploadChannel(client);

                const drawedProfile = await drawProfileCanvas(defaultUser, uploadChannel, defaultTheme, 0, 0);
                const themeImageUrl = await LinkService.uploadImageToMomento(uploadChannel, drawedProfile.toBuffer());

                const components = [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`# ${font.name}`),
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
                        )
                        .addMediaGalleryComponents(
                            new MediaGalleryBuilder()
                                .addItems(
                                    new MediaGalleryItemBuilder()
                                        .setURL(themeImageUrl.attachments.first()?.url!),
                                ),
                        )
                ];

                await channel.send({ flags: MessageFlags.IsComponentsV2, components });
            }
            catch (error) {
                console.log(error);
            }
        }
    }
}