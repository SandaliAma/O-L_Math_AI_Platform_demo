# Synthetic Data Generation Guide

## Overview

This script generates comprehensive synthetic data for the AI-Enhanced Learning Platform, including:

1. **Syllabus Topics** (Table 1): All Grade 10 and 11 topics with competency levels
2. **Synthetic Students** (Table 3): 5,000+ students with ability scores and topic proficiency
3. **Question Bank**: Questions with IRT parameters for each topic
4. **Performance Data** (Table 4): 100,000+ simulated quiz attempts using Item Response Theory

## Data Structure

### 1. Syllabus Topics

- **Grade 10**: 31 topics (පරිමිතිය, වර්ගමූලය, etc.)
- **Grade 11**: 25 topics (තාත්වික සංඛ්‍යා, දර්ශක හා ලඝුගණක, etc.)
- Each topic includes:
  - Topic ID (e.g., G10_01, G11_01)
  - Topic name (English and Sinhala)
  - 2-4 subtopics with competency levels (CL)
  - Learning outcomes

### 2. Synthetic Students

Each student has:
- **Overall_Ability**: Normal distribution (50 ± 15), clamped to 0-100
- **Math_Anxiety_Level**: Normal distribution (3 ± 2), clamped to 1-5
- **Topic_Proficiency_Scores**: 
  - Base proficiency = Overall ability ± variation
  - 3-5 topics randomly adjusted (weaknesses/strengths)
  - Creates individual learning profiles for adaptive system

### 3. Question Bank

- **Questions per topic**: 20 (configurable)
- **Difficulty distribution**: 40% easy, 40% medium, 20% hard
- **IRT Parameters**:
  - **Discrimination**: 0.5-2.5 (how well question distinguishes ability)
  - **Difficulty**: -3 to +3 (IRT scale)
  - **Guessing**: 0.25 (probability of guessing correctly)

### 4. Performance Data

Generated using **3-Parameter Logistic (3PL) IRT Model**:

```
P(correct) = c + (1-c) / (1 + e^(-a(θ - b)))

Where:
- a = discrimination parameter
- b = difficulty parameter  
- c = guessing parameter
- θ = student ability (proficiency)
```

**Features**:
- Time taken: Longer for incorrect answers and low-proficiency students
- Attempts count: More attempts for difficult/failed questions
- Realistic probability based on student proficiency vs question difficulty

## Usage

### Basic Usage

```bash
node database/generateSyntheticData.js
```

This generates:
- 5,000 students
- 20 questions per topic
- 100,000 performance records

### Custom Parameters

```bash
node database/generateSyntheticData.js [studentCount] [questionsPerTopic] [performanceRecords]
```

**Examples**:

```bash
# Generate 10,000 students, 30 questions per topic, 200,000 performance records
node database/generateSyntheticData.js 10000 30 200000

# Generate 2,000 students, 15 questions per topic, 50,000 performance records
node database/generateSyntheticData.js 2000 15 50000
```

## Data Models

### SyllabusTopic Model

```javascript
{
  topicId: "G10_01",
  topicName: "Perimeter",
  topicNameSinhala: "පරිමිතිය",
  grade: 10,
  subTopics: [
    {
      subTopicId: "G10_01.1",
      subTopicName: "Perimeter - Subtopic 1",
      competencyLevel: "CL 1.1",
      learningOutcomes: [...]
    }
  ]
}
```

### Question Model

```javascript
{
  questionId: "Q000001",
  question: "Question text...",
  options: ["Option A", "Option B", "Option C", "Option D"],
  correctAnswer: 0,
  topic: "Perimeter",
  topicId: "G10_01",
  grade: 10,
  difficulty: "medium",
  irtParameters: {
    discrimination: 1.0,
    difficulty: 0.0,
    guessing: 0.25
  }
}
```

### PerformanceData Model

```javascript
{
  studentId: ObjectId,
  questionId: ObjectId,
  topicId: "G10_01",
  isCorrect: true,
  timeTaken: 45, // seconds
  attemptsCount: 1,
  studentProficiency: 65.5,
  questionDifficulty: 0.2,
  probabilityCorrect: 0.78,
  timestamp: Date
}
```

