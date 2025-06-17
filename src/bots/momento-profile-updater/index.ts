import { createDiscordClient } from "../../shared/client";
import { Message } from "discord.js";
import dotenv from "dotenv";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { onMessageCreate, onReady } from "./src/commands/events";
import { MongoService } from "../../shared/services/MongoService";
import { ProfileUpdateQueue } from "./src/queues/profileUpdateQueue";

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

  try {
    await client.login(token);
    console.log("Logged in to Discord!");
    const profileUpdateQueue: ProfileUpdateQueue = new ProfileUpdateQueue("Profile Updater");
    const mongoservice: MongoService = new MongoService();

    client.on("messageCreate", (message: Message) =>
      onMessageCreate(client, message, mongoservice, profileUpdateQueue)
    );
    client.on("ready", async () => onReady(client));
  } catch (error) {
    console.error("Error logging in to Discord:", error);
  }
}

main();
