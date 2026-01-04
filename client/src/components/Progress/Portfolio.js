import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { progressAPI } from '../../utils/api';
import { useTranslation } from '../../hooks/useTranslation';
import Button from '../UI/Button';
import { generatePortfolioPDF } from '../../utils/pdfGenerator';

const Portfolio = ({ user }) => {
  const { t } = useTranslation();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await progressAPI.getPortfolio();
      if (response.data.success) {
        setPortfolio(response.data.portfolio);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (portfolio) {
      generatePortfolioPDF(portfolio, t);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">{t('loading')}</div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Failed to generate portfolio
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Link
          to="/progress"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm sm:text-base"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          {t('forum.backToForum')}
        </Link>
        <Button
          onClick={handleDownload}
          variant="primary"
          className="inline-flex items-center"
        >
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          {t('portfolio.downloadPortfolio')}
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
          {t('portfolio.portfolioTitle')}
        </h1>

        {/* Student Information */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">
            {t('portfolio.studentInformation')}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">{t('name')}</p>
              <p className="text-lg font-medium text-gray-900">{portfolio.studentInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('portfolio.studentId')}</p>
              <p className="text-lg font-medium text-gray-900">{portfolio.studentInfo.studentId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('portfolio.school')}</p>
              <p className="text-lg font-medium text-gray-900">{portfolio.studentInfo.school}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('portfolio.district')}</p>
              <p className="text-lg font-medium text-gray-900">{portfolio.studentInfo.district}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('portfolio.grade')}</p>
              <p className="text-lg font-medium text-gray-900">{portfolio.studentInfo.grade}</p>
            </div>
          </div>
        </section>

        {/* Academic Summary */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">
            {t('portfolio.academicSummary')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-primary-50 p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">{t('portfolio.totalQuizzes')}</p>
              <p className="text-2xl font-bold text-primary-900">
                {portfolio.academicSummary.totalQuizzes}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">{t('portfolio.averageScore')}</p>
              <p className="text-2xl font-bold text-green-900">
                {portfolio.academicSummary.averageScore}%
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">{t('portfolio.bestScore')}</p>
              <p className="text-2xl font-bold text-yellow-900">
                {portfolio.academicSummary.bestScore}%
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Model Papers</p>
              <p className="text-2xl font-bold text-purple-900">
                {portfolio.academicSummary.modelPapersCompleted}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Adaptive Quizzes</p>
              <p className="text-2xl font-bold text-blue-900">
                {portfolio.academicSummary.adaptiveQuizzesCompleted}
              </p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Time Spent</p>
              <p className="text-2xl font-bold text-indigo-900">
                {portfolio.academicSummary.totalTimeSpent} min
              </p>
            </div>
          </div>
        </section>

        {/* Badges */}
        {portfolio.badges.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">
              Badges Earned
            </h2>
            <div className="flex flex-wrap gap-3">
              {portfolio.badges.map((badge, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-medium"
                >
                  🏆 {badge.toUpperCase()}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Strengths */}
        {portfolio.strengths.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">
              Strengths
            </h2>
            <ul className="list-disc list-inside space-y-2">
              {portfolio.strengths.map((strength, idx) => (
                <li key={idx} className="text-lg text-gray-700">
                  {strength}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Areas for Improvement */}
        {portfolio.areasForImprovement.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">
              Areas for Improvement
            </h2>
            <ul className="list-disc list-inside space-y-2">
              {portfolio.areasForImprovement.map((area, idx) => (
                <li key={idx} className="text-lg text-gray-700">
                  {area}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Topic Mastery */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">
            Topic Mastery
          </h2>
          <div className="space-y-4">
            {portfolio.topicMastery.slice(0, 10).map((topic, idx) => (
              <div key={idx} className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{topic.topic}</span>
                  <span className="text-sm text-gray-600">
                    {Math.round(topic.mastery)}% ({topic.questionsAttempted} questions)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
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
        </section>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
          Generated on {new Date(portfolio.generatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;


