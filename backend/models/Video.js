import db from '../config/database.js';

class Video {
  // Get all videos for a stage
  static async getByStage(stageId) {
    try {
      const query = 'SELECT * FROM videos WHERE stage_id = ? ORDER BY order_number, id';
      const [rows] = await db.execute(query, [stageId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get video by ID
  static async getById(id) {
    try {
      const query = 'SELECT * FROM videos WHERE id = ?';
      const [rows] = await db.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Create video
  static async create(stageId, title, url, description = '', orderNumber = null) {
    try {
      const query = `
        INSERT INTO videos (stage_id, title, url, description, order_number)
        VALUES (?, ?, ?, ?, ?)
      `;

      const [result] = await db.execute(query, [stageId, title, url, description, orderNumber]);

      return { id: result.insertId, stageId, title, url };
    } catch (error) {
      throw error;
    }
  }

  // Bulk create videos
  static async bulkCreate(videos) {
    try {
      const query = `
        INSERT INTO videos (stage_id, title, url, description, order_number)
        VALUES (?, ?, ?, ?, ?)
      `;

      let insertedCount = 0;
      for (const v of videos) {
        await db.execute(
          query,
          [v.stageId, v.title, v.url, v.description || '', v.orderNumber || null]
        );
        insertedCount++;
      }

      return { inserted: insertedCount };
    } catch (error) {
      throw error;
    }
  }

  // Update video
  static async update(id, updates) {
    try {
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
      const [result] = await db.execute(query, values);

      return { updated: result.affectedRows > 0 };
    } catch (error) {
      throw error;
    }
  }

  // Delete video
  static async delete(id) {
    try {
      const query = 'DELETE FROM videos WHERE id = ?';
      const [result] = await db.execute(query, [id]);
      return { deleted: result.affectedRows > 0 };
    } catch (error) {
      throw error;
    }
  }

  // Get all videos
  static async getAll() {
    try {
      const query = 'SELECT * FROM videos ORDER BY stage_id, order_number, id';
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

export default Video;
