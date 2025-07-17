import { ButtonInteraction, Client, Message, SelectMenuInteraction, TextChannel } from "discord.js";
import { errorHandler } from "../../../../shared/handlers/errorHandler";
import { MongoService } from "../../../../shared/services/MongoService";
import { ThemeService } from "../../services/ThemesService";
import { HubService } from "../../services/HubService";

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
        const hubService = new HubService();

        switch (message.content) {
            case '!createThemeList':
                await themeService.createThemeList(client, message.channel as TextChannel, mongoservice);
                return;

            case '!createThemeMessage':
                await themeService.createThemeMessage(message);
                return;

            case '!createCollageList':
                await themeService.createCollageList(client, message.channel as TextChannel, mongoservice);
                return;

            case '!createCollageMessage':
                await themeService.createCollageMessage(message);
                return;

            case "!createVerifyMessage":
                await hubService.createVerifyMessage(message.channel as TextChannel);
                return;

            case "!createCommandsMessage":
                await hubService.createCommandsMessage(message.channel as TextChannel);
                return;
        }
        return;
    }
}

export async function onInteractionCreate(client: Client, interaction: ButtonInteraction | SelectMenuInteraction, mongoservice: MongoService): Promise<void> {
    const hubService: HubService = new HubService();

    if (interaction.guildId === process.env.HUB_GUILD_ID) {
        switch (interaction.customId) {
            case "createVerifyTicket": await hubService.createVerifyTicketChannel(client, interaction as ButtonInteraction, mongoservice);
                break;

            case "selectSubscriptionType": await hubService.createPaymentQRCode(client, interaction as SelectMenuInteraction);
                break;
            
            case "confirmPayment": await hubService.confirmPayment(client, interaction as ButtonInteraction, mongoservice);
                break;
        }
        return;
    }
}