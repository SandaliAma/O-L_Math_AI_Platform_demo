// Synthetic Data Generation Script
// Generates: Syllabus Topics, Synthetic Students, Questions, and Performance Data
// Run with: node database/generateSyntheticData.js

const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const User = require('../server/models/User');
const SyllabusTopic = require('../server/models/SyllabusTopic');
const Question = require('../server/models/Question');
const PerformanceData = require('../server/models/PerformanceData');
const bcrypt = require('bcryptjs');

// Grade 10 Topics (Sinhala)
const grade10Topics = [
  { id: 'G10_01', name: 'Perimeter', sinhala: 'පරිමිතිය' },
  { id: 'G10_02', name: 'Square Root', sinhala: 'වර්ගමූලය' },
  { id: 'G10_03', name: 'Fractions', sinhala: 'භාග' },
  { id: 'G10_04', name: 'Binomial Expressions', sinhala: 'ද්විපද ප‍්‍රකාශන' },
  { id: 'G10_05', name: 'Proportion', sinhala: 'අංගසාම්‍යය' },
  { id: 'G10_06', name: 'Square Area', sinhala: 'වර්ගඵලය' },
  { id: 'G10_07', name: 'Factorization of Quadratic Expressions', sinhala: 'වර්ගජ ප‍්‍රකාශනවල සාධක' },
  { id: 'G10_08', name: 'Triangles', sinhala: 'ති‍්‍රකෝණ' },
  { id: 'G10_09', name: 'Inverse Proportion', sinhala: 'ප‍්‍රතිලෝම සමානුපාත' },
  { id: 'G10_10', name: 'Data Representation', sinhala: 'දත්ත නිරූපණය' },
  { id: 'G10_11', name: 'LCM of Algebraic Expressions', sinhala: 'වීජීය ප‍්‍රකාශනවල කුඩාම පොදු ගුණාකාරය' },
  { id: 'G10_12', name: 'Algebraic Fractions', sinhala: 'වීජිය භාග' },
  { id: 'G10_13', name: 'Percentages', sinhala: 'ප‍්‍රතිශත' },
  { id: 'G10_14', name: 'Equations', sinhala: 'සමීකරණ' },
  { id: 'G10_15', name: 'Arithmetic Sequences I', sinhala: 'සමාන්ත‍්‍රරාස‍්‍ර  ෂ' },
  { id: 'G10_16', name: 'Arithmetic Sequences II', sinhala: 'සමාන්ත‍්‍රරාස‍්‍ර  ෂෂ' },
  { id: 'G10_17', name: 'Sets', sinhala: 'කුලක' },
  { id: 'G10_18', name: 'Logarithms I', sinhala: 'ලඝුගණක ෂ' },
  { id: 'G10_19', name: 'Logarithms II', sinhala: 'ලඝුගණක  ෂෂ' },
  { id: 'G10_20', name: 'Graphs', sinhala: 'ප‍්‍රස්තාර' },
  { id: 'G10_21', name: 'Speed', sinhala: 'ශීඝ‍්‍රතාව' },
  { id: 'G10_22', name: 'Formulae', sinhala: 'සූත‍්‍ර' },
  { id: 'G10_23', name: 'Arithmetic Progressions', sinhala: 'සමාන්තර ශ්‍රේඪි' },
  { id: 'G10_24', name: 'Algebraic Inequalities', sinhala: 'වීජීය අසමානතා' },
  { id: 'G10_25', name: 'Frequency Distribution', sinhala: 'සංඛ්‍යාත ව්‍යාප්ති' },
  { id: 'G10_26', name: 'Circle Area', sinhala: 'වෘත්තයක ජ්‍යා' },
  { id: 'G10_27', name: 'Construction', sinhala: 'නිර්මාණ' },
  { id: 'G10_28', name: 'Surface Area and Volume', sinhala: 'පෘෂ්ඨ වර්ගඵලය හා පරිමාව' },
  { id: 'G10_29', name: 'Probability', sinhala: 'සම්භාවිතාව' },
  { id: 'G10_30', name: 'Circle Angles', sinhala: 'වෘත්තයක කෝණ' },
  { id: 'G10_31', name: 'Scale Drawings', sinhala: 'පරිමාණ රූප' }
];

