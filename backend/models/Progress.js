import db from '../config/database.js';

class Progress {
  // Get user progress
  static async getUserProgress(userId) {
    try {
      const query = `
        SELECT up.*,
               COUNT(DISTINCT sr.stage_id) as completed_stages,
               (SELECT COUNT(*) FROM stages WHERE stage_number > 0 AND stage_number < 5) as total_stages
        FROM user_progress up
        LEFT JOIN stage_results sr ON up.user_id = sr.user_id AND sr.passed = 1
        WHERE up.user_id = ?
        GROUP BY up.id
      `;

      const [rows] = await db.execute(query, [userId]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Update initial assessment
  static async updateInitialAssessment(userId, score, totalQuestions) {
    try {
      // Determine starting stage based on score percentage
      const percentage = (score / totalQuestions) * 100;
      let startingStage = 1;

      if (percentage >= 75) {
        startingStage = 4;
      } else if (percentage >= 50) {
        startingStage = 3;
      } else if (percentage >= 25) {
        startingStage = 2;
      }

      const query = `
        UPDATE user_progress
        SET initial_assessment_completed = 1,
            initial_assessment_score = ?,
            current_stage = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `;

      await db.execute(query, [score, startingStage, userId]);

      return { startingStage, score, percentage };
    } catch (error) {
      throw error;
    }
  }

  // Save stage result
  static async saveStageResult(userId, stageId, score, totalQuestions, passed) {
    try {
      // Get attempt number
      const [countRows] = await db.execute(
        'SELECT COUNT(*) as attempts FROM stage_results WHERE user_id = ? AND stage_id = ?',
        [userId, stageId]
      );

      const attemptNumber = (countRows[0].attempts || 0) + 1;

      const query = `
        INSERT INTO stage_results (user_id, stage_id, score, total_questions, passed, attempt_number)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.execute(query, [userId, stageId, score, totalQuestions, passed ? 1 : 0, attemptNumber]);
      const resultId = result.insertId;

      // If passed, update current stage
      if (passed) {
        await db.execute(
          'UPDATE user_progress SET current_stage = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
          [stageId, userId]
        );
      }

      return { id: resultId, attemptNumber, passed };
    } catch (error) {
      throw error;
    }
  }

  // Get stage results for a user
  static async getStageResults(userId, stageId = null) {
    try {
      let query = `
        SELECT sr.*, s.name as stage_name, s.stage_number
        FROM stage_results sr
        JOIN stages s ON sr.stage_id = s.id
        WHERE sr.user_id = ?
      `;
      const params = [userId];

      if (stageId) {
        query += ' AND sr.stage_id = ?';
        params.push(stageId);
      }

      query += ' ORDER BY sr.completed_at DESC';

      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Mark video as completed
  static async markVideoCompleted(userId, videoId) {
    try {
      // Check if already exists
      const [existingRows] = await db.execute(
        'SELECT id FROM video_progress WHERE user_id = ? AND video_id = ?',
        [userId, videoId]
      );

      if (existingRows.length > 0) {
        // Update existing
        await db.execute(
          'UPDATE video_progress SET completed = 1, last_watched_at = CURRENT_TIMESTAMP WHERE id = ?',
          [existingRows[0].id]
        );
        return { updated: true };
      } else {
        // Insert new
        const [result] = await db.execute(
          'INSERT INTO video_progress (user_id, video_id, completed) VALUES (?, ?, 1)',
          [userId, videoId]
        );
        return { id: result.insertId };
      }
    } catch (error) {
      throw error;
    }
  }

  // Get video progress for user
  static async getVideoProgress(userId, stageId = null) {
    try {
      let query = `
        SELECT vp.*, v.title, v.stage_id
        FROM video_progress vp
        JOIN videos v ON vp.video_id = v.id
        WHERE vp.user_id = ?
      `;
      const params = [userId];

      if (stageId) {
        query += ' AND v.stage_id = ?';
        params.push(stageId);
      }

      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

export default Progress;
