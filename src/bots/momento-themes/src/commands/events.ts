import { Client, Message, TextChannel } from "discord.js";
import { errorHandler } from "../../../../shared/handlers/errorHandler";
import { MongoService } from "../../../../shared/services/MongoService";
import { ThemeService } from "../../services/ThemesService";

export async function onReady(client: Client) {
    const channel = await client.channels.fetch(process.env.PROFILE_UPDATER_WEBHOOK_CHANNEL_ID!) as TextChannel;
    const messages = await channel.messages.fetch({ limit: 100 });

    const pending = messages.filter(m =>
        m.embeds.length > 0 &&
        !m.reactions.cache.has("✅") &&
        !m.reactions.cache.has("❌")
    );

    for (const message of pending.values()) {
        try {
            await message.react("❌");
            channel.send({
                embeds: message.embeds
            });
        } catch (err: any) {
            await message.react("❌");
            await message.startThread({
                name: err.message,
                autoArchiveDuration: 60,
                reason: err.message,
            }).then((thread) => {
                thread.send({
                    embeds: [errorHandler({
                        code: err.code,
                        message: err.message,
                    })]
                });
            }).catch(console.error);
        }
    }
}

export async function onMessageCreate(client: Client, message: Message, mongoservice: MongoService): Promise<void> {
    if (message.guildId === process.env.HUB_GUILD_ID && message.author.id === process.env.OWNER_ID) {
        if (!mongoservice) throw new Error("MongoService não disponível no contexto");
        const themeService = new ThemeService();

        if (message.content === '!createThemesList') {
            await themeService.createThemeList(client, message.channel as TextChannel, mongoservice);
            return;
        }

        if (message.content === '!createThemeMessage') {
            themeService.createThemeMessage(message);
            return;
        }
    }
}