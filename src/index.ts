import { createDiscordClient } from "./client.js";
import { handleMessage } from "./handlers/messageHandler.js";
import "dotenv/config";

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

    client.on("messageCreate", (message) => {
      handleMessage(client, message);
    });
  } catch (error) {
    console.error("Error logging in to Discord:", error);
  }
}

main();
