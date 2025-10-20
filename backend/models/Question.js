import db from '../config/database.js';

class Question {
  // Get all questions for a stage
  static async getByStage(stageId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM questions WHERE stage_id = ? ORDER BY id';
      db.all(query, [stageId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Get random questions for assessment
  static async getRandomQuestions(stageId, limit) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM questions WHERE stage_id = ? ORDER BY RANDOM() LIMIT ?';
      db.all(query, [stageId, limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Don't send correct answers to frontend
          const questionsWithoutAnswers = rows.map(q => ({
            id: q.id,
            question_text: q.question_text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d
          }));
          resolve({ questions: questionsWithoutAnswers, answers: rows });
        }
      });
    });
  }

  // Create question
  static async create(stageId, questionText, optionA, optionB, optionC, optionD, correctAnswer) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO questions (stage_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(
        query,
        [stageId, questionText, optionA, optionB, optionC, optionD, correctAnswer],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID });
          }
        }
      );
    });
  }

  // Bulk create questions
  static async bulkCreate(questions) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO questions (stage_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      db.serialize(() => {
        const stmt = db.prepare(query);
        let insertedCount = 0;

        questions.forEach((q) => {
          stmt.run(
            [q.stageId, q.questionText, q.optionA, q.optionB, q.optionC, q.optionD, q.correctAnswer],
            (err) => {
              if (err) {
                console.error('Error inserting question:', err);
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

  // Update question
  static async update(id, updates) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      if (updates.questionText) {
        fields.push('question_text = ?');
        values.push(updates.questionText);
      }
      if (updates.optionA) {
        fields.push('option_a = ?');
        values.push(updates.optionA);
      }
      if (updates.optionB) {
        fields.push('option_b = ?');
        values.push(updates.optionB);
      }
      if (updates.optionC) {
        fields.push('option_c = ?');
        values.push(updates.optionC);
      }
      if (updates.optionD) {
        fields.push('option_d = ?');
        values.push(updates.optionD);
      }
      if (updates.correctAnswer) {
        fields.push('correct_answer = ?');
        values.push(updates.correctAnswer);
      }

      values.push(id);

      const query = `UPDATE questions SET ${fields.join(', ')} WHERE id = ?`;

      db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ updated: this.changes > 0 });
        }
      });
    });
  }

  // Delete question
  static async delete(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM questions WHERE id = ?';
      db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deleted: this.changes > 0 });
        }
      });
    });
  }

  // Verify answers
  static async verifyAnswers(answersArray) {
    return new Promise((resolve, reject) => {
      const ids = answersArray.map(a => a.questionId);
      const placeholders = ids.map(() => '?').join(',');
      const query = `SELECT id, correct_answer FROM questions WHERE id IN (${placeholders})`;

      db.all(query, ids, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          let correctCount = 0;
          const results = answersArray.map(answer => {
            const question = rows.find(q => q.id === answer.questionId);
            const isCorrect = question && question.correct_answer === answer.selectedAnswer;
            if (isCorrect) correctCount++;
            return {
              questionId: answer.questionId,
              selectedAnswer: answer.selectedAnswer,
              correctAnswer: question?.correct_answer,
              isCorrect
            };
          });

          resolve({
            score: correctCount,
            total: answersArray.length,
            percentage: (correctCount / answersArray.length) * 100,
            results
          });
        }
      });
    });
  }
}

export default Question;
