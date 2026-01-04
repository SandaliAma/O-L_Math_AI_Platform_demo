import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { progressAPI } from '../../utils/api';
import { useTranslation } from '../../hooks/useTranslation';
import Button from '../UI/Button';
import BadgesDisplay from '../Badges/BadgesDisplay';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ProgressTracker = ({ user }) => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await progressAPI.getDashboard();
      if (response.data.success) {
        setDashboardData(response.data.dashboard);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">{t('loading')}</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {t('errors.somethingWentWrong')}
        </div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('progress.yourProgress')}</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">{t('progress.trackJourney')}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <p className="text-sm font-medium text-gray-600">{t('dashboard.totalQuizzes')}</p>
          <p className="text-3xl font-bold text-gray-900">{dashboardData.totalQuizzes}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <p className="text-sm font-medium text-gray-600">{t('dashboard.averageScore')}</p>
          <p className="text-3xl font-bold text-gray-900">{dashboardData.averageScore.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <p className="text-sm font-medium text-gray-600">{t('dashboard.currentStreak')}</p>
          <p className="text-3xl font-bold text-gray-900">{dashboardData.currentStreak} {t('dashboard.days')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <p className="text-sm font-medium text-gray-600">{t('progress.totalTime')}</p>
          <p className="text-3xl font-bold text-gray-900">{dashboardData.totalTimeSpent} {t('progress.minutes')}</p>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{t('progress.badgesEarned')}</h2>
          <Link to="/badges" className="text-sm text-primary-600 hover:text-primary-700">
            View All →
          </Link>
        </div>
        <BadgesDisplay userId={user._id} showAll={false} />
      </div>

      {/* Topic Performance Chart */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 overflow-hidden">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">{t('progress.topicPerformance')}</h2>
        {dashboardData.topicPerformance.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.topicPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="accuracy" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">{t('dashboard.noTopicData')}</p>
        )}
      </div>

      {/* Topic Mastery */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">{t('progress.topicMastery')}</h2>
        {dashboardData.mastery && dashboardData.mastery.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {dashboardData.mastery.map((topic, idx) => (
              <div key={idx} className="mb-3 sm:mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700 truncate pr-2">{topic.topic || t('forum.unknown')}</span>
                  <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">{topic.mastery}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                  <div
                    className={`h-2 sm:h-3 rounded-full transition-all ${
                      topic.mastery >= 70 ? 'bg-green-500' :
                      topic.mastery >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${topic.mastery}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm sm:text-base text-gray-500">{t('progress.noMasteryData')}</p>
        )}
      </div>

      {/* Recent Quizzes Table */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">{t('progress.recentQuizResults')}</h2>
        {dashboardData.recentQuizzes.length > 0 ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle sm:px-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.date')}</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.type')}</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.score')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.recentQuizzes.map((quiz, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {new Date(quiz.date).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {quiz.type.replace('-', ' ').toUpperCase()}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                        <span className={`px-2 sm:px-3 py-1 rounded-full font-semibold ${
                          quiz.score >= 70 ? 'bg-green-100 text-green-800' :
                          quiz.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {quiz.score.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-sm sm:text-base text-gray-500">{t('progress.noQuizHistory')}</p>
        )}
      </div>

      {/* Portfolio Link */}
      <div className="mt-6 sm:mt-8 text-center">
        <Link to="/portfolio">
          <Button variant="primary" size="lg">
            {t('progress.viewPortfolio')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProgressTracker;


