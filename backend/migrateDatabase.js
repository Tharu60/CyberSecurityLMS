import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new sqlite3.Database(join(__dirname, 'lms.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

console.log('Starting database migration...\n');

// Check if government_id column already exists
db.all("PRAGMA table_info(users)", (err, columns) => {
  if (err) {
    console.error('Error checking schema:', err.message);
    db.close();
    return;
  }

  const hasGovernmentId = columns.some(col => col.name === 'government_id');

  if (hasGovernmentId) {
    console.log('✓ government_id column already exists. No migration needed.');
    db.close();
    return;
  }

  console.log('Adding government_id column to users table...');

  // First, let's check how many users exist
  db.get("SELECT COUNT(*) as count FROM users", (err, result) => {
    if (err) {
      console.error('Error counting users:', err.message);
      db.close();
      return;
    }

    if (result.count > 0) {
      console.log(`Found ${result.count} existing users.`);
      console.log('Adding government_id column with default values...\n');

      // Add column as nullable first
      db.run("ALTER TABLE users ADD COLUMN government_id TEXT", (err) => {
        if (err) {
          console.error('Error adding column:', err.message);
          db.close();
          return;
        }

        console.log('✓ government_id column added.');

        // Generate unique government IDs for existing users
        db.all("SELECT id FROM users", (err, users) => {
          if (err) {
            console.error('Error fetching users:', err.message);
            db.close();
            return;
          }

          let completed = 0;
          users.forEach((user, index) => {
            // Generate a unique government ID in format XXXX/12345
            const letters = 'ABCD';
            const numbers = String(10000 + user.id).padStart(5, '0');
            const govId = `${letters}/${numbers}`;

            db.run("UPDATE users SET government_id = ? WHERE id = ?", [govId, user.id], (err) => {
              if (err) {
                console.error(`Error updating user ${user.id}:`, err.message);
              } else {
                console.log(`✓ Updated user ${user.id} with government_id: ${govId}`);
              }

              completed++;
              if (completed === users.length) {
                console.log('\n✓ Migration completed successfully!');
                console.log('Note: Existing users have been assigned temporary government IDs.');
                console.log('They can update their government IDs in their profile settings.\n');
                db.close();
              }
            });
          });
        });
      });
    } else {
      // No existing users, we can add the column with NOT NULL constraint
      console.log('No existing users found. Adding government_id column with NOT NULL constraint...');

      db.run("ALTER TABLE users ADD COLUMN government_id TEXT UNIQUE NOT NULL", (err) => {
        if (err) {
          console.error('Error adding column:', err.message);
        } else {
          console.log('✓ government_id column added successfully!');
        }
        db.close();
      });
    }
  });
});
