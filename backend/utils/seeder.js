import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Stage from '../models/Stage.js';
import Question from '../models/Question.js';
import Video from '../models/Video.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse QUESTION.txt file
function parseQuestions(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const stages = {
    general: [],
    stage1: [],
    stage2: [],
    stage3: [],
    stage4: [],
    final: []
  };

  let currentStage = null;
  let currentQuestion = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect stage headers
    if (line.includes('GENERAL STAGE')) {
      currentStage = 'general';
      continue;
    } else if (line.includes('STAGE 1')) {
      currentStage = 'stage1';
      continue;
    } else if (line.includes('STAGE 2')) {
      currentStage = 'stage2';
      continue;
    } else if (line.includes('STAGE 3')) {
      currentStage = 'stage3';
      continue;
    } else if (line.includes('STAGE 4')) {
      currentStage = 'stage4';
      continue;
    } else if (line.includes('FINAL STAGE')) {
      currentStage = 'final';
      continue;
    }

    // Skip empty lines and dividers
    if (!line || line.startsWith('=') || line.startsWith('-') || line.includes('STRUCTURE')) {
      continue;
    }

    // Detect question start (number followed by period)
    if (/^\d+\.\s/.test(line) && currentStage) {
      if (currentQuestion) {
        stages[currentStage].push(currentQuestion);
      }
      currentQuestion = {
        questionText: line.replace(/^\d+\.\s/, ''),
        options: {},
        correctAnswer: null
      };
    }
    // Detect options
    else if (/^[A-D]\)\s/.test(line) && currentQuestion) {
      const option = line.charAt(0);
      const text = line.substring(3);
      currentQuestion.options[option] = text;
    }
    // Detect answer
    else if (line.startsWith('Answer:') && currentQuestion) {
      currentQuestion.correctAnswer = line.replace('Answer:', '').trim();
      stages[currentStage].push(currentQuestion);
      currentQuestion = null;
    }
  }

  return stages;
}

// Parse Video.txt file
function parseVideos(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const videos = {
    stage1: [],
    stage2: [],
    stage3: [],
    stage4: []
  };

  let currentStage = null;
  let currentVideo = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect stage
    if (line.includes('Stage 1:')) {
      currentStage = 'stage1';
      continue;
    } else if (line.includes('Stage 2:')) {
      currentStage = 'stage2';
      continue;
    } else if (line.includes('Stage 3:')) {
      currentStage = 'stage3';
      continue;
    } else if (line.includes('Stage 4:')) {
      currentStage = 'stage4';
      continue;
    }

    // Parse video data
    if (line.startsWith('Title:')) {
      currentVideo.title = line.replace('Title:', '').trim();
    } else if (line.startsWith('Link:')) {
      currentVideo.url = line.replace('Link:', '').trim();
      if (currentStage && currentVideo.title && currentVideo.url) {
        videos[currentStage].push({ ...currentVideo });
        currentVideo = {};
      }
    }
  }

  return videos;
}

// Seed database
export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Create stages
    console.log('Creating stages...');
    const stageData = [
      { name: 'General Stage', description: 'Initial assessment to determine your starting level', stageNumber: 0, totalQuestions: 25, passingScore: 15 },
      { name: 'Stage 1: Cybersecurity Basics', description: 'Learn fundamental cybersecurity concepts', stageNumber: 1, totalQuestions: 15, passingScore: 9 },
      { name: 'Stage 2: Intermediate Concepts', description: 'Build on your cybersecurity knowledge', stageNumber: 2, totalQuestions: 15, passingScore: 9 },
      { name: 'Stage 3: Advanced Topics', description: 'Master advanced cybersecurity techniques', stageNumber: 3, totalQuestions: 15, passingScore: 9 },
      { name: 'Stage 4: Expert-Level Strategies', description: 'Become a cybersecurity expert', stageNumber: 4, totalQuestions: 15, passingScore: 9 },
      { name: 'Final Stage', description: 'Comprehensive final assessment', stageNumber: 5, totalQuestions: 25, passingScore: 15 }
    ];

    const createdStages = {};
    for (const sd of stageData) {
      const stage = await Stage.create(sd.name, sd.description, sd.stageNumber, sd.totalQuestions, sd.passingScore);
      createdStages[sd.stageNumber] = stage.id;
      console.log(`✓ Created stage: ${sd.name}`);
    }

    // Parse and import questions
    console.log('\nImporting questions...');
    const questionFile = path.join(__dirname, '..', '..', 'QUESTION.txt');
    const parsedQuestions = parseQuestions(questionFile);

    const stageMapping = {
      general: createdStages[0],
      stage1: createdStages[1],
      stage2: createdStages[2],
      stage3: createdStages[3],
      stage4: createdStages[4],
      final: createdStages[5]
    };

    let totalQuestionsImported = 0;
    for (const [stageName, questions] of Object.entries(parsedQuestions)) {
      if (questions.length > 0) {
        const stageId = stageMapping[stageName];
        const questionsToImport = questions.map(q => ({
          stageId,
          questionText: q.questionText,
          optionA: q.options.A || '',
          optionB: q.options.B || '',
          optionC: q.options.C || '',
          optionD: q.options.D || '',
          correctAnswer: q.correctAnswer
        }));

        await Question.bulkCreate(questionsToImport);
        totalQuestionsImported += questions.length;
        console.log(`✓ Imported ${questions.length} questions for ${stageName}`);
      }
    }

    // Parse and import videos
    console.log('\nImporting videos...');
    const videoFile = path.join(__dirname, '..', '..', 'Video.txt');
    const parsedVideos = parseVideos(videoFile);

    const videoStageMapping = {
      stage1: createdStages[1],
      stage2: createdStages[2],
      stage3: createdStages[3],
      stage4: createdStages[4]
    };

    let totalVideosImported = 0;
    for (const [stageName, videos] of Object.entries(parsedVideos)) {
      if (videos.length > 0) {
        const stageId = videoStageMapping[stageName];
        const videosToImport = videos.map((v, index) => ({
          stageId,
          title: v.title,
          url: v.url,
          description: '',
          orderNumber: index + 1
        }));

        await Video.bulkCreate(videosToImport);
        totalVideosImported += videos.length;
        console.log(`✓ Imported ${videos.length} videos for ${stageName}`);
      }
    }

    console.log(`
╔═══════════════════════════════════════════╗
║   Database Seeding Complete ✓             ║
║                                           ║
║   Stages created: 6                       ║
║   Questions imported: ${String(totalQuestionsImported).padEnd(20, ' ')}║
║   Videos imported: ${String(totalVideosImported).padEnd(23, ' ')}║
╚═══════════════════════════════════════════╝
    `);

    return {
      stages: 6,
      questions: totalQuestionsImported,
      videos: totalVideosImported
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;
