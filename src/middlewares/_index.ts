import { EmbedBuilder, Message } from "discord.js";
import { Middleware } from "./middleware";
import { errorHandler } from "../handlers/errorHandler";

export async function runMiddlewares(message: Message, middlewares: Middleware[]): Promise<boolean> {
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
                    thread.send({ embeds: [errorHandler(result)] });
                });
            return false
        }
    }

    return true;
}
