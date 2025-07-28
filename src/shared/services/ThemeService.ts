import { Client, ContainerBuilder, EmbedBuilder, Guild, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SeparatorBuilder, SeparatorSpacingSize, TextChannel, TextDisplayBuilder } from "discord.js";
import { defaultTheme, Theme } from "../models/Theme";
import { Collage } from "../models/Collage";
import { MomentoService } from "./MomentoService";
import { drawProfileCanvas } from "./canvas/ProfileCanvas";
import { DefaultUser } from "../models/DefaultUser";
import { LinkService } from "./LinkService";
import { drawCollageCanvas } from "./canvas/CollageCanvas";

export function hexToRgb(hex: string): [number, number, number] {
    const cleaned = hex.replace('#', '');
    const bigint = parseInt(cleaned, 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

export function adjustLightness(rgb: [number, number, number], amount: number): [number, number, number] {
    return rgb.map(c => Math.min(255, Math.max(0, c + amount))) as [number, number, number];
}

export function generateSurface(background: string): string {
    const rgb = hexToRgb(background);
    const avg = (rgb[0] + rgb[1] + rgb[2]) / 3;
    const adjustment = avg > 127 ? -16 : 16;
    const adjusted = adjustLightness(rgb, adjustment);
    return rgbToHex(...adjusted);
}

export function createCollageEmbed(username: string, collage: Collage): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setColor('#DD247B')
        .setTitle('COLLAGE')
        .setThumbnail('https://imgur.com/ZWx9A3N.png')
        .setDescription("Para usar, cole o ID da collage na personalização do seu perfil de usuário.")

        .addFields([
            {
                name: 'id',
                value: String(collage.id)
            }
        ])
        .setFooter({
            text: `Criado por: ${username}`,
            iconURL: 'https://imgur.com/ZWx9A3N.png'
        })

    return embed
}

export async function displayThemeInCatalogue(client: Client, guild: Guild, theme: Theme) {
    const hubGuildId = process.env.HUB_GUILD_ID;
    const hubGuild = await client.guilds.fetch(hubGuildId!);

    const themeUploaderChannel = await hubGuild.channels.fetch(process.env.HUB_THEMES_CHANNEL_ID!) as TextChannel;
    const uploadChannel = await MomentoService.getUploadChannel(client);
    const postCount = 0;
    const trendingCount = 0;
    const newThemeProfile = await drawProfileCanvas(DefaultUser, uploadChannel, theme, postCount, trendingCount);
    const themeLink = await LinkService.uploadImageToMomento(uploadChannel, await newThemeProfile.toBuffer('jpeg'));

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
                            .setURL(themeLink.attachments.first()?.url!),
                    ),
            )
    ];

    await themeUploaderChannel.send({
        flags: MessageFlags.IsComponentsV2,
        components: components
    });
}

export async function displayCollageInCatalogue(client: Client, author: string, collage: Collage) {
    const hubGuildId = process.env.HUB_GUILD_ID;
    const hubGuild = await client.guilds.fetch(hubGuildId!);

    const collageUploaderChannel = await hubGuild.channels.fetch(process.env.HUB_COLLAGES_CHANNEL_ID!) as TextChannel;
    const uploadChannel = await MomentoService.getUploadChannel(client);
    const newProfileCollage = await drawCollageCanvas(uploadChannel, DefaultUser, defaultTheme, collage);
    const collageLink = await LinkService.uploadImageToMomento(uploadChannel, await newProfileCollage.toBuffer('jpeg'));

    const collageEmbed = createCollageEmbed(author || 'Indisponível', collage).setImage(collageLink.attachments.first()?.url || '')

    await collageUploaderChannel.send({ embeds: [collageEmbed] });
}
