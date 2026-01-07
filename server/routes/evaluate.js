const express = require('express');
const router = express.Router();
const evaluatorService = require('../services/evaluatorService');
const { protect } = require('../middleware/auth');

// @route   POST /api/evaluate/explain
// @desc    Evaluate a single answer and provide AI explanation
// @access  Private
router.post('/explain', protect, async (req, res) => {
    try {
        const {
            question,
            userAnswer,
            solution,
            correctAnswer,
            type = 'generated'
        } = req.body;

        if (!question || !userAnswer) {
            return res.status(400).json({
                success: false,
                message: 'Question and User Answer are required'
            });
        }

        const evaluation = await evaluatorService.evaluate({
            type,
            studentAnswer: userAnswer,
            correctAnswer,
            question,
            solution
        });

        res.json({
            success: true,
            evaluation
        });

    } catch (error) {
        console.error('Evaluation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error evaluating answer'
        });
    }
});

module.exports = router;
