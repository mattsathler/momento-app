import { Message } from "discord.js";
import { error } from "../models/error";
import { errorHandler } from "../handlers/errorHandler";
export type MiddlewareResult = true | error;
export type Middleware<T = any> = (message: Message, args?: T) => Promise<MiddlewareResult> | MiddlewareResult;

export async function runMiddlewares<T>(
    message: Message,
    middlewares: Middleware<T>[],
    args?: T
): Promise<boolean> {
    for (const middleware of middlewares) {
        const result = await middleware(message, args);

        if (result !== true) {
            await message.react("❌").catch(console.error);
            await message
                .startThread({
                    name: String(result.code),
                    autoArchiveDuration: 60,
                })
                .then((thread) => {
                    thread.send({ embeds: [errorHandler(result)] });
                });

            return false;
        }
    }

    return true;
}
