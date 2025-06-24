import { createDiscordClient } from "../../shared/client";
import { Client, Message, TextChannel } from "discord.js";
import dotenv from "dotenv";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { MongoService } from "../../shared/services/MongoService";
import { AnalyticsQueue } from "./src/queues/AnalyticsQueue";
import { AnalyticsService } from "./services/AnalyticsService";
import { onMessageCreate, onReady } from "./src/commands/events";
import { getSecureToken } from "../../shared/services/TokenService";
import { MomentoService } from "src/shared/services/MomentoService";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

async function main(): Promise<void> {
  console.log("Initializing momento analytics...");
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.error("DISCORD_TOKEN is not defined in .env");
    process.exit(1);
  }

  const client = createDiscordClient();

  try {
    await client.login(token);
    console.log("Logged in to Discord!");
    const uploadChannel: TextChannel = await MomentoService.getUploadChannel(client);
    const mongoservice: MongoService = new MongoService();
    const analyticsService: AnalyticsService = new AnalyticsService();
    const analyticsQueue: AnalyticsQueue = new AnalyticsQueue(
      "Analytics",
      false,
      {
        client: client,
        mongoService: mongoservice,
        service: analyticsService,
      }
    );
    let activePostList = await mongoservice.get("posts", {
      "stats.status": "active",
    });
    activePostList.forEach((post) => {
      analyticsService.addPost(post);
    });

    await analyticsService.initAnalyticsCron(
      client,
      mongoservice,
      analyticsQueue,
      uploadChannel
    );

    client.on("ready", (client: Client) =>
      onReady(
        client,
        analyticsService,
        mongoservice,
        analyticsQueue,
        uploadChannel
      )
    );
    client.on("messageCreate", (message: Message) => {
      if (message.channelId === process.env.ANALYTICS_WEBHOOK_CHANNEL_ID) {
        onMessageCreate(client, message, mongoservice, analyticsService);
      }
    });
  } catch (error) {
    console.error("Error logging in to Discord:", error);
  }
}

main();
