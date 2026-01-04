# Quick Start: Synthetic Data Generation

## Prerequisites

- Node.js installed
- MongoDB running and accessible
- Environment variables configured in `server/.env`

## Quick Start

### 1. Basic Generation (Recommended for Testing)

```bash
node database/generateSyntheticData.js
```

This generates:
- 5,000 synthetic students
- 20 questions per topic (56 topics = ~1,120 questions)
- 100,000 performance records

**Estimated time**: 5-10 minutes

### 2. Full Dataset Generation

```bash
node database/generateSyntheticData.js 10000 30 200000
```

This generates:
- 10,000 synthetic students
- 30 questions per topic (~1,680 questions)
- 200,000 performance records

**Estimated time**: 15-20 minutes

### 3. Small Dataset (For Quick Testing)

```bash
node database/generateSyntheticData.js 1000 10 10000
```

This generates:
- 1,000 synthetic students
- 10 questions per topic (~560 questions)
- 10,000 performance records

**Estimated time**: 1-2 minutes

## What Gets Generated

### ✅ Syllabus Topics
- **Grade 10**: 31 topics with subtopics and competency levels
- **Grade 11**: 25 topics with subtopics and competency levels
- Stored in `syllabustopics` collection

### ✅ Synthetic Students
- Each student has:
  - Overall ability score (0-100)
  - Math anxiety level (1-5)
  - Topic proficiency scores (individual strengths/weaknesses)
- Email format: `student1@synthetic.com`, `student2@synthetic.com`, etc.
- Password: `password123` (for all synthetic students)

### ✅ Question Bank
- Questions with IRT parameters
- Difficulty levels: easy, medium, hard
- Linked to syllabus topics

### ✅ Performance Data
- Simulated quiz attempts
- Uses IRT model for realistic correctness
- Includes time taken and attempt counts

## Verification

After generation, verify the data:

```javascript
// In MongoDB shell or Compass
use ol_math_platform

// Count students
db.users.count({ email: /@synthetic\.com$/ })

// Count questions
db.questions.count()

// Count performance records
db.performancedata.count()

// Sample student
db.users.findOne({ email: /@synthetic\.com$/ })

// Sample performance data
db.performancedata.findOne()
```

## Next Steps

1. **Initialize Badges**:
   ```bash
   # Via API or script
   POST /api/badges/initialize
   ```

2. **Test Quiz Generation**: Use synthetic students to test adaptive quiz generation

3. **Train ML Models**: Use performance data for stress detection and recommendation models

## Troubleshooting

### Connection Error
- Check MongoDB is running: `mongod`
- Verify `MONGODB_URI` in `server/.env`

### Out of Memory
- Reduce student count or questions per topic
- Generate in smaller batches

### Slow Generation
- This is normal for large datasets
- Monitor progress in console output
- Consider generating overnight for full dataset

## Data Cleanup

To remove all synthetic data:

```javascript
// In MongoDB shell
use ol_math_platform

db.syllabustopics.deleteMany({})
db.questions.deleteMany({})
db.performancedata.deleteMany({})
db.users.deleteMany({ email: /@synthetic\.com$/ })
```

Or modify the script to skip the deletion step.





