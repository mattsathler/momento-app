import { Client, EmbedBuilder, Message, TextChannel } from "discord.js";
import { profileUpdaterService } from "../../services/profileUpdaterService";
import { errorHandler } from "../../../../shared/handlers/errorHandler";
import { getSecureToken } from "../../../../shared/services/tokenService";
import { ensureEmbed } from "../../../../shared/middlewares/ensureEmbed";
import { validateToken } from "../../../../shared/middlewares/validateToken";
import { handleMessage } from "../../../../shared/handlers/messageHandler";
import { MongoService } from "../../../../shared/services/mongoService";
import { ProfileUpdateQueue } from "../queues/profileUpdateQueue";

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
            const service: profileUpdaterService = new profileUpdaterService();
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

export function onMessageCreate(client: Client, message: Message, mongoservice: MongoService, profileUpdateQueue: ProfileUpdateQueue): void {
    const middlewares = [
        ensureEmbed(["guild_id", "target_user_id", "sent_from"]),
        validateToken,
    ];

    if (message.channelId === process.env.PROFILE_UPDATER_WEBHOOK_CHANNEL_ID) {
        handleMessage(
            client,
            message,
            middlewares,
            async (client, message, context) => {
                const mongo = context?.services?.mongo;
                const service: profileUpdaterService = new profileUpdaterService();
                if (!mongo) throw new Error("MongoService não disponível no contexto");
                profileUpdateQueue.enqueue({
                    client: client,
                    message: message,
                    mongo: mongoservice,
                    request: service.extractProfileUpdateRequest(message)
                });
            }, {
            message: "Não foi possível atualizar esse usuário",
            code: 500,
        },
            {
                services: {
                    mongo: mongoservice
                }
            });
    }
}