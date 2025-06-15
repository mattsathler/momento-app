import { createDiscordClient } from "../../shared/client";
import { Client, Message } from "discord.js";
import dotenv from "dotenv";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { onMessageCreate, onReady } from "./src/commands/events";
import { MongoService } from "../../shared/services/mongoService";
import { AnalyticsQueue } from "./src/queues/AnalyticsQueue";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

async function main(): Promise<void> {
  console.log("Initializing momento analytics...");
  const analyticsQueue: AnalyticsQueue = new AnalyticsQueue("Analytics", true);

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
      if (message.channelId === process.env.POST_WEBHOOK_CHANNEL_ID) {
        onMessageCreate(client, message, mongoservice, analyticsQueue);
      }
    });
  } catch (error) {
    console.error("Error logging in to Discord:", error);
  }
}

main();
