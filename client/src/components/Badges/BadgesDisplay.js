import React, { useState, useEffect } from 'react';
import { badgesAPI } from '../../utils/api';
import { getBadgeIcon } from './BadgeIconMapper';
import { TrophyIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';

const BadgesDisplay = ({ userId, showAll = false }) => {
  const { t } = useTranslation();
  const [badges, setBadges] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newlyAwarded, setNewlyAwarded] = useState([]);

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      const response = await badgesAPI.getMyBadges();
      if (response.data.success) {
        setBadges(response.data);

        // Show notification for newly awarded badges
        if (response.data.newlyAwarded && response.data.newlyAwarded.length > 0) {
          setNewlyAwarded(response.data.newlyAwarded);
          setTimeout(() => setNewlyAwarded([]), 5000); // Hide after 5 seconds
        }
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  if (!badges) {
    return null;
  }

  const badgesToShow = showAll ? badges.allBadges : badges.earnedBadges;

  // Rarity colors
  const rarityColors = {
    common: 'bg-gray-100 text-gray-800 border-gray-300',
    uncommon: 'bg-green-100 text-green-800 border-green-300',
    rare: 'bg-blue-100 text-blue-800 border-blue-300',
    epic: 'bg-purple-100 text-purple-800 border-purple-300',
    legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  };

  return (
    <div className="w-full">
      {/* New Badge Notification */}
      {newlyAwarded.length > 0 && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            {getBadgeIcon(newlyAwarded[0]?.badgeId, "h-6 w-6 text-green-600 mr-2")}
            <div>
              <h4 className="font-semibold text-green-900">New Badge Earned!</h4>
              {newlyAwarded.map((badge, idx) => (
                <p key={idx} className="text-sm text-green-700">
                  <span className="mr-2 inline-block align-middle">
                    {getBadgeIcon(badge.badgeId, "w-4 h-4")}
                  </span>
                  {badge.name} - {badge.description}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Badge Stats */}
      {showAll && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Earned</p>
            <p className="text-2xl font-bold text-gray-900">{badges.totalEarned}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Available</p>
            <p className="text-2xl font-bold text-gray-900">{badges.totalAvailable}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Progress</p>
            <p className="text-2xl font-bold text-primary-600">{badges.progress}%</p>
          </div>
        </div>
      )}

      {/* Badges Grid */}
      {badgesToShow.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {badgesToShow.map((badge, idx) => (
            <div
              key={idx}
              className={`relative rounded-lg border-2 p-4 text-center transition-all ${badge.earned
                ? rarityColors[badge.rarity] || rarityColors.common
                : 'bg-gray-50 border-gray-200 opacity-50'
                } ${badge.earned ? 'hover:shadow-lg' : ''}`}
            >
              {badge.earned && (
                <div className="absolute top-1 right-1">
                  <TrophyIcon className="h-4 w-4 text-yellow-500" />
                </div>
              )}
              <div className="flex justify-center mb-2">
                {getBadgeIcon(badge.badgeId, "w-12 h-12")}
              </div>
              <h4 className="font-semibold text-sm mb-1">
                {t(`badges.${badge.badgeId}.name`, badge.name)}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-3">
                {t(`badges.${badge.badgeId}.description`, badge.description)}
              </p>
              {badge.earned && badge.earnedDate && (
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(badge.earnedDate).toLocaleDateString()}
                </p>
              )}
              {!badge.earned && (
                <div className="mt-2">
                  <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                    {badge.rarity}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <TrophyIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p>{showAll ? t('progress.noBadges') : t('progress.noBadges')}</p>
          <p className="text-sm mt-2">{t('progress.trackJourney')}</p>
        </div>
      )}
    </div>
  );
};

export default BadgesDisplay;





