import { seedDatabase } from '../utils/seeder.js';

seedDatabase()
  .then((result) => {
    console.log('Seeding completed successfully!', result);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
