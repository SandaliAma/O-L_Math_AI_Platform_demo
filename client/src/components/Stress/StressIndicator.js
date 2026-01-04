import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { stressAPI } from '../../utils/api';
import { useTranslation } from '../../hooks/useTranslation';

const StressIndicator = ({ userId }) => {
  const { t } = useTranslation();
  const [stressData, setStressData] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Analyze stress periodically (every 30 minutes)
    analyzeStress();
    const interval = setInterval(analyzeStress, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const analyzeStress = async () => {
    try {
      // Track time spent (this would ideally be tracked from user activity)
      const timeSpentToday = 0; // Placeholder - should be calculated from session data

      const response = await stressAPI.analyze({
        timeSpentToday
      });

      if (response.data.success) {
        setStressData(response.data);
      }
    } catch (error) {
      console.error('Error analyzing stress:', error);
    }
  };

  if (!stressData) {
    return null;
  }

  const stressLevel = stressData.stressLevel || 0;
  const isHighStress = stressLevel > 70;
  const isModerateStress = stressLevel > 50 && stressLevel <= 70;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
      <div
        className={`rounded-xl shadow-lg p-4 max-w-sm ${
          isHighStress ? 'bg-red-50 border-2 border-red-300' :
          isModerateStress ? 'bg-yellow-50 border-2 border-yellow-300' :
          'bg-green-50 border-2 border-green-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {isHighStress ? (
              <ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 mr-2" />
            ) : (
              <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-2" />
            )}
            <span className="font-semibold text-gray-900 text-sm sm:text-base">{t('stress.stressLevel')}</span>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {showDetails ? t('stress.hide') : t('stress.show')}
          </button>
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-xs sm:text-sm mb-1">
            <span className="text-gray-600">{t('stress.currentLevel')}</span>
            <span className={`font-bold ${
              isHighStress ? 'text-red-600' :
              isModerateStress ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {Math.round(stressLevel)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isHighStress ? 'bg-red-500' :
                isModerateStress ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${stressLevel}%` }}
            ></div>
          </div>
        </div>

        {showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-300">
            <p className="text-xs sm:text-sm text-gray-700 mb-2">
              <strong>{t('stress.recommendation')}:</strong> {stressData.recommendation}
            </p>
            <p className="text-xs sm:text-sm text-gray-700">
              <strong>{t('stress.message')}:</strong> {stressData.motivationalMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StressIndicator;


