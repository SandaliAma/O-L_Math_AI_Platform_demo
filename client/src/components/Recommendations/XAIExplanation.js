import React, { useState } from 'react';
import { LightBulbIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';

const XAIExplanation = ({ explanation, onClose }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!explanation) {
    return null;
  }

  // Parse explanation text (format: lines separated by \n)
  const lines = explanation.explanation?.split('\n') || [];
  const header = lines.find(line => line.includes('🎯')) || '';
  const whySection = lines.filter(line => line.includes('✅') || line.includes('•'));
  const pathSection = lines.filter(line => line.includes('📚'));

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <LightBulbIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {t('recommendations.xai.title', 'Why This Recommendation?')}
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {header && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-800 whitespace-pre-line">
            {header}
          </p>
        </div>
      )}

      {whySection.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <InformationCircleIcon className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">
              {t('recommendations.xai.reasons', 'Key Reasons:')}
            </span>
          </div>
          <ul className="space-y-1 ml-6">
            {whySection.map((line, idx) => {
              if (line.trim().startsWith('•')) {
                return (
                  <li key={idx} className="text-sm text-gray-700 list-disc">
                    {line.replace('•', '').trim()}
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      )}

      {pathSection.length > 0 && (
        <div className="bg-white rounded p-3 border border-blue-100">
          <p className="text-sm font-semibold text-gray-800 mb-1">
            {t('recommendations.xai.pathForward', 'The Path Forward:')}
          </p>
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {pathSection.join('\n').replace('📚 The Path Forward:', '').trim()}
          </p>
        </div>
      )}

      {explanation.key_factors && explanation.key_factors.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {explanation.key_factors.map((factor, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {factor}
            </span>
          ))}
        </div>
      )}

      {explanation.confidence && (
        <div className="mt-3 text-xs text-gray-500">
          {t('recommendations.xai.confidence', 'Confidence:')} {Math.round(explanation.confidence * 100)}%
        </div>
      )}
    </div>
  );
};

export default XAIExplanation;

