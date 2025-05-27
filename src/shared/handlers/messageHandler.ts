import { Client, Message } from "discord.js";
import "dotenv/config";
import { Middleware, runMiddlewares } from "../middlewares/middleware";
import { errorHandler } from "./errorHandler";
import { error } from "../models/error";

export async function handleMessage(client: Client, message: Message, middlewares: Middleware[], callback: (client: Client, message: Message) => Promise<void>, fail: error): Promise<void> {
  const targetChannelId = process.env.NOTIFICATION_WEBHOOK_CHANNEL_ID;

  if (message?.guildId !== process.env.API_GUILD_ID) return;
  if (message.channel.id !== targetChannelId) return;

  try {
    await message.react("⏳");

    const isValid = await runMiddlewares(message, middlewares);
    if (!isValid) return;

    await callback(client, message);
    await message.react("✅");

  } catch (error: any) {
    await message.startThread({
      name: fail.message,
      autoArchiveDuration: 60,
      reason: fail.message,
    }).then((thread) => {
      thread.send({
        embeds: [errorHandler({
          code: fail.code,
          message: fail.message,
        })]
      });
    }).catch(console.error);

    await message.react("❌").catch(console.error);
  }
}

