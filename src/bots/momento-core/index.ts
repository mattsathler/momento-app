require("dotenv").config();
const mongo = require('mongoose');
import { Guild, TextChannel } from "discord.js";
import { IContext } from "./Interfaces/IContext";
import { EventHandler } from "./EventsHandlers/EventHandler";
import { EventList } from "./EventsHandlers/EventList";
import { IPost } from "./Interfaces/IPost";
import { LinkService } from "src/shared/services/LinkService";
import { MongoService } from "src/shared/services/MongoService";
import { createDiscordClient } from "src/shared/client";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const client = createDiscordClient();
const mongoService = new MongoService();
const linkService = new LinkService();
let ctx: IContext;

let interactors: string[] = []
let activePostList: IPost[] = []

async function createContext(): Promise<IContext> {
	if (!process.env.API_GUILD_ID) throw new Error('ID da API inválida!');
	if (!process.env.DB_CHANNEL_ID) throw new Error('ID do upload channel inválido!');
	const apiserver = await client.guilds.fetch(process.env.API_GUILD_ID) as Guild;
	const uploadChannel = await apiserver.channels.fetch(process.env.DB_CHANNEL_ID) as TextChannel;

	const ctx: IContext = {
		mongoService: mongoService,
		client: client,
		linkService: linkService,
		interactors: interactors,
		activePostList: activePostList,
		uploadChannel: uploadChannel
	}

	return ctx;
}

client.once('ready', async () => {
	ctx = await createContext();
});

const events: EventHandler = new EventHandler();
for (let event of EventList) {
	client.on(event, async (...args) => {
		try {
			events[event](ctx, ...args)
		}
		catch (err) {
			console.log(err)
		}
	})
}

client.login(process.env.TOKEN);