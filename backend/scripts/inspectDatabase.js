import db from '../config/database.js';

console.log(`
╔═══════════════════════════════════════════╗
║     DATABASE INSPECTION REPORT            ║
╚═══════════════════════════════════════════╝
`);

// Users by role
db.all('SELECT role, COUNT(*) as count FROM users GROUP BY role', (err, rows) => {
  if (!err) {
    console.log('👥 USERS BY ROLE:');
    rows.forEach(row => {
      const icon = row.role === 'admin' ? '🛡️' : row.role === 'instructor' ? '👨‍🏫' : '🎓';
      console.log(`   ${icon} ${row.role.padEnd(12)}: ${row.count}`);
    });
    console.log('');
  }
});

// All users list
db.all('SELECT id, name, email, role FROM users ORDER BY role, id', (err, users) => {
  if (!err && users.length > 0) {
    console.log('📋 ALL USERS:');
    users.forEach(user => {
      console.log(`   ${user.id}. ${user.name.padEnd(20)} | ${user.email.padEnd(25)} | ${user.role}`);
    });
    console.log('');
  }
});

// Tables count
const tables = [
  { name: 'stages', icon: '📚' },
  { name: 'questions', icon: '❓' },
  { name: 'videos', icon: '🎥' },
  { name: 'certificates', icon: '🎓' },
  { name: 'user_progress', icon: '📊' },
  { name: 'stage_results', icon: '📝' },
  { name: 'video_progress', icon: '✅' }
];

setTimeout(() => {
  console.log('📊 TABLE STATISTICS:');

  const promises = tables.map(table => {
    return new Promise((resolve) => {
      db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, row) => {
        if (!err) {
          console.log(`   ${table.icon} ${table.name.padEnd(20)}: ${row.count} records`);
        }
        resolve();
      });
    });
  });

  Promise.all(promises).then(() => {
    // Questions per stage
    setTimeout(() => {
      console.log('\n❓ QUESTIONS PER STAGE:');
      db.all(`
        SELECT s.name as stage_name, COUNT(q.id) as count
        FROM stages s
        LEFT JOIN questions q ON s.id = q.stage_id
        GROUP BY s.id
        ORDER BY s.stage_number
      `, (err, rows) => {
        if (!err) {
          rows.forEach(row => {
            console.log(`   ${row.stage_name.padEnd(25)}: ${row.count} questions`);
          });
        }

        // Student progress summary
        setTimeout(() => {
          console.log('\n🎯 STUDENT PROGRESS:');
          db.all(`
            SELECT
              u.name,
              CASE WHEN p.initial_assessment_completed = 1 THEN 'Yes' ELSE 'No' END as assessment,
              COALESCE(p.current_stage, 0) as current_stage,
              COALESCE(p.completed_stages, 0) as completed,
              COALESCE(ROUND(p.average_score, 1), 0) as avg_score
            FROM users u
            LEFT JOIN user_progress p ON u.id = p.user_id
            WHERE u.role = 'student'
          `, (err, rows) => {
            if (!err) {
              if (rows.length > 0) {
                rows.forEach(row => {
                  console.log(`   ${row.name.padEnd(20)} | Assessment: ${row.assessment} | Stage: ${row.current_stage} | Completed: ${row.completed}/5 | Avg: ${row.avg_score}%`);
                });
              } else {
                console.log('   No students found or no progress data yet');
              }
            }

            // Certificates
            setTimeout(() => {
              console.log('\n🎓 CERTIFICATES ISSUED:');
              db.all(`
                SELECT u.name, c.certificate_code, c.issued_at
                FROM certificates c
                JOIN users u ON c.user_id = u.id
                ORDER BY c.issued_at DESC
              `, (err, rows) => {
                if (!err) {
                  if (rows.length > 0) {
                    rows.forEach(row => {
                      const date = new Date(row.issued_at).toLocaleDateString();
                      console.log(`   ${row.name.padEnd(20)} | Code: ${row.certificate_code} | ${date}`);
                    });
                  } else {
                    console.log('   No certificates issued yet');
                  }
                }

                // Database file info
                setTimeout(() => {
                  console.log(`
╔═══════════════════════════════════════════╗
║     INSPECTION COMPLETE ✓                 ║
╚═══════════════════════════════════════════╝

💡 Pro Tips:
   - Use DB Browser for SQLite for visual inspection
   - See DATABASE_COMMANDS.md for more SQL queries
   - Run 'npm run seed' to reset database
   - Run 'node scripts/createDefaultUsers.js' to add test users

📁 Database Location: backend/lms.db
`);
                  process.exit(0);
                }, 300);
              });
            }, 300);
          });
        }, 300);
      });
    }, 300);
  });
}, 500);
