import { Client } from 'discord.js';
import { User } from 'src/shared/models/user';
import { MomentoService } from 'src/shared/services/MomentoService';
import { MongoService } from 'src/shared/services/MongoService';

export async function updateUsers(client: Client, mongoService: MongoService): Promise<void> {
  console.log("Migrating verified");
  const guildId = '1386692520930574488';

  const users = await mongoService.get("users", {
    guildId: guildId,
  }) as User[];

  const guild = await client.guilds.fetch(guildId);

  // await mongoService.patch('users', {
  //   guildId: guildId,
  // }, {
  //   'stats.isVerified': new Date(Date.now() - 24 * 60 * 60 * 1000),
  //   'styles.fonts': {
  //     primary: 'sfpro',
  //     secondary: 'sfpro'
  //   },
  //   'styles.theme': 'light',
  //   'styles.collage': 0
  // });

  for (const [index, user] of users.entries()) {
    try {
      console.log('Processing', user.username);

      try {
        await guild.channels.fetch(user.references.channelId!);
        await MomentoService.requestUpdateProfile(user, true);
      }
      catch {
        console.log("🗑️ Canal deletado");
      }
      console.log(`✅ Processado ${index + 1} de ${users.length}`);
    } catch (error) {
      console.log(`⚠️ Erro ao processar usuário ${index + 1}:`, error);
    }

    await sleep(2000); // Delay para evitar rate limit
  }

  console.log('Migrated all users!');
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