## IRT Model Details

### Probability Calculation

The script uses the **3-Parameter Logistic (3PL) IRT model**:

1. **Student Ability (θ)**: Converted from proficiency (0-100) to IRT scale (-3 to +3)
   ```
   θ = (proficiency / 100) * 6 - 3
   ```

2. **Question Difficulty (b)**: 
   - Easy: -1.5 ± 0.5
   - Medium: 0 ± 0.5
   - Hard: 1.5 ± 0.5

3. **Discrimination (a)**:
   - Easy: 0.8 ± 0.2
   - Medium: 1.0 ± 0.3
   - Hard: 1.2 ± 0.3

4. **Guessing (c)**: Fixed at 0.25 (4 options = 25% chance)

### Time Simulation

- **Base time**: 30 seconds
- **Incorrect answers**: 1.5x multiplier
- **Low proficiency (<40)**: 1.8x multiplier
- **High proficiency (>70)**: 0.7x multiplier
- **Final time**: Normal distribution around base time

## Data Quality

### Realistic Variability

- **Student abilities**: Normal distribution ensures realistic spread
- **Topic proficiency**: Individual weaknesses/strengths create diverse learning profiles
- **Question difficulty**: Varied IRT parameters create realistic question bank
- **Performance patterns**: IRT model ensures correct answers correlate with ability

### Stress Detection Data

The generated data includes:
- **Time taken**: Longer times for struggling students
- **Attempts count**: Multiple attempts for difficult questions
- **Math anxiety levels**: Stored in student profiles
- **Interaction delays**: Simulated through time patterns

## Database Requirements

- **MongoDB**: Version 4.4 or higher
- **Storage**: Approximately 500MB per 10,000 students with full performance data
- **Indexes**: Automatically created for efficient queries

## Performance Considerations

- **Batch inserts**: Data inserted in batches (100-500 records) for efficiency
- **Progress tracking**: Console output shows progress every 500-10,000 records
- **Memory management**: Processes data in chunks to avoid memory issues

## Integration with ML Models

The generated data can be used to:

1. **Train Stress Detection Model**: 
   - Use time taken, attempts count, and proficiency scores
   - Math anxiety levels as labels

2. **Adaptive Quiz Generation**:
   - Use topic proficiency to select appropriate questions
   - Use IRT parameters for difficulty matching

3. **Recommendation System**:
   - Analyze performance patterns
   - Identify weak topics
   - Suggest personalized learning paths

## Example Queries

### Get student proficiency distribution
```javascript
db.users.find({ 
  "_syntheticData.overallAbility": { $exists: true } 
}).forEach(user => {
  print(user._syntheticData.overallAbility);
});
```

### Get performance by topic
```javascript
db.performancedata.aggregate([
  { $group: {
    _id: "$topicId",
    avgCorrect: { $avg: { $cond: ["$isCorrect", 1, 0] } },
    avgTime: { $avg: "$timeTaken" }
  }}
]);
```

### Get questions by difficulty
```javascript
db.questions.aggregate([
  { $group: {
    _id: "$difficulty",
    count: { $sum: 1 },
    avgDifficulty: { $avg: "$irtParameters.difficulty" }
  }}
]);
```

## Troubleshooting

### Memory Issues
- Reduce batch sizes in the script
- Generate data in smaller chunks
- Use MongoDB's `allowDiskUse` option

### Slow Generation
- Reduce number of students or questions
- Generate performance data separately
- Use MongoDB indexes for faster queries

### Data Validation
- Check student count: `db.users.count({ email: /@synthetic\.com$/ })`
- Check question count: `db.questions.count()`
- Check performance records: `db.performancedata.count()`

## Next Steps

After generating synthetic data:

1. **Initialize Badges**: Run badge initialization
2. **Train ML Models**: Use performance data for model training
3. **Test Adaptive System**: Verify quiz generation works with synthetic students
4. **Analyze Patterns**: Use data for research and development





