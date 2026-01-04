import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../../utils/api';
import { useTranslation } from '../../hooks/useTranslation';
import Button from '../UI/Button';

const QuizGenerator = ({ user }) => {
  const { t, isSinhala, currentLanguage } = useTranslation();
  const [formData, setFormData] = useState({
    type: 'adaptive',
    topic: '',
    difficulty: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [topicsData, setTopicsData] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const navigate = useNavigate();

  // Fetch topics from database
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoadingTopics(true);
        const response = await quizAPI.getTopics();
        console.log('Topics response:', response.data); // Debug log
        if (response.data && response.data.success) {
          setTopicsData(response.data.topics || []);
        } else {
          console.error('Topics response not successful:', response.data);
          setTopicsData([{ value: '', label: 'All Topics', labelSinhala: 'සියලුම මාතෘකා' }]);
        }
      } catch (err) {
        console.error('Error fetching topics:', err);
        console.error('Error details:', err.response?.data || err.message);
        // Fallback to empty topics array (will show "All Topics" option)
        setTopicsData([{ value: '', label: 'All Topics', labelSinhala: 'සියලුම මාතෘකා' }]);
      } finally {
        setLoadingTopics(false);
      }
    };

    fetchTopics();
  }, []);

  // Get display labels based on current language - recalculate when language changes
  const topics = useMemo(() => {
    return topicsData.map(topic => {
      // For "All Topics" option, use translation
      if (topic.value === '') {
        return {
          ...topic,
          displayLabel: t('quiz.allTopics')
        };
      }
      // For other topics, use Sinhala if available and language is Sinhala
      return {
        ...topic,
        displayLabel: isSinhala && topic.labelSinhala ? topic.labelSinhala : (topic.label || topic.topicName || '')
      };
    });
  }, [topicsData, isSinhala, t]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const params = {};
      if (formData.type) params.type = formData.type;
      if (formData.topic) params.topic = formData.topic;
      if (formData.difficulty) params.difficulty = formData.difficulty;

      const response = await quizAPI.generate(params);
      
      if (response.data.success) {
        navigate(`/quiz/take/${response.data.quiz.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || t('quiz.failedToGenerate'));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateModelPaper = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await quizAPI.getModelPaper();
      
      if (response.data.success) {
        navigate(`/quiz/take/${response.data.quiz.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || t('quiz.failedToGenerateModelPaper'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="card shadow-xl p-4 sm:p-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-dominant-900 dark:text-dominant-50 mb-4 sm:mb-6 break-words flex items-center gap-2">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-accent-500 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {t('quiz.quizGenerator')}
        </h1>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Adaptive Quiz Form */}
          <div className="card border-2 border-dashed border-dominant-300 dark:border-dominant-700 hover:border-accent-400 dark:hover:border-accent-600 transition-all">
            <h2 className="text-xl font-semibold text-dominant-900 dark:text-dominant-50 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-dominant-600 dark:text-dominant-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {t('quiz.adaptiveQuiz')}
            </h2>
            <p className="text-sm text-dominant-600 dark:text-dominant-400 mb-4">
              {t('quiz.personalizedQuestions')}
            </p>
            <form onSubmit={handleGenerate}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="topic" className="block text-sm font-medium text-dominant-700 dark:text-dominant-300 mb-2">
                    {t('quiz.topicOptional')}
                  </label>
                  <select
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    disabled={loadingTopics}
                    className="input disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingTopics ? (
                      <option value="">{t('common.loading')}...</option>
                    ) : (
                      topics.map(topic => (
                        <option key={topic.value} value={topic.value}>
                          {topic.displayLabel}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-dominant-700 dark:text-dominant-300 mb-2">
                    {t('quiz.difficulty')}
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="easy">{t('quiz.easy')}</option>
                    <option value="medium">{t('quiz.medium')}</option>
                    <option value="hard">{t('quiz.hard')}</option>
                    <option value="mixed">{t('quiz.mixed')}</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  fullWidth
                >
                  {loading ? t('quiz.generating') : t('quiz.generateQuiz')}
                </Button>
              </div>
            </form>
          </div>

          {/* Model Paper */}
          <div className="card border-2 border-dashed border-accent-300 dark:border-accent-700 bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/30 dark:to-accent-800/30 hover:shadow-lg transition-all">
            <h2 className="text-xl font-semibold text-dominant-900 dark:text-dominant-50 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('quiz.modelPaper')}
            </h2>
            <p className="text-sm text-dominant-600 dark:text-dominant-400 mb-4">
              {t('quiz.fullExamDescription')}
            </p>
            <Button
              onClick={handleGenerateModelPaper}
              variant="primary"
              disabled={loading}
              fullWidth
            >
              {loading ? t('quiz.generating') : t('quiz.generateModelPaper')}
            </Button>
          </div>
        </div>

        {/* Quiz History */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-semibold text-dominant-900 dark:text-dominant-50 mb-3 sm:mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-dominant-600 dark:text-dominant-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('quiz.quizHistory')}
          </h2>
          <QuizHistoryList />
        </div>
      </div>
    </div>
  );
};

const QuizHistoryList = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await quizAPI.getHistory();
        if (response.data.success) {
          setHistory(response.data.quizzes);
        }
      } catch (error) {
        console.error('Error fetching quiz history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return <p className="text-dominant-500 dark:text-dominant-400 text-sm sm:text-base">{t('common.loading')}</p>;
  }

  if (history.length === 0) {
    return <p className="text-dominant-500 dark:text-dominant-400 text-sm sm:text-base">{t('progress.noQuizHistory')}</p>;
  }

  return (
    <div className="space-y-2">
      {history.slice(0, 5).map((quiz, idx) => (
        <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 p-3 bg-dominant-50 dark:bg-dominant-900 rounded-lg hover:bg-dominant-100 dark:hover:bg-dominant-800 transition-colors border border-dominant-200 dark:border-dominant-700">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-xs sm:text-sm truncate text-dominant-900 dark:text-dominant-50">{quiz.type.replace('-', ' ').toUpperCase()}</p>
            <p className="text-xs sm:text-sm text-dominant-600 dark:text-dominant-400">
              {new Date(quiz.timeStarted || quiz.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex-shrink-0">
            {quiz.status === 'completed' && quiz.score ? (
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                quiz.score.percentage >= 70 ? 'bg-success-100 dark:bg-success-900/50 text-success-800 dark:text-success-300' :
                quiz.score.percentage >= 50 ? 'bg-secondary-100 dark:bg-secondary-900/50 text-secondary-800 dark:text-secondary-300' :
                'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
              }`}>
                {quiz.score.percentage.toFixed(1)}%
              </span>
            ) : (
              <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-dominant-200 dark:bg-dominant-700 text-dominant-700 dark:text-dominant-300">
                {quiz.status}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuizGenerator;


