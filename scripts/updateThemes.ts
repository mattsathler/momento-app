import { Client, Guild } from 'discord.js';
import emojiRegex from 'emoji-regex';
import { IServer } from 'src/bots/momento-core/Interfaces/IServer';
import { StringValidator } from 'src/bots/momento-core/Utils/StringValidator';
import { User } from 'src/shared/models/user';
import { MomentoService } from 'src/shared/services/MomentoService';
import { MongoService } from 'src/shared/services/MongoService';

export async function updateThemes(mongoService: MongoService): Promise<void> {
  console.log("Migrating themes");
  await mongoService.updateMany('themes', {}, {
    last_use: new Date(),
    is_system_theme: false
  });
  await mongoService.delete('themes', {
    name: 'light'
  });
  await mongoService.delete('themes', {
    name: 'dark'
  });

  console.log('Migrated all themes!');

}

export async function removeEmojisFromUsernames(client: Client, mongoService: MongoService): Promise<void> {
  const guilds = await mongoService.get("servers", {}) as IServer[];

  guilds.forEach(async rpg => {
    try {
      const guildId = rpg.id;


      const guild = await client.guilds.fetch(guildId);
      const users = await mongoService.get("users", { 'guildId': guild.id }) as User[]
      users.forEach(async user => {
        if (!MomentoService.isUserVerified(user.stats.isVerified)) {
          if (StringValidator.hasEmoji(user.username)) {
            console.log("Renaming", user.username);
            user.username = user.username.replace(emojiRegex(), '');
            await mongoService.patch("users", { guildId: guild.id, userId: user.userId }, user);
            try {

              const profileChannel = await guild.channels.fetch(user.references.channelId!);
              await profileChannel?.setName(user.username);
            } catch {

            }
          }
        }
      })
    }
    catch { }
  })
}