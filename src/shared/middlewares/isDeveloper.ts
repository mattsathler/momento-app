import { Message } from "discord.js";
import { Error } from "../models/Error";

export function isDeveloper(message: Message): true | Error {
    const ownerId = process.env.OWNER_ID;
    if (!ownerId) {
        throw new Error("OWNER_ID is not defined in environment variables");
    };

    if (ownerId !== message.author.id) {
        return { message: "Usuário sem permissão para executar esse comando!", code: 401 };
    }

    return true;
}