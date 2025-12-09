import db from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  // Create a new user
  static async create(name, email, password, role = 'student', governmentId) {
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const query = 'INSERT INTO users (name, email, password, government_id, role) VALUES (?, ?, ?, ?, ?)';

      const [result] = await db.execute(query, [name, email, hashedPassword, governmentId, role]);
      const userId = result.insertId;

      // Create initial user progress for students
      if (role === 'student') {
        await db.execute(
          'INSERT INTO user_progress (user_id, current_stage, initial_assessment_completed) VALUES (?, ?, ?)',
          [userId, 0, 0]
        );
      }

      return { id: userId, name, email, governmentId, role };
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = ?';
      const [rows] = await db.execute(query, [email]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by government ID
  static async findByGovernmentId(governmentId) {
    try {
      const query = 'SELECT * FROM users WHERE government_id = ?';
      const [rows] = await db.execute(query, [governmentId]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const query = 'SELECT id, name, email, government_id, role, created_at FROM users WHERE id = ?';
      const [rows] = await db.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all users (Admin only)
  static async getAll(role = null) {
    try {
      let query = 'SELECT id, name, email, government_id, role, created_at FROM users';
      const params = [];

      if (role) {
        query += ' WHERE role = ?';
        params.push(role);
      }

      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  static comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }

  // Update user
  static async update(id, updates) {
    try {
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
      const [result] = await db.execute(query, values);

      return { updated: result.affectedRows > 0 };
    } catch (error) {
      throw error;
    }
  }

  // Delete user
  static async delete(id) {
    try {
      const query = 'DELETE FROM users WHERE id = ?';
      const [result] = await db.execute(query, [id]);
      return { deleted: result.affectedRows > 0 };
    } catch (error) {
      throw error;
    }
  }
}

export default User;
