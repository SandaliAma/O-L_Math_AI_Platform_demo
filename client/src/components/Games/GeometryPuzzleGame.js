import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { gamesAPI } from '../../utils/api';
import Button from '../UI/Button';
import { 
  PlayIcon, 
  TrophyIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const GeometryPuzzleGame = () => {
  const { t } = useTranslation();
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const timerRef = useRef(null);

  const generateGeometry = () => {
    const problems = [
      { q: 'Area of rectangle: length=8, width=5', answer: 40, type: 'area' },
      { q: 'Perimeter of square: side=6', answer: 24, type: 'perimeter' },
      { q: 'Area of triangle: base=10, height=6', answer: 30, type: 'area' },
      { q: 'Area of circle: radius=5 (use π=3.14)', answer: 78.5, type: 'area' },
      { q: 'Volume of cube: side=4', answer: 64, type: 'volume' },
      { q: 'Area of rectangle: length=12, width=7', answer: 84, type: 'area' }
    ];

    const problem = problems[Math.floor(Math.random() * problems.length)];
    
    return {
      question: `Calculate: ${problem.q}`,
      answer: problem.answer,
      type: problem.type
    };
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(60);
    setCorrectCount(0);
    setStartTime(Date.now());
    setQuestions([]);
    const firstQuestion = generateGeometry();
    setCurrentQuestion(firstQuestion);
    setUserAnswer('');
    setFeedback(null);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    try {
      await gamesAPI.play({
        gameType: 'geometry-puzzle',
        questions: questions,
        score: score,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
        timeSpent: timeSpent,
        difficulty: 'medium',
        status: 'completed'
      });
    } catch (error) {
      console.error('Error saving game:', error);
    }

    setGameState('finished');
  };

  const handleSubmit = () => {
    if (!userAnswer || userAnswer === '') return;

    const userAnswerNum = parseFloat(userAnswer);
    const isCorrect = Math.abs(userAnswerNum - currentQuestion.answer) < 0.1; // Allow small floating point differences

    const questionData = {
      question: currentQuestion.question,
      correctAnswer: currentQuestion.answer,
      userAnswer: userAnswerNum,
      isCorrect: isCorrect,
      timeTaken: 0
    };

    const updatedQuestions = [...questions, questionData];
    setQuestions(updatedQuestions);

    if (isCorrect) {
      setScore(score + 10);
      setCorrectCount(correctCount + 1);
      setFeedback({ type: 'correct', message: t('games.correct') });
    } else {
      setFeedback({ type: 'incorrect', message: `${t('games.incorrect')} - ${t('games.correctAnswer')}: ${currentQuestion.answer}` });
    }

    setTimeout(() => {
      setFeedback(null);
      const nextQuestion = generateGeometry();
      setCurrentQuestion(nextQuestion);
      setUserAnswer('');
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  if (gameState === 'menu') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-2xl p-6 sm:p-8 text-white text-center">
          <TrophyIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{t('games.geometryPuzzle')}</h1>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90">
            {t('games.solveGeometry')} - 60 {t('games.seconds')} {t('games.challenge')}
          </p>
          <Button
            onClick={startGame}
            variant="secondary"
            size="lg"
            className="bg-white dark:bg-dominant-800 text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-dominant-700 active:bg-gray-200 dark:active:bg-dominant-600 flex items-center gap-2 mx-auto"
          >
            <PlayIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            <span>{t('games.playGame')}</span>
          </Button>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 text-center">
          <TrophyIcon className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{t('games.gameOver')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-green-50 rounded-lg p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-600 mb-2">{t('games.yourScore')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{score}</p>
            </div>
            <div className="bg-teal-50 rounded-lg p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-600 mb-2">{t('games.correct')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-teal-600">{correctCount}/{questions.length}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-600 mb-2">{t('games.totalQuestions')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{questions.length}</p>
            </div>
          </div>
          <Button
            onClick={startGame}
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          >
            {t('games.playAgain')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="bg-green-100 rounded-lg p-2 sm:p-3">
              <TrophyIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">{t('games.yourScore')}</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{score}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="bg-red-100 rounded-lg p-2 sm:p-3">
              <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">{t('games.timeLeft')}</p>
              <p className={`text-xl sm:text-2xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-900'}`}>
                {timeLeft}s
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 sm:p-12 text-center mb-4 sm:mb-6">
          {feedback && (
            <div className={`mb-4 ${feedback.type === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
              {feedback.type === 'correct' ? (
                <CheckCircleIcon className="h-8 w-8 sm:h-12 sm:w-12 mx-auto" />
              ) : (
                <XCircleIcon className="h-8 w-8 sm:h-12 sm:w-12 mx-auto" />
              )}
              <p className="text-base sm:text-xl font-semibold mt-2">{feedback.message}</p>
            </div>
          )}
          {!feedback && (
            <>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 break-words">
                {currentQuestion?.question}
              </p>
              <input
                type="number"
                step="0.1"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-center border-4 border-green-300 rounded-lg px-4 sm:px-6 py-3 sm:py-4 focus:outline-none focus:border-green-500 w-full max-w-[200px] sm:w-48 touch-manipulation"
                autoFocus
                placeholder="?"
                inputMode="decimal"
              />
            </>
          )}
        </div>

        {!feedback && (
          <Button
            onClick={handleSubmit}
            variant="primary"
            size="lg"
            disabled={!userAnswer}
            fullWidth
            className="bg-green-600 hover:bg-green-700"
          >
            {t('games.submitAnswer')}
          </Button>
        )}

        <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
            <p className="text-xs sm:text-sm text-gray-600">{t('games.correct')}</p>
            <p className="text-xl sm:text-2xl font-bold">{correctCount}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
            <p className="text-xs sm:text-sm text-gray-600">{t('games.totalQuestions')}</p>
            <p className="text-xl sm:text-2xl font-bold">{questions.length + 1}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeometryPuzzleGame;

