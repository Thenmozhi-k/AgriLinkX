import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuggestions, followUser } from '../../features/user/userSlice';
import { Plus, X } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const ConnectionSuggestions = () => {
  const dispatch = useDispatch();
  const { profile, isLoading } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchSuggestions());
  }, [dispatch]);

  const handleFollow = (userId) => {
    dispatch(followUser(userId));
  };

  if (isLoading && profile.suggestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-gray-900 mb-4">People You May Know</h3>
        <div className="flex justify-center py-4">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (profile.suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">People You May Know</h3>
        <button className="text-primary-600 text-sm font-medium">See All</button>
      </div>

      <div className="space-y-4">
        {profile.suggestions.map((suggestion) => (
          <div key={suggestion.id} className="flex items-start">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
              {suggestion.avatar ? (
                <img src={suggestion.avatar} alt={suggestion.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 font-medium">
                  {suggestion.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{suggestion.name}</h4>
              <p className="text-gray-500 text-sm capitalize">{suggestion.role}</p>
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handleFollow(suggestion.id)}
                  className="flex items-center px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-md"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Connect
                </button>
                <button className="flex items-center px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-md">
                  <X className="h-4 w-4 mr-1" />
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectionSuggestions;
