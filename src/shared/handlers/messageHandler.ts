import { Client, Message } from "discord.js";
import "dotenv/config";
import { Middleware, runMiddlewares } from "../middlewares/middleware";
import { errorHandler } from "./errorHandler";
import { Error } from "../models/Error";
import { HandlerContext } from "./handlerContext";

export async function handleMessage(
  client: Client,
  message: Message,
  middlewares: Middleware[],
  callback: (
    client: Client,
    message: Message,
    context?: HandlerContext
  ) => Promise<void>,
  fail: Error,
  context?: HandlerContext
): Promise<void> {
  if (message?.guildId !== process.env.API_GUILD_ID) return;

  try {
    await message.react("⏳");

    const isValid = await runMiddlewares(message, middlewares);
    if (!isValid) return;

    await callback(client, message, context);
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

