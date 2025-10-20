import Question from '../models/Question.js';

// Get questions for a stage (Instructor/Admin only)
export const getQuestionsByStage = async (req, res) => {
  try {
    const { stageId } = req.params;
    const questions = await Question.getByStage(stageId);

    res.json({ questions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Error fetching questions', error: error.message });
  }
};

// Create question (Instructor/Admin only)
export const createQuestion = async (req, res) => {
  try {
    const { stageId, questionText, optionA, optionB, optionC, optionD, correctAnswer } = req.body;

    if (!stageId || !questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
      return res.status(400).json({ message: 'Correct answer must be A, B, C, or D' });
    }

    const question = await Question.create(
      stageId,
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer
    );

    res.status(201).json({ message: 'Question created successfully', question });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Error creating question', error: error.message });
  }
};

// Update question (Instructor/Admin only)
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.correctAnswer && !['A', 'B', 'C', 'D'].includes(updates.correctAnswer)) {
      return res.status(400).json({ message: 'Correct answer must be A, B, C, or D' });
    }

    await Question.update(id, updates);

    res.json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Error updating question', error: error.message });
  }
};

// Delete question (Instructor/Admin only)
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    await Question.delete(id);

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Error deleting question', error: error.message });
  }
};

export default {
  getQuestionsByStage,
  createQuestion,
  updateQuestion,
  deleteQuestion
};
