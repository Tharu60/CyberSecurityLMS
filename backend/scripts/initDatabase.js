import db from '../config/database.js';

console.log('Initializing database tables...');

// Wait for database initialization to complete
setTimeout(async () => {
  try {
    // Test connection
    const [rows] = await db.query('SHOW TABLES');
    console.log(`✓ Database initialized successfully with ${rows.length} tables`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}, 3000);