// Grade 11 Topics (Sinhala)
const grade11Topics = [
  { id: 'G11_01', name: 'Real Numbers', sinhala: 'තාත්වික සංඛ්‍යා' },
  { id: 'G11_02', name: 'Indices and Logarithms I', sinhala: 'දර්ශක හා ලඝුගණක - 1' },
  { id: 'G11_03', name: 'Indices and Logarithms II', sinhala: 'දර්ශක හා ලඝුගණක - 2' },
  { id: 'G11_04', name: 'Surface Area of Solids', sinhala: 'ඝන වස්තුවල පෘෂ්ඨ වර්ගඵලය' },
  { id: 'G11_05', name: 'Volume of Solids', sinhala: 'ඝන වස්තුවල පරිමාව' },
  { id: 'G11_06', name: 'Binomial Expressions', sinhala: 'ද්විපද ප‍්‍රකාශන' },
  { id: 'G11_07', name: 'Algebraic Fractions', sinhala: 'වීීජීය භාග' },
  { id: 'G11_08', name: 'Area of Plane Figures between Parallel Lines', sinhala: 'සමාන්තර රේඛා අතර තල රූපවල වර්ගඵලය' },
  { id: 'G11_09', name: 'Percentages', sinhala: 'ප‍්‍රතිශත' },
  { id: 'G11_10', name: 'Stock Market', sinhala: 'කොටස් වෙළෙඳ පොල' },
  { id: 'G11_11', name: 'Midpoint Theorem', sinhala: 'මධ්‍ය ලක්ෂ්‍යක ප‍්‍රමේයය' },
  { id: 'G11_12', name: 'Graphs', sinhala: 'ප‍්‍රස්තාර' },
  { id: 'G11_13', name: 'Equations', sinhala: 'සමීකරණ' },
  { id: 'G11_14', name: 'Isosceles Triangles', sinhala: 'සමකෝණී ත‍්‍රිකෝණ' },
  { id: 'G11_15', name: 'Data Representation and Interpretation', sinhala: 'දත්ත නිරූපණය හා අර්ථකථනය' },
  { id: 'G11_16', name: 'Geometric Progressions', sinhala: 'ගුණෝත්තර ශ්‍රේඨි' },
  { id: 'G11_17', name: 'Pythagorean Theorem', sinhala: 'පයිතගරස් ප‍්‍රමේයය' },
  { id: 'G11_18', name: 'Trigonometry', sinhala: 'ත‍්‍රිකෝණමිතිය' },
  { id: 'G11_19', name: 'Matrices', sinhala: 'න්‍යාස' },
  { id: 'G11_20', name: 'Inequalities', sinhala: 'අසමානතා' },
  { id: 'G11_21', name: 'Cyclic Quadrilaterals', sinhala: 'වෘත්ත චතුරස‍්‍ර' },
  { id: 'G11_22', name: 'Tangents', sinhala: 'ස්පර්ශක' },
  { id: 'G11_23', name: 'Construction', sinhala: 'නිර්මාණ' },
  { id: 'G11_24', name: 'Sets', sinhala: 'කුලක' },
  { id: 'G11_25', name: 'Probability', sinhala: 'සම්භාවිතාව' }
];

// Helper function to generate random number from normal distribution
function normalRandom(mean, stdDev) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  return mean + stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Helper function to clamp value between min and max
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// IRT Probability function (3PL model)
function irtProbability(studentAbility, questionDifficulty, discrimination = 1.0, guessing = 0.25) {
  const exponent = -discrimination * (studentAbility - questionDifficulty);
  return guessing + (1 - guessing) / (1 + Math.exp(exponent));
}

