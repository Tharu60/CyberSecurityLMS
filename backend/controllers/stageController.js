import Stage from '../models/Stage.js';
import Question from '../models/Question.js';
import Video from '../models/Video.js';
import Progress from '../models/Progress.js';

// Get all stages
export const getAllStages = async (req, res) => {
  try {
    const stages = await Stage.getAll();

    // If student, include progress information
    if (req.user.role === 'student') {
      const progress = await Progress.getUserProgress(req.user.id);
      const stageResults = await Progress.getStageResults(req.user.id);

      const stagesWithProgress = stages.map(stage => {
        const result = stageResults.find(r => r.stage_id === stage.id && r.passed);
        return {
          ...stage,
          unlocked: stage.stage_number <= progress.current_stage || stage.stage_number === 0,
          completed: !!result
        };
      });

      return res.json({ stages: stagesWithProgress });
    }

    res.json({ stages });
  } catch (error) {
    console.error('Get all stages error:', error);
    res.status(500).json({ message: 'Error fetching stages', error: error.message });
  }
};

// Get stage by ID with questions and videos
export const getStageById = async (req, res) => {
  try {
    const { id } = req.params;
    const stage = await Stage.getById(id);

    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    // Get videos for this stage
    const videos = await Video.getByStage(id);

    // Get question count (don't send actual questions)
    const questions = await Question.getByStage(id);
    const questionCount = questions.length;

    res.json({
      stage,
      videos,
      questionCount
    });
  } catch (error) {
    console.error('Get stage error:', error);
    res.status(500).json({ message: 'Error fetching stage', error: error.message });
  }
};

// Get questions for stage assessment
export const getStageQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const stage = await Stage.getById(id);

    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    // For students, check if stage is unlocked
    if (req.user.role === 'student') {
      const progress = await Progress.getUserProgress(req.user.id);

      // Check if this is the initial assessment (stage 0)
      if (stage.stage_number === 0 && progress.initial_assessment_completed) {
        return res.status(400).json({ message: 'Initial assessment already completed' });
      }

      // Check if stage is unlocked
      if (stage.stage_number > 0 && stage.stage_number > progress.current_stage) {
        return res.status(403).json({ message: 'This stage is locked. Complete previous stages first.' });
      }
    }

    // Get random questions for assessment
    const { questions } = await Question.getRandomQuestions(id, stage.total_questions);

    res.json({
      stage: {
        id: stage.id,
        name: stage.name,
        description: stage.description,
        totalQuestions: stage.total_questions,
        passingScore: stage.passing_score
      },
      questions
    });
  } catch (error) {
    console.error('Get stage questions error:', error);
    res.status(500).json({ message: 'Error fetching questions', error: error.message });
  }
};

// Create stage (Instructor/Admin only)
export const createStage = async (req, res) => {
  try {
    const { name, description, stageNumber, totalQuestions, passingScore } = req.body;

    if (!name || stageNumber === undefined || !totalQuestions || !passingScore) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const stage = await Stage.create(name, description, stageNumber, totalQuestions, passingScore);

    res.status(201).json({ message: 'Stage created successfully', stage });
  } catch (error) {
    console.error('Create stage error:', error);
    res.status(500).json({ message: 'Error creating stage', error: error.message });
  }
};

// Update stage (Instructor/Admin only)
export const updateStage = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    await Stage.update(id, updates);

    res.json({ message: 'Stage updated successfully' });
  } catch (error) {
    console.error('Update stage error:', error);
    res.status(500).json({ message: 'Error updating stage', error: error.message });
  }
};

// Delete stage (Admin only)
export const deleteStage = async (req, res) => {
  try {
    const { id } = req.params;

    await Stage.delete(id);

    res.json({ message: 'Stage deleted successfully' });
  } catch (error) {
    console.error('Delete stage error:', error);
    res.status(500).json({ message: 'Error deleting stage', error: error.message });
  }
};

export default {
  getAllStages,
  getStageById,
  getStageQuestions,
  createStage,
  updateStage,
  deleteStage
};
