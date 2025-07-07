import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, Guild, Message, TextChannel } from "discord.js";
import { Action } from "rxjs/internal/scheduler/Action";
import { Collage } from "src/shared/models/Collage";
import { DefaultUser } from "src/shared/models/DefaultUser";
import { defaultTheme, Theme } from "src/shared/models/Theme";
import { drawCollageCanvas } from "src/shared/services/canvas/CollageCanvas";
import { drawProfileCanvas } from "src/shared/services/canvas/ProfileCanvas";
import { LinkService } from "src/shared/services/LinkService";
import { MomentoService } from "src/shared/services/MomentoService";
import { MongoService } from "src/shared/services/MongoService";
import { createCollageEmbed, createThemeEmbed } from "src/shared/services/ThemeService";

export class ThemeService {
    public async createThemeList(client: Client, channel: TextChannel, mongoservice: MongoService): Promise<void> {
        console.log("Creating theme list...");
        const themes = await mongoservice.get("themes", {}) as Theme[];
        const uploadChannel = await MomentoService.getUploadChannel(client);

        themes.forEach(async (theme) => {
            const themeEmbed = createThemeEmbed("Desconhecido", theme);
            const drawedProfile = await drawProfileCanvas(DefaultUser, uploadChannel, theme, 0, 0);
            const themeImageUrl = await LinkService.uploadImageToMomento(uploadChannel, drawedProfile.toBuffer());
            themeEmbed.setImage(themeImageUrl.attachments.first()?.url!);
            if (drawedProfile) {
                await channel.send({
                    embeds: [themeEmbed]
                });
            } else {
                console.error(`Failed to draw profile for theme: ${theme.name}`);
            }
        });
    }

    public async createThemeMessage(message: Message): Promise<void> {
        const embed = new EmbedBuilder();
        embed.setDescription("Personalize o perfil do seu personagem com um tema único ou compartilhe sua criação com outros usuários usando a ferramenta de criação de temas do momento!\n\nPara usar um tema criado, basta ir no perfil do seu personagem, personalizar e digitar o nome do tema desejado no campo \"tema\".\n\n*🎫 A criação e utilização de temas personalizados é restrita somente a usuários verificados na plataforma, confira! <#1390674632016658585>*")
        embed.setColor('#DD247B');
        embed.setTitle('TEMA PERSONALIZADO');
        embed.setThumbnail("https://imgur.com/ZWx9A3N.png");

        const channel = message.channel as TextChannel;
        const newThemeButton = new ButtonBuilder()
            .setCustomId('openThemeModal')
            .setLabel('CRIAR TEMA')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🖌️')

        const ar = new ActionRowBuilder() as ActionRowBuilder<ButtonBuilder>;
        ar.addComponents(newThemeButton);
        await channel.send({
            components: [ar],
            embeds: [embed]
        });
    }

    public async createCollageList(client: Client, channel: TextChannel, mongoservice: MongoService): Promise<void> {
        console.log("Creating collage list...");
        const collages = await mongoservice.get("collages", {}) as Collage[];
        const uploadChannel = await MomentoService.getUploadChannel(client);

        collages.forEach(async (collage) => {
            const collagesEmbed = createCollageEmbed("Desconhecido", collage);
            const drawedProfile = await drawCollageCanvas(uploadChannel, DefaultUser, defaultTheme, collage);
            const collagesImageUrl = await LinkService.uploadImageToMomento(uploadChannel, drawedProfile.toBuffer());
            collagesEmbed.setImage(collagesImageUrl.attachments.first()?.url!);
            if (drawedProfile) {
                await channel.send({
                    embeds: [collagesEmbed]
                });
            } else {
                console.error(`Failed to draw profile for collage: ${collage.id}`);
            }
        });
    }

    public async createCollageMessage(message: Message): Promise<void> {
        const embed = new EmbedBuilder();
        embed.setDescription("Personalize o perfil do seu personagem com uma Collage ou compartilhe sua criação com outros usuários usando a ferramenta de criação de collage do momento!\n\nPara usar um collage criado, basta ir no perfil do seu personagem, personalizar e digitar o id da collge desejada no campo \"Estilo de Collage\".\n\n*🎫 A criação e utilização de temas & collages personalizados é restrita somente a usuários verificados na plataforma, confira! <#1390674632016658585>*")
        embed.setColor('#DD247B');
        embed.setTitle('COLLAGE PERSONALIZADO');
        embed.setThumbnail("https://imgur.com/ZWx9A3N.png");

        const channel = message.channel as TextChannel;
        const newThemeButton = new ButtonBuilder()
            .setCustomId('openCollageModal')
            .setLabel('CRIAR COLLAGE')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🪟')

        const ar = new ActionRowBuilder() as ActionRowBuilder<ButtonBuilder>;
        ar.addComponents(newThemeButton);
        await channel.send({
            components: [ar],
            embeds: [embed]
        });
    }
}