// Generate syllabus topics
async function generateSyllabusTopics() {
  console.log('📚 Generating Syllabus Topics...');
  
  const topics = [];
  
  // Grade 10 topics
  for (const topic of grade10Topics) {
    const subTopics = [];
    // Generate 2-4 subtopics per topic
    const numSubTopics = Math.floor(Math.random() * 3) + 2;
    for (let i = 1; i <= numSubTopics; i++) {
      subTopics.push({
        subTopicId: `${topic.id}.${i}`,
        subTopicName: `${topic.name} - Subtopic ${i}`,
        competencyLevel: `CL ${Math.floor(i / 2) + 1}.${i % 2 + 1}`,
        learningOutcomes: [
          `Understand ${topic.name} concept ${i}`,
          `Apply ${topic.name} in problem solving`
        ]
      });
    }
    
    topics.push({
      topicId: topic.id,
      topicName: topic.name,
      topicNameSinhala: topic.sinhala,
      grade: 10,
      subTopics
    });
  }
  
  // Grade 11 topics
  for (const topic of grade11Topics) {
    const subTopics = [];
    const numSubTopics = Math.floor(Math.random() * 3) + 2;
    for (let i = 1; i <= numSubTopics; i++) {
      subTopics.push({
        subTopicId: `${topic.id}.${i}`,
        subTopicName: `${topic.name} - Subtopic ${i}`,
        competencyLevel: `CL ${Math.floor(i / 2) + 1}.${i % 2 + 1}`,
        learningOutcomes: [
          `Understand ${topic.name} concept ${i}`,
          `Apply ${topic.name} in problem solving`
        ]
      });
    }
    
    topics.push({
      topicId: topic.id,
      topicName: topic.name,
      topicNameSinhala: topic.sinhala,
      grade: 11,
      subTopics
    });
  }
  
  await SyllabusTopic.insertMany(topics);
  console.log(`✅ Created ${topics.length} syllabus topics`);
  return topics;
}

// Generate synthetic students
async function generateSyntheticStudents(count = 5000) {
  console.log(`👥 Generating ${count} Synthetic Students...`);
  
  const students = [];
  const districts = ['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Galle', 'Matara', 'Kurunegala', 'Anuradhapura'];
  const schools = ['School A', 'School B', 'School C', 'School D', 'School E'];
  
  // Get all topics for proficiency generation
  const allTopics = await SyllabusTopic.find({});
  const topicIds = allTopics.map(t => t.topicId);
  
  for (let i = 1; i <= count; i++) {
    const studentId = `S${String(i).padStart(5, '0')}`;
    const overallAbility = clamp(normalRandom(50, 15), 0, 100);
    const mathAnxiety = clamp(normalRandom(3, 2), 1, 5);
    
    // Generate topic proficiency scores
    const topicProficiency = {};
    topicIds.forEach(topicId => {
      // Base proficiency on overall ability with some variation
      let proficiency = normalRandom(overallAbility, 10);
      
      // Introduce variability: make 3-5 topics harder/easier
      if (Math.random() < 0.15) { // 15% chance to be a weakness
        proficiency = normalRandom(overallAbility - 20, 8);
      } else if (Math.random() < 0.1) { // 10% chance to be a strength
        proficiency = normalRandom(overallAbility + 15, 8);
      }
      
      topicProficiency[topicId] = clamp(proficiency, 0, 100);
    });
    
    // Create syllabus topics array for user profile
    const syllabusTopics = topicIds.map(topicId => ({
      topic: topicId,
      mastery: topicProficiency[topicId]
    }));
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    students.push({
      email: `student${i}@synthetic.com`,
      password: hashedPassword,
      name: `Student ${i}`,
      studentId: studentId,
      role: 'student',
      profile: {
        school: schools[Math.floor(Math.random() * schools.length)],
        district: districts[Math.floor(Math.random() * districts.length)],
        grade: Math.random() > 0.5 ? '10' : '11',
        syllabusTopics: syllabusTopics
      },
      performance: {
        totalQuizzes: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        badges: [],
        achievements: []
      },
      stressIndicators: {
        lastAnalysis: null,
        stressLevel: mathAnxiety * 20, // Convert 1-5 scale to 0-100
        patterns: []
      },
      gameStats: {
        totalGames: 0,
        totalScore: 0,
        bestScore: 0,
        averageScore: 0,
        currentStreak: 0,
        longestStreak: 0
      },
      // Store synthetic data metadata (will be stored but not validated by schema)
      _syntheticData: {
        overallAbility,
        mathAnxiety,
        topicProficiency
      },
      createdAt: new Date()
    });
    
    if (i % 500 === 0) {
      console.log(`  Generated ${i}/${count} students...`);
    }
  }
  
  // Insert in batches
  const batchSize = 100;
  for (let i = 0; i < students.length; i += batchSize) {
    const batch = students.slice(i, i + batchSize);
    await User.insertMany(batch);
  }
  
  console.log(`✅ Created ${count} synthetic students`);
  return students;
}

