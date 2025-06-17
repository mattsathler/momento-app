import { createDiscordClient } from "../../shared/client";
import { Client, Message } from "discord.js";
import dotenv from "dotenv";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { onMessageCreate, onReady } from "./src/commands/events";
import { NotificationsQueue } from "./src/queues/NotificationsQueue";
import { MongoService } from "../../shared/services/MongoService";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Ajuste o caminho conforme a posição do .env na raiz do monorepo
async function main(): Promise<void> {
  console.log("Initializing momento notifications...");
  const notificationsQueue: NotificationsQueue = new NotificationsQueue("Notifications", true);

  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.error("DISCORD_TOKEN is not defined in .env");
    process.exit(1);
  }

  const client = createDiscordClient();

  try {
    await client.login(token);
    console.log("Logged in to Discord!");
    const mongoservice: MongoService = new MongoService();

    client.on("ready", (client: Client) => onReady(client));
    client.on("messageCreate", (message: Message) => {
      if (message.channelId === process.env.NOTIFICATION_WEBHOOK_CHANNEL_ID) {
        onMessageCreate(client, message, mongoservice, notificationsQueue);
      }
    });
  } catch (error) {
    console.error("Error logging in to Discord:", error);
  }
}

main();
