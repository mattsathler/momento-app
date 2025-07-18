import { MongoService } from 'src/shared/services/MongoService';

export async function updateUsers(mongoService: MongoService): Promise<void> {
  console.log("Migrating verified");
  await mongoService.patch('users', {}, {
    'stats.isVerified': new Date(Date.now() + 24 * 60 * 60 * 1000),
    'styles.fonts': {
      primary: 'sfpro',
      secondary: 'sfpro'
    }
  });

  console.log('Migrated all users!');

}