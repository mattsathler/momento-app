import { Client, GatewayIntentBits, Partials } from "discord.js";
import { getSecureToken } from "./services/TokenService";

export function createDiscordClient(): Client {
  const client = new Client({
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.GuildMessageReactions,
    ],
  });

  return client;
}
