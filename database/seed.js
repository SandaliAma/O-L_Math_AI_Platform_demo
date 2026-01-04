// Database seed script for initial data
// Run with: node database/seed.js

const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const User = require('../server/models/User');
const Quiz = require('../server/models/Quiz');
const ForumPost = require('../server/models/ForumPost');

// Sample topics for syllabus
const sampleTopics = [
  { topic: 'Algebra', mastery: 0 },
  { topic: 'Geometry', mastery: 0 },
  { topic: 'Trigonometry', mastery: 0 },
  { topic: 'Statistics', mastery: 0 }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ol_math_platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to preserve data)
    // await User.deleteMany({});
    // await Quiz.deleteMany({});
    // await ForumPost.deleteMany({});

    // Create sample user
    const sampleUser = await User.create({
      email: 'student@example.com',
      password: 'password123',
      name: 'Sample Student',
      studentId: 'IT22300001',
      role: 'student',
      profile: {
        school: 'Sample School',
        district: 'Colombo',
        grade: 'O-Level',
        syllabusTopics: sampleTopics
      },
      performance: {
        totalQuizzes: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        badges: [],
        achievements: []
      }
    });

    console.log('Sample user created:', sampleUser.email);

    // Create sample forum post
    const samplePost = await ForumPost.create({
      userId: sampleUser._id,
      title: 'Welcome to the Forum!',
      content: 'This is a sample forum post. You can discuss mathematics problems here. Use $ for LaTeX math: $x^2 + 5x + 6 = 0$',
      latexContent: '$x^2 + 5x + 6 = 0$',
      topic: 'general',
      tags: ['welcome', 'introduction'],
      sentiment: 'positive',
      isModerated: false
    });

    console.log('Sample forum post created');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();


