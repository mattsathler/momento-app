import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, Message, TextChannel } from "discord.js";
import { Action } from "rxjs/internal/scheduler/Action";
import { DefaultUser } from "src/shared/models/DefaultUser";
import { Theme } from "src/shared/models/Theme";
import { drawProfileCanvas } from "src/shared/services/canvas/ProfileCanvas";
import { LinkService } from "src/shared/services/LinkService";
import { MomentoService } from "src/shared/services/MomentoService";
import { MongoService } from "src/shared/services/MongoService";
import { createThemeEmbed } from "src/shared/services/ThemeService";

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

    public createThemeMessage(message: Message): void {
        const embed = new EmbedBuilder();
        embed.setDescription("Personalize o perifl do seu personagem com um tema único ou compartilhe sua criação com outros usuários usando a ferramenta de criação de temas do momento!\n\nPara usar um tema criado, basta ir no perfil do seu personagem, personalizar e digitar o nome do tema desejado no campo \"tema\".\n\n*🎫 A criação e utilização de temas personalizados é restrita somente a usuários verificados na plataforma, confira! <#1390674632016658585>*")
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
        channel.send({
            components: [ar],
            embeds: [embed]
        });
    }
}