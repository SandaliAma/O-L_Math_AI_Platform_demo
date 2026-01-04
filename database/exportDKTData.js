// Export MongoDB data for DKT model training
// Run with: node database/exportDKTData.js

const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const PerformanceData = require('../server/models/PerformanceData');
const Question = require('../server/models/Question');
const User = require('../server/models/User');
const fs = require('fs');
const path = require('path');

/**
 * Export student learning sequences for DKT training
 */
async function exportDKTData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ol_math_platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');
    console.log('📊 Exporting data for DKT training...\n');

    // Get all students with performance data
    const students = await User.find({ 
      role: 'student',
      email: /@synthetic\.com$/
    }).select('_id');

    console.log(`Found ${students.length} students\n`);

    const trainingData = [];
    let processed = 0;

    // Process each student
    for (const student of students) {
      // Get student's performance data
      const performanceData = await PerformanceData.aggregate([
        {
          $match: {
            studentId: student._id
          }
        },
        {
          $sort: { timestamp: 1 }
        },
        {
          $lookup: {
            from: 'questions',
            localField: 'questionId',
            foreignField: '_id',
            as: 'question'
          }
        },
        {
          $unwind: {
            path: '$question',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            question_id: {
              $ifNull: [
                { $toInt: { $substr: ['$question.questionId', 1, -1] } },
                0
              ]
            },
            topic_id: {
              $ifNull: [
                { $toInt: { $substr: ['$topicId', 4, -1] } },
                0
              ]
            },
            is_correct: { $cond: ['$isCorrect', 1, 0] },
            time_taken: {
              $divide: ['$timeTaken', 100]
            },
            attempts: '$attemptsCount'
          }
        }
      ]);

      // Only include students with sufficient data (at least 5 interactions)
      if (performanceData.length >= 5) {
        trainingData.push({
          student_id: student._id.toString(),
          interactions: performanceData.map(item => ({
            question_id: item.question_id || 0,
            topic_id: item.topic_id || 0,
            is_correct: item.is_correct || 0,
            time_taken: Math.min(item.time_taken || 0, 300),
            attempts: Math.min(item.attempts || 1, 5)
          }))
        });
      }

      processed++;
      if (processed % 100 === 0) {
        console.log(`Processed ${processed}/${students.length} students...`);
      }
    }

    // Save to JSON file
    const outputPath = path.join(__dirname, 'dkt_training_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(trainingData, null, 2));

    console.log(`\n✅ Export complete!`);
    console.log(`📁 Saved ${trainingData.length} student sequences to: ${outputPath}`);
    console.log(`📊 Total interactions: ${trainingData.reduce((sum, s) => sum + s.interactions.length, 0)}`);
    console.log(`\n💡 Upload this file to Google Colab for training`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error exporting data:', error);
    process.exit(1);
  }
}

exportDKTData();





