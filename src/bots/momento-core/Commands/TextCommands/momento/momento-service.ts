import { Guild, TextChannel } from "discord.js"
import { DefaultChannels } from "../../../GuildDefaults/DefaultChannels"
import { DefaultsRoles } from "../../../GuildDefaults/DefaultRoles"
import { DefaultEmojis } from "../../../GuildDefaults/DefaultEmojis"
import { MongoService } from "src/shared/services/MongoService"
export class MomentoService {
    async configureGuild(guild: Guild): Promise<void> {
        await this.createDefaultsRoles(guild)
        await this.createDefaultsEmojis(guild)
    }

    async createDefaultsChannels(guild: Guild): Promise<void> {
        for (let channel in DefaultChannels) {
            try {
                const createdChannel = await guild.channels.create(DefaultChannels[channel].options) as TextChannel
                if (DefaultChannels[channel].isPrivate) {
                    await createdChannel.permissionOverwrites.create(
                        guild.roles.everyone, {
                        ViewChannel: false
                    })
                }
                if (DefaultChannels[channel].canSendMessage) {
                    await createdChannel.permissionOverwrites.create(
                        guild.roles.everyone, {
                        SendMessages: false
                    })
                }
            }
            catch (err) {
                console.log(err)
            }
        }
    }

    async createDefaultsRoles(guild: Guild): Promise<void> {
        for (let role in DefaultsRoles) {
            try {
                await guild.roles.create(DefaultsRoles[role])
            }
            catch (err) {
                console.log(err)
            }
        }
    }

    async createDefaultsEmojis(guild: Guild): Promise<void> {
        for (let emoji in DefaultEmojis) {
            try {
                await guild.emojis.create({
                    name: DefaultEmojis[emoji].img,
                    attachment: DefaultEmojis[emoji].name
                })
            }
            catch (err) {
                console.log(err)
            }
        }
    }
}

