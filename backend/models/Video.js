import db from '../config/database.js';

class Video {
  // Get all videos for a stage
  static async getByStage(stageId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM videos WHERE stage_id = ? ORDER BY order_number, id';
      db.all(query, [stageId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Get video by ID
  static async getById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM videos WHERE id = ?';
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Create video
  static async create(stageId, title, url, description = '', orderNumber = null) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO videos (stage_id, title, url, description, order_number)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.run(query, [stageId, title, url, description, orderNumber], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, stageId, title, url });
        }
      });
    });
  }

  // Bulk create videos
  static async bulkCreate(videos) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO videos (stage_id, title, url, description, order_number)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.serialize(() => {
        const stmt = db.prepare(query);
        let insertedCount = 0;

        videos.forEach((v) => {
          stmt.run(
            [v.stageId, v.title, v.url, v.description || '', v.orderNumber || null],
            (err) => {
              if (err) {
                console.error('Error inserting video:', err);
              } else {
                insertedCount++;
              }
            }
          );
        });

        stmt.finalize((err) => {
          if (err) {
            reject(err);
          } else {
            resolve({ inserted: insertedCount });
          }
        });
      });
    });
  }

  // Update video
  static async update(id, updates) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      if (updates.title) {
        fields.push('title = ?');
        values.push(updates.title);
      }
      if (updates.url) {
        fields.push('url = ?');
        values.push(updates.url);
      }
      if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description);
      }
      if (updates.orderNumber !== undefined) {
        fields.push('order_number = ?');
        values.push(updates.orderNumber);
      }

      values.push(id);

      const query = `UPDATE videos SET ${fields.join(', ')} WHERE id = ?`;

      db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ updated: this.changes > 0 });
        }
      });
    });
  }

  // Delete video
  static async delete(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM videos WHERE id = ?';
      db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deleted: this.changes > 0 });
        }
      });
    });
  }

  // Get all videos
  static async getAll() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM videos ORDER BY stage_id, order_number, id';
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

export default Video;
