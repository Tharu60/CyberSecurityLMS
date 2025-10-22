import db from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  // Create a new user
  static async create(name, email, password, role = 'student', governmentId) {
    return new Promise((resolve, reject) => {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const query = 'INSERT INTO users (name, email, password, government_id, role) VALUES (?, ?, ?, ?, ?)';

      db.run(query, [name, email, hashedPassword, governmentId, role], function(err) {
        if (err) {
          reject(err);
        } else {
          // Create initial user progress for students
          if (role === 'student') {
            db.run(
              'INSERT INTO user_progress (user_id, current_stage, initial_assessment_completed) VALUES (?, ?, ?)',
              [this.lastID, 0, 0],
              (progressErr) => {
                if (progressErr) {
                  reject(progressErr);
                } else {
                  resolve({ id: this.lastID, name, email, governmentId, role });
                }
              }
            );
          } else {
            resolve({ id: this.lastID, name, email, governmentId, role });
          }
        }
      });
    });
  }

  // Find user by email
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?';
      db.get(query, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Find user by government ID
  static async findByGovernmentId(governmentId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE government_id = ?';
      db.get(query, [governmentId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Find user by ID
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id, name, email, government_id, role, created_at FROM users WHERE id = ?';
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Get all users (Admin only)
  static async getAll(role = null) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT id, name, email, government_id, role, created_at FROM users';
      const params = [];

      if (role) {
        query += ' WHERE role = ?';
        params.push(role);
      }

      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Verify password
  static comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }

  // Update user
  static async update(id, updates) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      if (updates.name) {
        fields.push('name = ?');
        values.push(updates.name);
      }
      if (updates.email) {
        fields.push('email = ?');
        values.push(updates.email);
      }
      if (updates.password) {
        fields.push('password = ?');
        values.push(bcrypt.hashSync(updates.password, 10));
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

      db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ updated: this.changes > 0 });
        }
      });
    });
  }

  // Delete user
  static async delete(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM users WHERE id = ?';
      db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deleted: this.changes > 0 });
        }
      });
    });
  }
}

export default User;
