# O-L Math AI Platform - Metrics Explanation

This document outlines how the three key performance metrics—**Average Score**, **Topic Accuracy**, and **Topic Mastery**—are calculated in the system.

---

## 1. Average Score (Dashboard Statistic)
**Description:**  
This represents the student's overall grade average across all the quizzes they have completed. It gives a high-level view of general performance.

**Source Code:** `server/routes/quiz.js`  
**Logic:**  
It uses a "running average" calculation. Every time a student submits a new quiz, the system updates the average based on the previous average and the new score.

**Formula:**
```javascript
New_Average = ((Old_Average * Previous_Total_Quizzes) + New_Quiz_Score) / New_Total_Quizzes
```

**Example:**
*   You have taken 4 quizzes with an average of 80%.
*   You take a 5th quiz and score 90%.
*   Calculation: `((80 * 4) + 90) / 5` = `410 / 5` = **82%**

---

## 2. Topic Accuracy (Topic Performance Chart)
**Description:**  
This statistic measures raw precision for a specific topic. It calculated by checking every single question ever attempted for that topic, regardless of which quiz it was part of. This is purely about "How many times did I answer correctly vs. incorrectly?"

**Source Code:** `server/routes/progress.js`  
**Logic:**  
The system iterates through all past quizzes and aggregates the total number of attempts and correct answers for each topic.

**Formula:**
```javascript
Accuracy = (Total_Correct_Answers_For_Topic / Total_Attempts_For_Topic) * 100
```

**Example:**
*   Quiz A: 2 Algebra questions (1 Correct, 1 Wrong)
*   Quiz B: 3 Algebra questions (3 Correct, 0 Wrong)
*   **Total:** 5 Attempts, 4 Correct.
*   **Accuracy:** `(4 / 5) * 100` = **80%**

---

## 3. Topic Mastery (Progress Bar)
**Description:**  
Topic Mastery is a **Game-like Progression System** (Gamification). Unlike Accuracy, which can fluctuate up and down, Mastery is designed to incrementally grow as rewards for practice and effort. It represents "experience" in a topic.

**Source Code:** `server/routes/quiz.js`  
**Logic:**  
Mastery starts at a set value once you demonstrate basic competency (answering one question right) and increases by a fixed amount for every subsequent correct answer. It does **not** decrease for wrong answers, encouraging students to keep trying.

**Rules:**
1.  **Initial Unlock:** When a student gets their *first* correct answer in a topic, Mastery starts at **50%**.
2.  **Growth:** Every subsequent correct answer adds **+2%** to the Mastery score.
3.  **Cap:** The maximum score is **100%**.

**Example:**
*   You answer your first Geometry question correctly -> **Score: 50**
*   You get the next one wrong -> **Score: 50** (No penalty)
*   You get the next one right -> **Score: 52**
*   You get the next one right -> **Score: 54**

---

## Summary of Differences

| Metric | Type | Purpose | How to improve |
| :--- | :--- | :--- | :--- |
| **Average Score** | Cumulative Statistic | Shows overall grade performance. | Score higher percentages on new quizzes. |
| **Topic Accuracy** | Raw Statistic | Shows skill reliability. | Avoid wrong answers; high volume of correct answers balances out errors. |
| **Topic Mastery** | Progression (XP) | Rewards effort and volume of practice. | Just keep practicing and getting answers right. |
