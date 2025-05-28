import { createDiscordClient } from "../../shared/client";
import { handleMessage } from "../../shared/handlers/messageHandler";
import { Message } from "discord.js";
import dotenv from "dotenv";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { ensureEmbed } from "../../shared/middlewares/ensureEmbed";
import { validateToken } from "../../shared/middlewares/validateToken";
import { MongoService } from "../../shared/services/mongoService";
import { addToQueue } from "./src/profileQueue";
import { ProfileUpdateRequest } from "./models/ProfileUpdateRequest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

async function main(): Promise<void> {
    console.log("Initializing momento profile updater...");
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
        console.error("DISCORD_TOKEN is not defined in .env");
        process.exit(1);
    }

    const client = createDiscordClient();
    const mongoservice: MongoService = new MongoService();

    try {
        await client.login(token);
        console.log("Logged in to Discord!");
        const queue: ProfileUpdateRequest[] = [];


        client.on("messageCreate", (message: Message) => {
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
                        if (!mongo) throw new Error("MongoService não disponível no contexto");
                        await addToQueue(queue, client, message, mongo);
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
        });
    } catch (error) {
        console.error("Error logging in to Discord:", error);
    }
}

main();
