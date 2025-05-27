import { Message } from "discord.js";

export function ensureEmbed(
  message: Message
): true | { error: string; code: number } {
  if (message.embeds.length === 0) {
    return { error: "Mensagem não contém embed.", code: 400 };
  }

  const fields = message.embeds[0].data.fields;
  if (!fields) {
    return { error: "Embed não contém campos.", code: 400 };
  }

  const requiredFields = [
    "guild_id",
    "target_user_id",
    "target_profile_channel_id",
    "type",
    "message",
    "sent_from",
  ];

  for (const field of requiredFields) {
    const fieldData = fields.find((f) => f.name === field);
    if (!fieldData) {
      return { error: `Campo '${field}' não encontrado.`, code: 400 };
    }
    if (!fieldData.value) {
      return { error: `Campo '${field}' está vazio.`, code: 400 };
    }
  }
  return true;
}
