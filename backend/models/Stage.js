import db from '../config/database.js';

class Stage {
  // Get all stages
  static async getAll() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM stages ORDER BY stage_number';
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Get stage by ID
  static async getById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM stages WHERE id = ?';
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Get stage by stage number
  static async getByStageNumber(stageNumber) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM stages WHERE stage_number = ?';
      db.get(query, [stageNumber], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Create stage
  static async create(name, description, stageNumber, totalQuestions, passingScore) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO stages (name, description, stage_number, total_questions, passing_score)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.run(query, [name, description, stageNumber, totalQuestions, passingScore], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, name, description, stageNumber, totalQuestions, passingScore });
        }
      });
    });
  }

  // Update stage
  static async update(id, updates) {
    return new Promise((resolve, reject) => {
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

      db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ updated: this.changes > 0 });
        }
      });
    });
  }

  // Delete stage
  static async delete(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM stages WHERE id = ?';
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

export default Stage;
