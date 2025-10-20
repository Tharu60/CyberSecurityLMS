import User from '../models/User.js';
import Progress from '../models/Progress.js';
import Stage from '../models/Stage.js';
import db from '../config/database.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const users = await User.getAll(role);

    res.json({ users, count: users.length });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get user by ID with progress
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get progress if student
    let progress = null;
    let stageResults = null;

    if (user.role === 'student') {
      progress = await Progress.getUserProgress(id);
      stageResults = await Progress.getStageResults(id);
    }

    res.json({
      user,
      progress,
      stageResults
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.delete(id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Get platform statistics
export const getStatistics = async (req, res) => {
  try {
    const stats = await new Promise((resolve, reject) => {
      db.serialize(() => {
        const results = {};

        // Total users by role
        db.get(
          `SELECT
             COUNT(*) as total_users,
             SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as total_students,
             SUM(CASE WHEN role = 'instructor' THEN 1 ELSE 0 END) as total_instructors,
             SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as total_admins
           FROM users`,
          (err, row) => {
            if (err) {
              reject(err);
              return;
            }
            results.users = row;

            // Total stages and questions
            db.get(
              `SELECT COUNT(*) as total_stages FROM stages`,
              (err2, row2) => {
                if (err2) {
                  reject(err2);
                  return;
                }
                results.stages = row2;

                // Total questions
                db.get(
                  `SELECT COUNT(*) as total_questions FROM questions`,
                  (err3, row3) => {
                    if (err3) {
                      reject(err3);
                      return;
                    }
                    results.questions = row3;

                    // Total videos
                    db.get(
                      `SELECT COUNT(*) as total_videos FROM videos`,
                      (err4, row4) => {
                        if (err4) {
                          reject(err4);
                          return;
                        }
                        results.videos = row4;

                        // Completion statistics
                        db.get(
                          `SELECT
                             COUNT(DISTINCT user_id) as students_who_started,
                             SUM(CASE WHEN initial_assessment_completed = 1 THEN 1 ELSE 0 END) as completed_initial_assessment
                           FROM user_progress`,
                          (err5, row5) => {
                            if (err5) {
                              reject(err5);
                              return;
                            }
                            results.progress = row5;

                            // Total stage completions
                            db.get(
                              `SELECT COUNT(*) as total_stage_completions FROM stage_results WHERE passed = 1`,
                              (err6, row6) => {
                                if (err6) {
                                  reject(err6);
                                  return;
                                }
                                results.completions = row6;
                                resolve(results);
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });
    });

    res.json({ statistics: stats });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
};

// Get student analytics
export const getStudentAnalytics = async (req, res) => {
  try {
    const analytics = await new Promise((resolve, reject) => {
      // Get stage completion rates
      db.all(
        `SELECT
           s.id,
           s.name,
           s.stage_number,
           COUNT(DISTINCT sr.user_id) as students_completed
         FROM stages s
         LEFT JOIN stage_results sr ON s.id = sr.stage_id AND sr.passed = 1
         WHERE s.stage_number > 0
         GROUP BY s.id
         ORDER BY s.stage_number`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });

    res.json({ analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

export default {
  getAllUsers,
  getUserById,
  deleteUser,
  getStatistics,
  getStudentAnalytics
};
