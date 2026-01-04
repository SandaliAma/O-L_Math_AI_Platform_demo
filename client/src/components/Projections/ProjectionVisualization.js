import React, { useState, useEffect } from 'react';
import { ChartBarIcon, DocumentTextIcon, PlayIcon } from '@heroicons/react/24/outline';
import { projectionsAPI } from '../../utils/api';
import { useTranslation } from '../../hooks/useTranslation';

const ProjectionVisualization = () => {
  const { t } = useTranslation();
  const [report, setReport] = useState(null);
  const [visualizations, setVisualizations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReport();
    loadVisualizations();
  }, []);

  const loadReport = async () => {
    try {
      const response = await projectionsAPI.getReport();
      if (response.data.success) {
        setReport(response.data.report);
      }
    } catch (err) {
      console.error('Error loading report:', err);
    }
  };

  const loadVisualizations = async () => {
    try {
      const response = await projectionsAPI.getVisualizations();
      if (response.data.success) {
        setVisualizations(response.data.visualizations);
      }
    } catch (err) {
      console.error('Error loading visualizations:', err);
    }
  };

  const runProjection = async () => {
    setRunning(true);
    setError('');
    try {
      const response = await projectionsAPI.runProjection({
        numStudents: 100,
        numSessions: 50,
        targetTopic: 'G11_16',
        targetMastery: 0.85
      });
      
      if (response.data.success) {
        setReport(response.data.report);
        // Reload visualizations after a delay
        setTimeout(() => {
          loadVisualizations();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error running projection');
      console.error('Error running projection:', err);
    } finally {
      setRunning(false);
    }
  };

  if (!report && !visualizations) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('projections.noData', 'No Projection Data Available')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('projections.runFirst', 'Run a projection simulation to see results')}
          </p>
          <button
            onClick={runProjection}
            disabled={running}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlayIcon className="h-5 w-5" />
            {running ? t('projections.running', 'Running...') : t('projections.run', 'Run Projection')}
          </button>
          {error && (
            <div className="mt-4 text-red-600 text-sm">{error}</div>
          )}
        </div>
      </div>
    );
  }

  const kpis = report?.kpis || {};
  const projections = report?.projections || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('projections.title', 'Adaptive Learning Projections')}
          </h2>
          <button
            onClick={runProjection}
            disabled={running}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <PlayIcon className="h-5 w-5" />
            {running ? t('projections.running', 'Running...') : t('projections.rerun', 'Re-run Projection')}
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>

      {/* KPI Summary */}
      {report && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {t('projections.kpiSummary', 'Key Performance Indicators')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Learning Gain */}
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                {t('projections.learningGain', 'Learning Gain')}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Baseline</span>
                  <span className="text-sm font-semibold">
                    {(kpis.learning_gain?.baseline * 100 || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">DKT</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {(kpis.learning_gain?.dkt * 100 || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">DKT + XAI</span>
                  <span className="text-sm font-semibold text-green-600">
                    {(kpis.learning_gain?.dkt_xai * 100 || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Efficiency */}
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                {t('projections.efficiency', 'Efficiency')}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Baseline</span>
                  <span className="text-sm font-semibold">
                    {kpis.efficiency?.baseline?.toFixed(1) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">DKT</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {kpis.efficiency?.dkt?.toFixed(1) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">DKT + XAI</span>
                  <span className="text-sm font-semibold text-green-600">
                    {kpis.efficiency?.dkt_xai?.toFixed(1) || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Engagement */}
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                {t('projections.engagement', 'Engagement Rate')}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Baseline</span>
                  <span className="text-sm font-semibold">
                    {(kpis.engagement_rate?.baseline * 100 || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">DKT</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {(kpis.engagement_rate?.dkt * 100 || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">DKT + XAI</span>
                  <span className="text-sm font-semibold text-green-600">
                    {(kpis.engagement_rate?.dkt_xai * 100 || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visualizations */}
      {visualizations && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {t('projections.visualizations', 'Visualizations')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(visualizations).map(([filename, url]) => (
              <div key={filename} className="border rounded-lg overflow-hidden">
                {url ? (
                  <img
                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/projections/visualization/${filename}`}
                    alt={filename}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    <DocumentTextIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">{filename} not available</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectionVisualization;

