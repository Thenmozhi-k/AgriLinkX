import { useState, useEffect, useRef } from 'react';
import { X, Search, Share2, Check, Users } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShareConnections, sharePostWithUsers, searchUsers } from '../../features/posts/postsSlice';

const SharePostModal = ({ postId, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { shareConnections, searchResults, isLoading } = useSelector(state => state.posts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchShareConnections());
    }
  }, [isOpen, dispatch]);
  
  useEffect(() => {
    // Reset selections when modal is closed
    if (!isOpen) {
      setSelectedUsers([]);
      setSearchTerm('');
      setIsSearching(false);
    }
  }, [isOpen]);
  
  useEffect(() => {
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (searchTerm.trim().length > 0) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        dispatch(searchUsers(searchTerm));
      }, 500);
    } else {
      setIsSearching(false);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, dispatch]);
  
  if (!isOpen) return null;
  
  const handleToggleUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  const handleSharePost = () => {
    if (selectedUsers.length > 0) {
      dispatch(sharePostWithUsers({ postId, userIds: selectedUsers }));
      onClose();
    }
  };
  
  // Display search results if searching, otherwise show connections
  const displayUsers = isSearching ? searchResults : shareConnections;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">Share Post</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="p-3 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users to share with"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-center mt-2 text-xs text-gray-500">
            {isSearching ? (
              <span>Searching all users...</span>
            ) : (
              <span className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                Showing your connections
              </span>
            )}
          </div>
        </div>
        
        {/* Connections/Search Results List */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : displayUsers.length > 0 ? (
            <ul className="space-y-2">
              {displayUsers.map((user) => (
                <li 
                  key={user._id} 
                  className={`flex items-center p-2 rounded-lg cursor-pointer ${
                    selectedUsers.includes(user._id) ? 'bg-primary-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleToggleUser(user._id)}
                >
                  {/* User Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 font-medium">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{user.name}</h4>
                    {user.role && (
                      <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                    )}
                  </div>
                  
                  {/* Selection Indicator */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    selectedUsers.includes(user._id) 
                      ? 'bg-primary-600 text-white' 
                      : 'border border-gray-300'
                  }`}>
                    {selectedUsers.includes(user._id) && <Check className="h-4 w-4" />}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              {isSearching ? (
                <p>No users found matching "{searchTerm}"</p>
              ) : (
                <p>You don't have any connections yet</p>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={handleSharePost}
            disabled={selectedUsers.length === 0 || isLoading}
            className={`w-full py-2 rounded-lg flex items-center justify-center ${
              selectedUsers.length === 0 || isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Share2 className="h-5 w-5 mr-2" />
                Share with {selectedUsers.length} {selectedUsers.length === 1 ? 'user' : 'users'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharePostModal;