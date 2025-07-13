import { EmbedBuilder } from "discord.js";
import { MiddlewareResult } from "../middlewares/middleware";

export function errorHandler(error: MiddlewareResult): EmbedBuilder {
    if (error === true) return new EmbedBuilder();

    const errorEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle(`ERROR: ${String(error.code) || "500"}`)
        .setDescription(`Error Message: ${error.message}` || "Unknown error message!")
        .setTimestamp()
    return errorEmbed;
}