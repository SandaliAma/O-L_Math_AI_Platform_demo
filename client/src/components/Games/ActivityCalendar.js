import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { gamesAPI } from '../../utils/api';
import { CalendarIcon, FireIcon } from '@heroicons/react/24/solid';

const ActivityCalendar = ({ userId }) => {
  const { t } = useTranslation();
  const [activityData, setActivityData] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchActivity();
    }
  }, [userId]);

  const fetchActivity = async () => {
    try {
      const response = await gamesAPI.getActivityLog();
      if (response.data.success) {
        const rawLog = response.data.activityLog || [];
        const activities = rawLog.map(item => ({
          date: new Date(item.date),
          hasActivity: (item.quizzes || 0) > 0 || (item.games || 0) > 0 || (item.posts || 0) > 0,
          quizzes: item.quizzes || 0,
          games: item.games || 0,
          posts: item.posts || 0
        }));
        setActivityData(activities);
        calculateStreak(activities);
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (activities) => {
    const sortedActivities = activities
      .filter(a => a.hasActivity)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    if (sortedActivities.length === 0) {
      setCurrentStreak(0);
      return;
    }

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentDate = new Date(today);

    // Check if today is active
    const todayActivity = sortedActivities.find(a => {
      const activityDate = new Date(a.date);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === currentDate.getTime();
    });

    if (!todayActivity) {
      // If not active today, start from yesterday
      currentDate.setDate(currentDate.getDate() - 1);
    }

    for (const activity of sortedActivities) {
      const activityDate = new Date(activity.date);
      activityDate.setHours(0, 0, 0, 0);
      
      if (activityDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (activityDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    setCurrentStreak(streak);
  };

  const getIntensity = (activity) => {
    if (!activity.hasActivity) return 0;
    const totalActivity = (activity.quizzes || 0) + (activity.games || 0) + (activity.posts || 0);
    if (totalActivity >= 5) return 4;
    if (totalActivity >= 3) return 3;
    if (totalActivity >= 2) return 2;
    return 1;
  };

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 4: return 'bg-green-600';
      case 3: return 'bg-green-500';
      case 2: return 'bg-green-400';
      case 1: return 'bg-green-300';
      default: return 'bg-gray-200';
    }
  };

  // Generate last 30 days
  const generateDays = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const activity = activityData.find(a => {
        const activityDate = new Date(a.date);
        activityDate.setHours(0, 0, 0, 0);
        return activityDate.getTime() === date.getTime();
      });
      
      days.push({
        date,
        activity: activity || { hasActivity: false, quizzes: 0, games: 0, posts: 0 }
      });
    }
    
    return days;
  };

  const days = generateDays();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <p className="text-center text-sm sm:text-base text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600 flex-shrink-0" />
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{t('games.activityCalendar')}</h2>
        </div>
        {currentStreak > 0 && (
          <div className="flex items-center gap-2 bg-orange-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
            <FireIcon className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-orange-800 font-semibold whitespace-nowrap">
              {currentStreak} {t('games.streak')}
            </span>
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 py-1 sm:py-2 hidden sm:block">
            {day.substring(0, 1)}
          </div>
        ))}
        {days.map((day, index) => {
          const intensity = getIntensity(day.activity);
          const color = getIntensityColor(intensity);
          
          return (
            <div
              key={index}
              className={`aspect-square rounded-sm ${color} flex items-center justify-center text-xs font-semibold text-white hover:scale-110 transition-transform cursor-pointer relative group touch-manipulation`}
              title={`${day.date.toLocaleDateString()}: ${day.activity.quizzes} ${t('games.quizzes')}, ${day.activity.games} ${t('games.games')}, ${day.activity.posts} ${t('games.posts')}`}
            >
              <span className="hidden sm:inline">{day.date.getDate()}</span>
              <span className="sm:hidden text-[10px]">{day.date.getDate()}</span>
              {day.activity.hasActivity && (
                <div className="absolute -top-0.5 -right-0.5 bg-yellow-400 rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs text-gray-600 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
        <span className="hidden sm:inline">{t('games.less')}</span>
        <div className="flex gap-0.5 sm:gap-1">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-gray-200"></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-green-300"></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-green-400"></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-green-500"></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-green-600"></div>
        </div>
        <span className="hidden sm:inline">{t('games.more')}</span>
      </div>

      {/* Stats Summary */}
      <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-dominant-700">
        <div className="text-center">
          <p className="text-lg sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
            {activityData.filter(a => a.hasActivity).length}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('games.activeDays')}</p>
        </div>
        <div className="text-center">
          <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">{currentStreak}</p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('games.currentStreak')} ({t('games.days')})</p>
        </div>
        <div className="text-center">
          <p className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
            {activityData.reduce((sum, a) => sum + (a.quizzes || 0) + (a.games || 0) + (a.posts || 0), 0)}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('games.totalActivities')}</p>
        </div>
      </div>
    </div>
  );
};

export default ActivityCalendar;

