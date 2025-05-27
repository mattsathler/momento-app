import { Client, Message } from "discord.js";
import "dotenv/config";
import { ensureEmbed } from "../middlewares/ensureEmbed";
import { Middleware } from "../middlewares/middleware";
import { validateToken } from "../middlewares/validateToken";
import { runMiddlewares } from "../middlewares/_index";
import { errorHandler } from "./errorHandler";
import { sendNotification } from "../../bots/momento-notifications/commands/sendNotification";

export async function handleMessage(client: Client, message: Message): Promise<void> {
  const targetChannelId = process.env.NOTIFICATION_WEBHOOK_CHANNEL_ID;

  if (message?.guildId !== process.env.API_GUILD_ID) return;
  if (message.channel.id !== targetChannelId) return;

  try {
    await message.react("⏳");

    const middlewares: Middleware[] = [ensureEmbed, validateToken];
    const isValid = await runMiddlewares(message, middlewares);
    if (!isValid) return;

    await sendNotification(client, message);
    await message.react("✅");

  } catch (error: any) {
    await message.startThread({
      name: "Erro ao enviar notificação",
      autoArchiveDuration: 60,
      reason: "Erro ao enviar notificação",
    }).then((thread) => {
      thread.send({
        embeds: [errorHandler({
          code: 500,
          error: error.message,
        })]
      });
    }).catch(console.error);

    await message.react("❌").catch(console.error);
  }
}

