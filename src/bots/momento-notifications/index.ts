import { createDiscordClient } from "../../shared/client";
import { handleMessage } from "../../shared/handlers/messageHandler";
import { Message } from "discord.js";
import dotenv from "dotenv";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

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

    client.on("messageCreate", (message: Message
) => {
      handleMessage
(client, message);
    });
  } catch (error) {
    console.error("Error logging in to Discord:", error);
  }
}

main();
