import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, Message, MessageFlags, SeparatorBuilder, SeparatorSpacingSize, TextChannel, TextDisplayBuilder } from "discord.js";
import { Collage } from "src/shared/models/Collage";
import { DefaultUser } from "src/shared/models/DefaultUser";
import { defaultTheme, Theme } from "src/shared/models/Theme";
import { drawCollageCanvas } from "src/shared/services/canvas/CollageCanvas";
import { drawProfileCanvas } from "src/shared/services/canvas/ProfileCanvas";
import { LinkService } from "src/shared/services/LinkService";
import { MomentoService } from "src/shared/services/MomentoService";
import { MongoService } from "src/shared/services/MongoService";

export class ThemeService {
    public async createThemeList(client: Client, channel: TextChannel, mongoservice: MongoService): Promise<void> {
        console.log("Creating theme list...");
        const themes = await mongoservice.get("themes", {}) as Theme[];
        const uploadChannel = await MomentoService.getUploadChannel(client);

        themes.forEach(async (theme) => {
            try {
                const drawedProfile = await drawProfileCanvas(DefaultUser, uploadChannel, theme, 0, 0);
                const themeImageUrl = await LinkService.uploadImageToMomento(uploadChannel, await drawedProfile.toBuffer('jpeg'));

                const components = [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`# ${theme.name}`),
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

                if (drawedProfile) {
                    await channel.send({
                        flags: MessageFlags.IsComponentsV2,
                        components: components
                    });
                } else {
                    console.error(`Failed to draw profile for theme: ${theme.name}`);
                }
            }
            catch (error) {
                console.error(`Error processing theme ${theme.name}:`, error);
            }
        });
    }

    public async createThemeMessage(message: Message): Promise<void> {
        const container =
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
                                .setURL("https://imgur.com/qiMeGbn.png"),
                        ),
                )
                .addMediaGalleryComponents(
                    new MediaGalleryBuilder()
                        .addItems(
                            new MediaGalleryItemBuilder()
                                .setURL("https://imgur.com/wf4Bnb0.png"),
                        ),
                )
                .addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`*🎫 A criação e utilização de temas personalizados é restrita somente a usuários verificados na plataforma, confira: <#1390674632016658585>*`),
                )

        const channel = message.channel as TextChannel;
        const newThemeButton = new ButtonBuilder()
            .setCustomId('openThemeModal')
            .setLabel('CRIAR TEMA')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🖌️')

        const ar = new ActionRowBuilder() as ActionRowBuilder<ButtonBuilder>;
        ar.addComponents(newThemeButton);
        await channel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [container, ar],
        });
    }

    public async createCollageList(client: Client, channel: TextChannel, mongoservice: MongoService): Promise<void> {
        console.log("Creating collage list...");
        const collages = await mongoservice.get("collages", {}) as Collage[];
        const uploadChannel = await MomentoService.getUploadChannel(client);

        collages.forEach(async (collage) => {
            try {
                const drawedProfile = await drawCollageCanvas(uploadChannel, DefaultUser, defaultTheme, collage);
                const collagesImageUrl = await LinkService.uploadImageToMomento(uploadChannel, await drawedProfile.toBuffer('jpeg'));

                const components = [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`# ${collage.id}`),
                        )
                        .addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
                        )
                        .addMediaGalleryComponents(
                            new MediaGalleryBuilder()
                                .addItems(
                                    new MediaGalleryItemBuilder()
                                        .setURL(collagesImageUrl.attachments.first()?.url!),
                                ),
                        )
                ];

                if (drawedProfile) {
                    await channel.send({
                        flags: MessageFlags.IsComponentsV2,
                        components: components
                    });
                } else {
                    console.error(`Failed to draw profile for collage: ${collage.id}`);
                }
            }
            catch (error) {
                console.error(`Error processing collage ${collage.id}:`, error);
            }
        });

    }

    public async createCollageMessage(message: Message): Promise<void> {
        const container =
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
                                .setURL("https://imgur.com/rw5qgBs.png"),
                        ),
                )
                .addMediaGalleryComponents(
                    new MediaGalleryBuilder()
                        .addItems(
                            new MediaGalleryItemBuilder()
                                .setURL("https://imgur.com/siuwdIi.png"),
                        ),
                )
                .addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`*🎫 A criação e utilização de collages personalizados é restrita somente a usuários verificados na plataforma, confira: <#1390674632016658585>*`),
                )

        const channel = message.channel as TextChannel;
        const newThemeButton = new ButtonBuilder()
            .setCustomId('openCollageModal')
            .setLabel('CRIAR COLLAGE')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🪟')

        const ar = new ActionRowBuilder() as ActionRowBuilder<ButtonBuilder>;
        ar.addComponents(newThemeButton);
        await channel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [container, ar],
        });
    }
}