// Generate question bank
async function generateQuestionBank(questionsPerTopic = 20) {
  console.log('❓ Generating Question Bank...');
  
  const allTopics = await SyllabusTopic.find({});
  const questions = [];
  let questionCounter = 1;
  
  for (const topic of allTopics) {
    const difficulties = ['easy', 'medium', 'hard'];
    const difficultyWeights = [0.4, 0.4, 0.2]; // 40% easy, 40% medium, 20% hard
    
    for (let i = 0; i < questionsPerTopic; i++) {
      // Select difficulty based on weights
      let rand = Math.random();
      let difficulty = 'medium';
      if (rand < 0.4) difficulty = 'easy';
      else if (rand < 0.8) difficulty = 'medium';
      else difficulty = 'hard';
      
      // Generate IRT parameters based on difficulty
      let irtDifficulty = 0;
      let irtDiscrimination = 1.0;
      
      if (difficulty === 'easy') {
        irtDifficulty = normalRandom(-1.5, 0.5); // Easier questions
        irtDiscrimination = normalRandom(0.8, 0.2);
      } else if (difficulty === 'medium') {
        irtDifficulty = normalRandom(0, 0.5);
        irtDiscrimination = normalRandom(1.0, 0.3);
      } else {
        irtDifficulty = normalRandom(1.5, 0.5); // Harder questions
        irtDiscrimination = normalRandom(1.2, 0.3);
      }
      
      irtDifficulty = clamp(irtDifficulty, -3, 3);
      irtDiscrimination = clamp(irtDiscrimination, 0.5, 2.5);
      
      const questionId = `Q${String(questionCounter).padStart(6, '0')}`;
      
      questions.push({
        questionId: questionId,
        question: `Question about ${topic.topicName} (${difficulty}): Solve the following problem related to ${topic.topicNameSinhala}.`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: Math.floor(Math.random() * 4),
        explanation: `This question tests understanding of ${topic.topicName}`,
        topic: topic.topicName,
        topicId: topic.topicId,
        grade: topic.grade,
        difficulty: difficulty,
        marks: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
        syllabusUnit: topic.topicName,
        irtParameters: {
          discrimination: irtDiscrimination,
          difficulty: irtDifficulty,
          guessing: 0.25
        }
      });
      
      questionCounter++;
    }
  }
  
  // Insert in batches
  const batchSize = 100;
  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize);
    await Question.insertMany(batch);
  }
  
  console.log(`✅ Created ${questions.length} questions`);
  return questions;
}

