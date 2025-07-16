import { MongoService } from 'src/shared/services/MongoService';

export async function migrateVerified(mongoService: MongoService): Promise<void> {
  console.log("Migrating verified");  
  await mongoService.patch('users', {}, {
    'stats.isVerified': new Date(Date.now() + 24 * 60 * 60 * 1000)
  });

  console.log('Migrated all users!');

}