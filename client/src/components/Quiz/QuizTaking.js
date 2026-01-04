import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { quizAPI } from '../../utils/api';
import { useTranslation } from '../../hooks/useTranslation';
import { renderMath } from '../../utils/mathjax';

const QuizTaking = ({ user }) => {
  const { t, currentLanguage, changeLanguage } = useTranslation();
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [markedQuestions, setMarkedQuestions] = useState(new Set());
  const [timeSpent, setTimeSpent] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const questionStartTime = useRef(null);
  const mathContainerRef = useRef(null);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    fetchQuiz();
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [quizId]);

  useEffect(() => {
    if (quiz && quiz.questions && quiz.questions.length > 0) {
      questionStartTime.current = Date.now();
      // Render MathJax when question changes
      setTimeout(() => {
        if (mathContainerRef.current && window.MathJax) {
          renderMath(mathContainerRef.current);
        }
      }, 100);
    }
  }, [currentQuestion, quiz]);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLanguageDropdown && !event.target.closest('.language-dropdown-container')) {
        setShowLanguageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageDropdown]);

  useEffect(() => {
    if (quiz && quiz.timeLimit && quiz.timeStarted) {
      // Calculate remaining time
      const startTime = new Date(quiz.timeStarted).getTime();
      const timeLimitMs = quiz.timeLimit * 60 * 1000; // Convert minutes to milliseconds
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, timeLimitMs - elapsed);
      
      setTimeRemaining(remaining);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            // Time's up - auto submit
            handleFinish();
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [quiz]);

  const fetchQuiz = async () => {
    try {
      const response = await quizAPI.getById(quizId);
      if (response.data.success) {
        setQuiz(response.data.quiz);
        setAnswers(new Array(response.data.quiz.questions.length).fill(null));
        setTimeSpent({});
        setMarkedQuestions(new Set());
      } else {
        setError(t('errors.notFound'));
      }
    } catch (err) {
      console.error('Error fetching quiz:', err);
      setError(err.response?.data?.message || t('errors.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      selectedAnswer: answerIndex,
      timeSpent: timeSpent[currentQuestion] || 0
    };
    setAnswers(newAnswers);

    // Record time spent
    if (questionStartTime.current) {
      const time = Math.floor((Date.now() - questionStartTime.current) / 1000);
      setTimeSpent({
        ...timeSpent,
        [currentQuestion]: time
      });
    }
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      saveTimeForCurrentQuestion();
      setCurrentQuestion(currentQuestion + 1);
      questionStartTime.current = Date.now();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      saveTimeForCurrentQuestion();
      setCurrentQuestion(currentQuestion - 1);
      questionStartTime.current = Date.now();
    }
  };

  const handleMarkForReview = () => {
    const newMarked = new Set(markedQuestions);
    if (newMarked.has(currentQuestion)) {
      newMarked.delete(currentQuestion);
    } else {
      newMarked.add(currentQuestion);
    }
    setMarkedQuestions(newMarked);
    handleNext();
  };

  const handleClearAnswer = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = null;
    setAnswers(newAnswers);
  };

  const saveTimeForCurrentQuestion = () => {
    if (questionStartTime.current) {
      const time = Math.floor((Date.now() - questionStartTime.current) / 1000);
      setTimeSpent({
        ...timeSpent,
        [currentQuestion]: (timeSpent[currentQuestion] || 0) + time
      });
    }
  };

  const handleQuestionClick = (index) => {
    saveTimeForCurrentQuestion();
    setCurrentQuestion(index);
    questionStartTime.current = Date.now();
  };

  const handleFinish = async () => {
    if (!window.confirm(t('quiz.areYouSure'))) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      saveTimeForCurrentQuestion();

      const finalAnswers = answers.map((ans, idx) => ({
        selectedAnswer: ans?.selectedAnswer ?? -1,
        timeSpent: timeSpent[idx] || 0
      }));

      const response = await quizAPI.submit({
        quizId,
        answers: finalAnswers
      });

      if (response.data.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || t('errors.somethingWentWrong'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">{t('loading')}</div>
      </div>
    );
  }

  if (!quiz || !quiz.questions) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {t('errors.notFound')}
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const currentAnswer = answers[currentQuestion];
  const answeredCount = answers.filter(a => a !== null).length;
  const markedCount = markedQuestions.size;
  const totalTime = quiz.timeLimit ? quiz.timeLimit * 60 * 1000 : 0;

  // Determine question status for grid
  const getQuestionStatus = (index) => {
    if (index === currentQuestion) return 'current';
    if (markedQuestions.has(index)) return 'marked';
    if (answers[index] !== null) return 'answered';
    return 'unanswered';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blue Header Bar */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-4 sm:space-x-6 overflow-x-auto">
              <a href="/dashboard" className="hover:text-blue-200 whitespace-nowrap">Home</a>
              <a href="/quiz/generate" className="hover:text-blue-200 whitespace-nowrap">Practice Exams</a>
              <a href="#" className="hover:text-blue-200 whitespace-nowrap">LMS</a>
              <a href="#" className="hover:text-blue-200 whitespace-nowrap">Courses</a>
              <a href="#" className="hover:text-blue-200 whitespace-nowrap">Pattern</a>
              <a href="#" className="hover:text-blue-200 whitespace-nowrap">Pricing</a>
              <a href="#" className="hover:text-blue-200 whitespace-nowrap">Syllabus</a>
              <a href="#" className="hover:text-blue-200 whitespace-nowrap">About Us</a>
              <a href="#" className="hover:text-blue-200 whitespace-nowrap">Contact Us</a>
              <div className="relative group">
                <a href="#" className="hover:text-blue-200 whitespace-nowrap">More ▾</a>
              </div>
            </div>
            <div className="flex items-center space-x-3 ml-4">
              <button className="px-3 py-1 bg-blue-500 hover:bg-blue-400 rounded text-sm whitespace-nowrap">
                Create Account
              </button>
              <button className="px-3 py-1 bg-white text-blue-600 hover:bg-blue-50 rounded text-sm whitespace-nowrap">
                Sign in
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row max-w-full">
        {/* Left Content Area */}
        <div className="flex-1 bg-white p-4 sm:p-6 lg:p-8">
          {/* Question Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-800">
                REASONING : QUESTION {currentQuestion + 1} OF {quiz.questions.length}
              </h2>
              <div className="relative language-dropdown-container">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="px-3 py-1 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 text-sm flex items-center"
                >
                  {currentLanguage === 'en' ? 'English' : 'සිංහල'} ▾
                </button>
                {showLanguageDropdown && (
                  <div className="absolute right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-full">
                    <button
                      onClick={() => {
                        changeLanguage('en');
                        setShowLanguageDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
                    >
                      English
                    </button>
                    <button
                      onClick={() => {
                        changeLanguage('si');
                        setShowLanguageDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
                    >
                      සිංහල
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div className="mb-4">
            <div className="flex justify-between items-start mb-3">
              <div ref={mathContainerRef} className="text-base sm:text-lg text-gray-800 flex-1">
                <span dangerouslySetInnerHTML={{ __html: question.question }} />
              </div>
              <div className="ml-4 text-sm font-medium text-gray-600 whitespace-nowrap">
                {question.marks || 2} Mark(s)
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  currentAnswer?.selectedAnswer === index
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  value={index}
                  checked={currentAnswer?.selectedAnswer === index}
                  onChange={() => handleAnswerSelect(index)}
                  className="mt-1 mr-3 text-green-600 focus:ring-green-500 flex-shrink-0"
                />
                <span className="text-sm sm:text-base text-gray-800 flex-1" dangerouslySetInnerHTML={{ __html: option }} />
              </label>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded font-medium text-sm"
            >
              &lt; PREVIOUS
            </button>
            <button
              onClick={handleMarkForReview}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium text-sm"
            >
              MARK FOR REVIEW & NEXT
            </button>
            <button
              onClick={handleNext}
              disabled={currentQuestion === quiz.questions.length - 1}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded font-medium text-sm"
            >
              NEXT &gt;
            </button>
            <button
              onClick={handleClearAnswer}
              className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded font-medium text-sm"
            >
              CLEAR ANSWER
            </button>
            <button
              onClick={handleFinish}
              disabled={submitting}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded font-medium text-sm"
            >
              FINISH
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 bg-gray-100 p-4 sm:p-6 border-l border-gray-200">
          {/* Time Status */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Time Status</h3>
            {timeRemaining !== null ? (
              <>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-xs text-gray-600">
                  Total Time: {formatTime(totalTime)}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-600">No time limit</div>
            )}
          </div>

          {/* Question Navigation Grid */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">REASONING</h3>
            <div className="text-xs text-gray-600 mb-3">Maths Category Category</div>
            <div className="grid grid-cols-6 gap-2">
              {quiz.questions.map((_, index) => {
                const status = getQuestionStatus(index);
                const bgColor = 
                  status === 'current' ? 'bg-blue-600 text-white border-2 border-blue-800' :
                  status === 'marked' ? 'bg-blue-500 text-white' :
                  status === 'answered' ? 'bg-green-500 text-white' :
                  'bg-gray-600 text-white';
                
                return (
                  <button
                    key={index}
                    onClick={() => handleQuestionClick(index)}
                    className={`w-10 h-10 rounded text-sm font-medium hover:opacity-80 transition-opacity ${bgColor}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="text-green-600">
                {answeredCount} Answered
              </div>
              <div className="text-blue-600">
                {markedCount} Marked
              </div>
              <div className="text-gray-600">
                {quiz.questions.length - answeredCount} Not Answered
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default QuizTaking;
