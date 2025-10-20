import Progress from '../models/Progress.js';
import Question from '../models/Question.js';
import Stage from '../models/Stage.js';

// Get user progress
export const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.role === 'student' ? req.user.id : req.params.userId;
    const progress = await Progress.getUserProgress(userId);

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    // Get stage results
    const stageResults = await Progress.getStageResults(userId);

    res.json({
      progress,
      stageResults
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Error fetching progress', error: error.message });
  }
};

// Submit initial assessment
export const submitInitialAssessment = async (req, res) => {
  try {
    const { answers } = req.body; // Array of {questionId, selectedAnswer}

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid answers format' });
    }

    // Verify answers
    const result = await Question.verifyAnswers(answers);

    // Update user progress with initial assessment
    const placementResult = await Progress.updateInitialAssessment(
      req.user.id,
      result.score,
      result.total
    );

    // Save as stage result for General Stage (stage 0)
    const generalStage = await Stage.getByStageNumber(0);
    if (generalStage) {
      const passed = result.percentage >= 60; // 60% passing score for initial assessment
      await Progress.saveStageResult(
        req.user.id,
        generalStage.id,
        result.score,
        result.total,
        passed
      );
    }

    res.json({
      message: 'Initial assessment completed',
      score: result.score,
      total: result.total,
      percentage: result.percentage,
      startingStage: placementResult.startingStage,
      results: result.results
    });
  } catch (error) {
    console.error('Submit initial assessment error:', error);
    res.status(500).json({ message: 'Error submitting assessment', error: error.message });
  }
};

// Submit stage assessment
export const submitStageAssessment = async (req, res) => {
  try {
    const { stageId, answers } = req.body;

    if (!stageId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    // Get stage info
    const stage = await Stage.getById(stageId);
    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    // Verify answers
    const result = await Question.verifyAnswers(answers);

    // Check if passed (60% passing score)
    const passingPercentage = (stage.passing_score / stage.total_questions) * 100;
    const passed = result.percentage >= passingPercentage;

    // Save stage result
    await Progress.saveStageResult(
      req.user.id,
      stageId,
      result.score,
      result.total,
      passed
    );

    res.json({
      message: passed ? 'Congratulations! You passed!' : 'Keep trying! You can retake the assessment.',
      score: result.score,
      total: result.total,
      percentage: result.percentage,
      passed,
      requiredPercentage: passingPercentage,
      results: result.results
    });
  } catch (error) {
    console.error('Submit stage assessment error:', error);
    res.status(500).json({ message: 'Error submitting assessment', error: error.message });
  }
};

// Mark video as completed
export const markVideoCompleted = async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ message: 'Video ID is required' });
    }

    await Progress.markVideoCompleted(req.user.id, videoId);

    res.json({ message: 'Video marked as completed' });
  } catch (error) {
    console.error('Mark video completed error:', error);
    res.status(500).json({ message: 'Error marking video as completed', error: error.message });
  }
};

// Get video progress
export const getVideoProgress = async (req, res) => {
  try {
    const { stageId } = req.query;
    const userId = req.user.role === 'student' ? req.user.id : req.params.userId;

    const videoProgress = await Progress.getVideoProgress(userId, stageId);

    res.json({ videoProgress });
  } catch (error) {
    console.error('Get video progress error:', error);
    res.status(500).json({ message: 'Error fetching video progress', error: error.message });
  }
};

export default {
  getUserProgress,
  submitInitialAssessment,
  submitStageAssessment,
  markVideoCompleted,
  getVideoProgress
};
