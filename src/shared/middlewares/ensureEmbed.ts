import { Message } from "discord.js";
import { Middleware } from "./middleware";
import { Error } from "../models/Error";

export function ensureEmbed(requiredFields: string[]): Middleware {
  return (message: Message): true | Error => {
    if (message.embeds.length === 0) {
      return { message: "Mensagem não contém embed.", code: 400 };
    }

    const fields = message.embeds[0].data.fields;
    if (!fields) {
      return { message: "Embed não contém campos.", code: 400 };
    }

    for (const field of requiredFields) {
      const fieldData = fields.find((f) => f.name === field);
      if (!fieldData) {
        return { message: `Campo '${field}' não encontrado.`, code: 400 };
      }
      if (!fieldData.value) {
        return { message: `Campo '${field}' está vazio.`, code: 400 };
      }
    }

    return true;
  };
}
