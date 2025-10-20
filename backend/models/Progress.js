import db from '../config/database.js';

class Progress {
  // Get user progress
  static async getUserProgress(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT up.*,
               COUNT(DISTINCT sr.stage_id) as completed_stages,
               (SELECT COUNT(*) FROM stages WHERE stage_number > 0 AND stage_number < 5) as total_stages
        FROM user_progress up
        LEFT JOIN stage_results sr ON up.user_id = sr.user_id AND sr.passed = 1
        WHERE up.user_id = ?
        GROUP BY up.id
      `;

      db.get(query, [userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Update initial assessment
  static async updateInitialAssessment(userId, score, totalQuestions) {
    return new Promise((resolve, reject) => {
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

      db.run(query, [score, startingStage, userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ startingStage, score, percentage });
        }
      });
    });
  }

  // Save stage result
  static async saveStageResult(userId, stageId, score, totalQuestions, passed) {
    return new Promise((resolve, reject) => {
      // Get attempt number
      db.get(
        'SELECT COUNT(*) as attempts FROM stage_results WHERE user_id = ? AND stage_id = ?',
        [userId, stageId],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          const attemptNumber = (row.attempts || 0) + 1;

          const query = `
            INSERT INTO stage_results (user_id, stage_id, score, total_questions, passed, attempt_number)
            VALUES (?, ?, ?, ?, ?, ?)
          `;

          db.run(query, [userId, stageId, score, totalQuestions, passed ? 1 : 0, attemptNumber], function(insertErr) {
            if (insertErr) {
              reject(insertErr);
            } else {
              // If passed, update current stage
              if (passed) {
                db.run(
                  'UPDATE user_progress SET current_stage = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
                  [stageId, userId],
                  (updateErr) => {
                    if (updateErr) {
                      reject(updateErr);
                    } else {
                      resolve({ id: this.lastID, attemptNumber, passed });
                    }
                  }
                );
              } else {
                resolve({ id: this.lastID, attemptNumber, passed });
              }
            }
          });
        }
      );
    });
  }

  // Get stage results for a user
  static async getStageResults(userId, stageId = null) {
    return new Promise((resolve, reject) => {
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

      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Mark video as completed
  static async markVideoCompleted(userId, videoId) {
    return new Promise((resolve, reject) => {
      // Check if already exists
      db.get(
        'SELECT id FROM video_progress WHERE user_id = ? AND video_id = ?',
        [userId, videoId],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          if (row) {
            // Update existing
            db.run(
              'UPDATE video_progress SET completed = 1, last_watched_at = CURRENT_TIMESTAMP WHERE id = ?',
              [row.id],
              (updateErr) => {
                if (updateErr) reject(updateErr);
                else resolve({ updated: true });
              }
            );
          } else {
            // Insert new
            db.run(
              'INSERT INTO video_progress (user_id, video_id, completed) VALUES (?, ?, 1)',
              [userId, videoId],
              function(insertErr) {
                if (insertErr) reject(insertErr);
                else resolve({ id: this.lastID });
              }
            );
          }
        }
      );
    });
  }

  // Get video progress for user
  static async getVideoProgress(userId, stageId = null) {
    return new Promise((resolve, reject) => {
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

      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

export default Progress;
