import User from '../models/User.js';

async function createDefaultUsers() {
  try {
    console.log('Creating default users...\n');

    // Create Admin User
    const admin = await User.create(
      'Admin User',
      'admin@lms.com',
      'admin123',
      'admin'
    );
    console.log('✓ Admin User created:');
    console.log('  Email: admin@lms.com');
    console.log('  Password: admin123\n');

    // Create Instructor User
    const instructor = await User.create(
      'John Instructor',
      'instructor@lms.com',
      'instructor123',
      'instructor'
    );
    console.log('✓ Instructor User created:');
    console.log('  Email: instructor@lms.com');
    console.log('  Password: instructor123\n');

    // Create Student User
    const student = await User.create(
      'Jane Student',
      'student@lms.com',
      'student123',
      'student'
    );
    console.log('✓ Student User created:');
    console.log('  Email: student@lms.com');
    console.log('  Password: student123\n');

    console.log(`
╔═══════════════════════════════════════════════════════════╗
║          Default Users Created Successfully! ✓            ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ADMIN LOGIN:                                             ║
║    Email: admin@lms.com                                   ║
║    Password: admin123                                     ║
║                                                           ║
║  INSTRUCTOR LOGIN:                                        ║
║    Email: instructor@lms.com                              ║
║    Password: instructor123                                ║
║                                                           ║
║  STUDENT LOGIN:                                           ║
║    Email: student@lms.com                                 ║
║    Password: student123                                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);

    process.exit(0);
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      console.log('\n⚠ Users already exist! Use these credentials:\n');
      console.log('ADMIN:');
      console.log('  Email: admin@lms.com');
      console.log('  Password: admin123\n');
      console.log('INSTRUCTOR:');
      console.log('  Email: instructor@lms.com');
      console.log('  Password: instructor123\n');
      console.log('STUDENT:');
      console.log('  Email: student@lms.com');
      console.log('  Password: student123\n');
      process.exit(0);
    } else {
      console.error('Error creating users:', error);
      process.exit(1);
    }
  }
}

createDefaultUsers();
