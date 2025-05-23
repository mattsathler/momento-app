import { EmbedBuilder, Message } from "discord.js";
import { MiddlewareResult } from "../middlewares/middleware";

export function errorHandler(error: MiddlewareResult): EmbedBuilder {
    if (error === true) return new EmbedBuilder();

    const errorEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle(`ERROR: ${String(error.code)}`)
        .setDescription(`Error Message: ${error.error}`)
        .setTimestamp()
    return errorEmbed;
}