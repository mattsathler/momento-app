import { createDiscordClient } from "./client";
import "dotenv/config";

function init(): void {
  console.log("Initializing momento notifications...");
  const client = createDiscordClient();

  client
    .login(process.env.DISCORD_TOKEN)
    .then(() => {
      console.log("Logged in to Discord!");
    })
    .catch((error) => {
      console.error("Error logging in to Discord:", error);
    });
}

init();