// Generate performance data
async function generatePerformanceData(targetRecords = 100000) {
  console.log(`📊 Generating Performance Data (target: ${targetRecords} records)...`);
  
  const students = await User.find({ 
    role: 'student',
    email: /@synthetic\.com$/
  }).select('_id _syntheticData');
  const questions = await Question.find({}).select('_id topicId irtParameters');
  
  console.log(`  Found ${students.length} students and ${questions.length} questions`);
  
  const performanceRecords = [];
  let recordCount = 0;
  
  // Calculate how many attempts per student-question pair
  const attemptsPerStudent = Math.ceil(targetRecords / students.length);
  
  for (const student of students) {
    const syntheticData = student._syntheticData || {};
    const overallAbility = syntheticData.overallAbility || 50;
    const topicProficiency = syntheticData.topicProficiency || {};
    
    // Select a subset of questions for this student (not all students attempt all questions)
    const questionsToAttempt = questions.filter(() => Math.random() < 0.3); // 30% of questions
    
    for (const question of questionsToAttempt) {
      if (recordCount >= targetRecords) break;
      
      const topicId = question.topicId.toString();
      const studentProficiency = topicProficiency[topicId] || overallAbility;
      
      // Convert proficiency to IRT scale (-3 to 3)
      const studentAbility = (studentProficiency / 100) * 6 - 3;
      const questionDifficulty = question.irtParameters.difficulty;
      const discrimination = question.irtParameters.discrimination || 1.0;
      const guessing = question.irtParameters.guessing || 0.25;
      
      // Calculate probability of correct answer using IRT
      const probCorrect = irtProbability(studentAbility, questionDifficulty, discrimination, guessing);
      const isCorrect = Math.random() < probCorrect;
      
      // Generate time taken (longer for incorrect answers and low proficiency)
      let baseTime = 30; // Base time in seconds
      if (!isCorrect) baseTime *= 1.5;
      if (studentProficiency < 40) baseTime *= 1.8;
      if (studentProficiency > 70) baseTime *= 0.7;
      
      const timeTaken = Math.floor(normalRandom(baseTime, baseTime * 0.3));
      
      // Generate attempts count (more attempts for difficult questions)
      let attemptsCount = 1;
      if (!isCorrect && probCorrect < 0.3) {
        attemptsCount = Math.floor(Math.random() * 3) + 2; // 2-4 attempts
      }
      
      performanceRecords.push({
        studentId: student._id,
        questionId: question._id,
        topicId: topicId,
        isCorrect: isCorrect,
        timeTaken: Math.max(5, timeTaken), // Minimum 5 seconds
        attemptsCount: attemptsCount,
        studentProficiency: studentProficiency,
        questionDifficulty: questionDifficulty,
        probabilityCorrect: probCorrect,
        timestamp: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) // Random date in past year
      });
      
      recordCount++;
      
      if (recordCount % 10000 === 0) {
        console.log(`  Generated ${recordCount}/${targetRecords} performance records...`);
      }
    }
    
    if (recordCount >= targetRecords) break;
  }
  
  // Insert in batches
  const batchSize = 500;
  for (let i = 0; i < performanceRecords.length; i += batchSize) {
    const batch = performanceRecords.slice(i, i + batchSize);
    await PerformanceData.insertMany(batch);
  }
  
  console.log(`✅ Created ${performanceRecords.length} performance records`);
  return performanceRecords;
}

// Main function
async function generateAllData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ol_math_platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    // Get parameters from command line or use defaults
    const studentCount = parseInt(process.argv[2]) || 5000;
    const questionsPerTopic = parseInt(process.argv[3]) || 20;
    const performanceRecords = parseInt(process.argv[4]) || 100000;
    
    console.log('🚀 Starting Synthetic Data Generation...\n');
    console.log(`Configuration:`);
    console.log(`  - Students: ${studentCount}`);
    console.log(`  - Questions per topic: ${questionsPerTopic}`);
    console.log(`  - Performance records: ${performanceRecords}\n`);
    
    // Clear existing synthetic data (optional)
    console.log('🗑️  Clearing existing synthetic data...');
    await SyllabusTopic.deleteMany({});
    await Question.deleteMany({});
    await PerformanceData.deleteMany({});
    await User.deleteMany({ email: /@synthetic\.com$/ });
    console.log('✅ Cleared existing data\n');
    
    // Generate data
    const topics = await generateSyllabusTopics();
    console.log('');
    
    const students = await generateSyntheticStudents(studentCount);
    console.log('');
    
    const questions = await generateQuestionBank(questionsPerTopic);
    console.log('');
    
    const performance = await generatePerformanceData(performanceRecords);
    console.log('');
    
    console.log('🎉 Synthetic Data Generation Complete!');
    console.log(`\nSummary:`);
    console.log(`  - Syllabus Topics: ${topics.length}`);
    console.log(`  - Students: ${students.length}`);
    console.log(`  - Questions: ${questions.length}`);
    console.log(`  - Performance Records: ${performance.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating synthetic data:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateAllData();
}

module.exports = {
  generateSyllabusTopics,
  generateSyntheticStudents,
  generateQuestionBank,
  generatePerformanceData
};

