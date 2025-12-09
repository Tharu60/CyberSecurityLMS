import db from '../config/database.js';

class Question {
  // Get all questions for a stage
  static async getByStage(stageId) {
    try {
      const query = 'SELECT * FROM questions WHERE stage_id = ? ORDER BY id';
      const [rows] = await db.execute(query, [stageId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get random questions for assessment
  static async getRandomQuestions(stageId, limit) {
    try {
      // MySQL doesn't support placeholders for LIMIT in prepared statements
      const query = `SELECT * FROM questions WHERE stage_id = ? ORDER BY RAND() LIMIT ${parseInt(limit)}`;
      const [rows] = await db.execute(query, [stageId]);

      // Don't send correct answers to frontend
      const questionsWithoutAnswers = rows.map(q => ({
        id: q.id,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d
      }));

      return { questions: questionsWithoutAnswers, answers: rows };
    } catch (error) {
      throw error;
    }
  }

  // Create question
  static async create(stageId, questionText, optionA, optionB, optionC, optionD, correctAnswer) {
    try {
      const query = `
        INSERT INTO questions (stage_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.execute(
        query,
        [stageId, questionText, optionA, optionB, optionC, optionD, correctAnswer]
      );

      return { id: result.insertId };
    } catch (error) {
      throw error;
    }
  }

  // Bulk create questions
  static async bulkCreate(questions) {
    try {
      const query = `
        INSERT INTO questions (stage_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      let insertedCount = 0;
      for (const q of questions) {
        await db.execute(
          query,
          [q.stageId, q.questionText, q.optionA, q.optionB, q.optionC, q.optionD, q.correctAnswer]
        );
        insertedCount++;
      }

      return { inserted: insertedCount };
    } catch (error) {
      throw error;
    }
  }

  // Update question
  static async update(id, updates) {
    try {
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
      const [result] = await db.execute(query, values);

      return { updated: result.affectedRows > 0 };
    } catch (error) {
      throw error;
    }
  }

  // Delete question
  static async delete(id) {
    try {
      const query = 'DELETE FROM questions WHERE id = ?';
      const [result] = await db.execute(query, [id]);
      return { deleted: result.affectedRows > 0 };
    } catch (error) {
      throw error;
    }
  }

  // Verify answers
  static async verifyAnswers(answersArray) {
    try {
      const ids = answersArray.map(a => a.questionId);
      const placeholders = ids.map(() => '?').join(',');
      const query = `SELECT id, correct_answer FROM questions WHERE id IN (${placeholders})`;

      const [rows] = await db.execute(query, ids);

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

      return {
        score: correctCount,
        total: answersArray.length,
        percentage: (correctCount / answersArray.length) * 100,
        results
      };
    } catch (error) {
      throw error;
    }
  }
}

export default Question;
