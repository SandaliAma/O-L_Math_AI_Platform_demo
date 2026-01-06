import React, { useState } from 'react';
import MathGame from './MathGame';
import NumberSequenceGame from './NumberSequenceGame';
import AlgebraSolverGame from './AlgebraSolverGame';
import GeometryPuzzleGame from './GeometryPuzzleGame';
import ActivityCalendar from './ActivityCalendar';
import { useTranslation } from '../../hooks/useTranslation';
import { PlayIcon, CalculatorIcon, PuzzlePieceIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const GameDashboard = ({ user }) => {
  const { t } = useTranslation();
  const [selectedGame, setSelectedGame] = useState('quick-math');

  const games = [
    { id: 'quick-math', name: t('games.quickMath'), icon: CalculatorIcon, component: MathGame },
    { id: 'number-sequence', name: t('games.numberSequence'), icon: ChartBarIcon, component: NumberSequenceGame },
    { id: 'algebra-solver', name: t('games.algebraSolver'), icon: CalculatorIcon, component: AlgebraSolverGame },
    { id: 'geometry-puzzle', name: t('games.geometryPuzzle'), icon: PuzzlePieceIcon, component: GeometryPuzzleGame }
  ];

  const SelectedGameComponent = games.find(g => g.id === selectedGame)?.component || MathGame;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">{t('games.mathGames')}</h1>
        <p className="text-sm sm:text-base text-gray-600">{t('games.playAndPractice')}</p>
      </div>

      {/* Game Type Selector */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${selectedGame === game.id
                  ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                }`}
            >
              <Icon className="h-6 w-6 sm:h-8 sm:w-8 mb-2" />
              <span className="text-xs sm:text-sm font-medium text-center">{game.name}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Game Area */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <SelectedGameComponent />
        </div>

        {/* Activity Calendar */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <ActivityCalendar userId={user?._id} />
        </div>
      </div>
    </div>
  );
};

export default GameDashboard;


