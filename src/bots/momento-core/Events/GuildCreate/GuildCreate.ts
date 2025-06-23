import { Guild } from "discord.js";
import { IContext } from "../../Interfaces/IContext";
import { GuildCreateService } from "./GuildCreateService";

export async function guildCreate(ctx: IContext, guild: Guild) {
    const serverConfig = await ctx.mongoService.get('servers', { id: guild.id })
    const service = new GuildCreateService()

    return
}
