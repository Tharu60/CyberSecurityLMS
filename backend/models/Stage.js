import db from '../config/database.js';

class Stage {
  // Get all stages
  static async getAll() {
    try {
      const query = 'SELECT * FROM stages ORDER BY stage_number';
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get stage by ID
  static async getById(id) {
    try {
      const query = 'SELECT * FROM stages WHERE id = ?';
      const [rows] = await db.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get stage by stage number
  static async getByStageNumber(stageNumber) {
    try {
      const query = 'SELECT * FROM stages WHERE stage_number = ?';
      const [rows] = await db.execute(query, [stageNumber]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Create stage
  static async create(name, description, stageNumber, totalQuestions, passingScore) {
    try {
      const query = `
        INSERT INTO stages (name, description, stage_number, total_questions, passing_score)
        VALUES (?, ?, ?, ?, ?)
      `;

      const [result] = await db.execute(query, [name, description, stageNumber, totalQuestions, passingScore]);

      return { id: result.insertId, name, description, stageNumber, totalQuestions, passingScore };
    } catch (error) {
      throw error;
    }
  }

  // Update stage
  static async update(id, updates) {
    try {
      const fields = [];
      const values = [];

      if (updates.name) {
        fields.push('name = ?');
        values.push(updates.name);
      }
      if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description);
      }
      if (updates.totalQuestions) {
        fields.push('total_questions = ?');
        values.push(updates.totalQuestions);
      }
      if (updates.passingScore) {
        fields.push('passing_score = ?');
        values.push(updates.passingScore);
      }

      values.push(id);

      const query = `UPDATE stages SET ${fields.join(', ')} WHERE id = ?`;
      const [result] = await db.execute(query, values);

      return { updated: result.affectedRows > 0 };
    } catch (error) {
      throw error;
    }
  }

  // Delete stage
  static async delete(id) {
    try {
      const query = 'DELETE FROM stages WHERE id = ?';
      const [result] = await db.execute(query, [id]);
      return { deleted: result.affectedRows > 0 };
    } catch (error) {
      throw error;
    }
  }
}

export default Stage;
