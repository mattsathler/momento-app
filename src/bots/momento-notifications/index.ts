import { createDiscordClient } from "../../shared/client";
import { handleMessage } from "../../shared/handlers/messageHandler";
import { Message } from "discord.js";
import dotenv from "dotenv";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { sendNotification } from "./commands/sendNotification";
import { ensureEmbed } from "../../shared/middlewares/ensureEmbed";
import { validateToken } from "../../shared/middlewares/validateToken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });


// Ajuste o caminho conforme a posição do .env na raiz do monorepo
async function main(): Promise<void> {
  console.log("Initializing momento notifications...");
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.error("DISCORD_TOKEN is not defined in .env");
    process.exit(1);
  }

  const client = createDiscordClient();

  try {
    await client.login(token);
    console.log("Logged in to Discord!");

    const requiredFields = [
      "guild_id",
      "target_user_id",
      "target_profile_channel_id",
      "type",
      "message",
      "sent_from",
    ];

    client.on("messageCreate", (message: Message) => {
      const middlewares = [
        ensureEmbed(requiredFields),
        validateToken
      ];

      if (message.channelId === process.env.NOTIFICATION_WEBHOOK_CHANNEL_ID)
        handleMessage(client, message, middlewares, sendNotification, {
          message: "Não foi possível enviar a notificação",
          code: 500
        });
    });
  } catch (error) {
    console.error("Error logging in to Discord:", error);
  }
}

main();
