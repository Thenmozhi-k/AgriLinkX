import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import api from '../../services/api';

const MutualConnections = ({ userId, currentUserId }) => {
  const [mutualConnections, setMutualConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchMutualConnections = async () => {
      if (!userId || !currentUserId || userId === currentUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/connections/mutual/${userId}`);
        setMutualConnections(response.data.mutualConnections || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching mutual connections:', err);
        setError('Failed to load mutual connections');
        setLoading(false);
      }
    };

    fetchMutualConnections();
  }, [userId, currentUserId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!mutualConnections.length) {
    return null;
  }

  const displayConnections = showAll 
    ? mutualConnections 
    : mutualConnections.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
      <div className="flex items-center mb-3">
        <Users className="h-5 w-5 text-gray-500 mr-2" />
        <h3 className="text-md font-medium text-gray-900">
          {mutualConnections.length} Mutual Connection{mutualConnections.length !== 1 ? 's' : ''}
        </h3>
      </div>
      
      <div className="space-y-3">
        {displayConnections.map(connection => (
          <div key={connection._id || connection.id} className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
              {connection.avatar ? (
                <img 
                  src={connection.avatar} 
                  alt={connection.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 font-medium">
                  {connection.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <Link 
                to={`/profile/${connection._id || connection.id}`}
                className="text-sm font-medium text-gray-900 hover:text-primary-600"
              >
                {connection.name}
              </Link>
              <p className="text-xs text-gray-500 capitalize">{connection.role || 'User'}</p>
            </div>
          </div>
        ))}
      </div>
      
      {mutualConnections.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm text-primary-600 hover:text-primary-800 font-medium"
        >
          {showAll ? 'Show less' : `See all ${mutualConnections.length} mutual connections`}
        </button>
      )}
    </div>
  );
};

export default MutualConnections;