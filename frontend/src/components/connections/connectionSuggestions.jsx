import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuggestions } from '../../features/user/userSlice';
import { UserPlus, X } from 'lucide-react';

const ConnectionSuggestions = ({ compact = false, maxSuggestions = 3 }) => {
  const dispatch = useDispatch();
  const { profile, isLoading } = useSelector(state => state.user);
  const suggestions = profile?.suggestions || [];
  const hasFetchedRef = useRef(false);
  
  useEffect(() => {
    // Only fetch suggestions once when the component mounts
    if (!hasFetchedRef.current && !isLoading) {
      hasFetchedRef.current = true;
      dispatch(fetchSuggestions());
    }
  }, [dispatch, isLoading]);
  
  // Add some console logs to debug
  console.log('ConnectionSuggestions - Redux state:', { profile, isLoading, suggestions });
  
  const displaySuggestions = suggestions.slice(0, maxSuggestions);
  
  if (compact) {
    return (
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500">Loading suggestions...</p>
          </div>
        ) : !displaySuggestions || displaySuggestions.length === 0 ? (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500">No suggestions available</p>
          </div>
        ) : (
          displaySuggestions.map(user => (
            <div key={user.id || user._id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                  <img 
                    src={user.avatar || 'https://via.placeholder.com/40'} 
                    alt={user.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-800">{user.name}</h4>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </div>
              <button className="text-primary-600 hover:text-primary-700 p-1">
                <UserPlus className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
        
        {!isLoading && displaySuggestions && displaySuggestions.length > 0 && (
          <div className="text-center pt-2">
            <a href="#" className="text-xs text-primary-600 hover:underline">
              View all suggestions
            </a>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-semibold text-gray-800 mb-4">People You May Know</h3>
      
      {isLoading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading suggestions...</p>
        </div>
      ) : !suggestions || suggestions.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500">No suggestions available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map(user => (
            <div key={user.id || user._id} className="flex items-start">
              <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
                <img 
                  src={user.avatar || 'https://via.placeholder.com/100'} 
                  alt={user.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{user.name}</h4>
                <p className="text-sm text-gray-500 truncate">{user.role}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {user.mutualConnections || 0} mutual connections
                </p>
              </div>
              <div className="ml-2 flex flex-col space-y-2">
                <button className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-md flex items-center">
                  <UserPlus className="h-3 w-3 mr-1" />
                  <span>Connect</span>
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600 self-end">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!isLoading && suggestions && suggestions.length > 0 && (
        <div className="mt-4 text-center">
          <a href="#" className="text-primary-600 hover:underline text-sm">
            View all suggestions
          </a>
        </div>
      )}
    </div>
  );
};

export default ConnectionSuggestions;