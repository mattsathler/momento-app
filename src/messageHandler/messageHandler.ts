import { Message } from "discord.js";
import "dotenv/config";
import { ensureEmbed } from "../middlewares/ensureEmbed";
import { Middleware } from "../middlewares/middleware";
import { validateToken } from "../middlewares/validateToken";

export function handleMessage(message: Message): void {
  const targetChannelId = process.env.NOTIFICATION_WEBHOOK_CHANNEL_ID;

  try {
    if (message.guildId !== process.env.API_GUILD_ID) return;
    if (message.channel.id !== targetChannelId) return;

    message.react("⏳").then(async () => {
      const middlewares: Middleware[] = [validateToken, ensureEmbed];

      for (const middleware of middlewares) {
        const result = middleware(message);
        if (result !== true) {
          await message.react("❌").catch(console.error);
          await message
            .startThread({
              name: String(result.code),
              autoArchiveDuration: 60,
            })
            .then((thread) => {
              thread.send(`ERROR: ${result.error}`);
            });
          return;
        }
      }




      await message.react("✅").catch(console.error);
    });
  } catch (error) {
    console.error("Error handling message:", error);
  }
}
