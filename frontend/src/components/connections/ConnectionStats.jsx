import React from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck } from 'lucide-react';

const ConnectionStats = ({ followers, following, userId }) => {

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Connection Statistics</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Followers Card */}
        <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
          <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mb-3">
            <Users className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{followers?.length || 0}</h3>
          <p className="text-gray-600 mb-3">Followers</p>
          <Link 
            to="#followers"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('[data-tab="followers"]').click();
            }}
            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
          >
            View all followers
          </Link>
        </div>
        
        {/* Following Card */}
        <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
          <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mb-3">
            <UserCheck className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{following?.length || 0}</h3>
          <p className="text-gray-600 mb-3">Following</p>
          <Link 
            to="#following"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('[data-tab="following"]').click();
            }}
            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
          >
            View all following
          </Link>
        </div>
      </div>
      
      {/* Network Growth */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Network Growth</h3>
        <div className="bg-gray-100 rounded-full h-4 w-full overflow-hidden">
          <div 
            className="bg-primary-600 h-full rounded-full" 
            style={{ width: `${Math.min(100, ((followers?.length || 0) / 100) * 100)}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {followers?.length || 0} out of 100 followers goal
        </p>
      </div>
    </div>
  );
};

export default ConnectionStats;