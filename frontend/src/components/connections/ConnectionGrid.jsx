import React from 'react';
import { Link } from 'react-router-dom';
import { UserMinus, UserPlus, UserCheck, UserX } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const ConnectionGrid = ({ 
  users, 
  type, 
  onFollow, 
  onUnfollow, 
  onAccept, 
  onReject,
  processingActions,
  emptyMessage,
  searchTerm
}) => {
  console.log(JSON.stringify(users + 'usersss'))
  if (!users || users.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          {type === 'followers' && <UserCheck className="h-10 w-10 text-gray-500" />}
          {type === 'following' && <UserPlus className="h-10 w-10 text-gray-500" />}
          {type === 'suggestions' && <UserPlus className="h-10 w-10 text-gray-500" />}
          {type === 'requests' && <UserCheck className="h-10 w-10 text-gray-500" />}
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          {emptyMessage || `No ${type} found`}
        </h3>
        <p className="text-gray-600">
          {searchTerm ? 'Try a different search term' : ''}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map(user => {
        const userId = user.id || user._id;
        const userName = user.name || 'User';
        const userRole = user.role || 'User';
        const userAvatar = user.avatar;
        const isProcessing = processingActions && processingActions[userId];
        
        return (
          <div key={userId} className="bg-white rounded-lg shadow-sm p-4 flex items-start hover:shadow-md transition-shadow duration-200">
            <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 font-medium text-xl">
                  {userName.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-lg truncate">{userName}</h4>
              <p className="text-gray-600 capitalize mb-1 truncate">{userRole}</p>
              {user.bio && (
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">{user.bio}</p>
              )}
              
              <div className="flex flex-wrap gap-2 mt-3">
                <Link 
                  to={`/profile/${userId}`}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-md transition-colors duration-200 flex items-center"
                >
                  View Profile
                </Link>
                
                {type === 'followers' && (
                  <Link 
                    to={`/messages/${userId}`}
                    className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-md transition-colors duration-200 flex items-center"
                  >
                    Message
                  </Link>
                )}
                
                {type === 'following' && onUnfollow && (
                  <button 
                    onClick={() => onUnfollow(userId)}
                    disabled={isProcessing}
                    className="flex items-center px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-md transition-colors duration-200"
                  >
                    {isProcessing ? (
                      <LoadingSpinner size="sm" className="mr-1" />
                    ) : (
                      <UserMinus className="h-4 w-4 mr-1" />
                    )}
                    Unfollow
                  </button>
                )}
                
                {type === 'suggestions' && onFollow && (
                  <button
                    onClick={() => onFollow(userId)}
                    disabled={isProcessing}
                    className="flex items-center px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-md transition-colors duration-200"
                  >
                    {isProcessing ? (
                      <LoadingSpinner size="sm" color="white" className="mr-1" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-1" />
                    )}
                    Follow
                  </button>
                )}
                
                {type === 'requests' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onAccept(userId)}
                      disabled={isProcessing}
                      className="flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors duration-200"
                    >
                      {isProcessing ? (
                        <LoadingSpinner size="sm" color="white" className="mr-1" />
                      ) : (
                        <UserCheck className="h-4 w-4 mr-1" />
                      )}
                      Accept
                    </button>
                    <button 
                      onClick={() => onReject(userId)}
                      disabled={isProcessing}
                      className="flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors duration-200"
                    >
                      {isProcessing ? (
                        <LoadingSpinner size="sm" color="white" className="mr-1" />
                      ) : (
                        <UserX className="h-4 w-4 mr-1" />
                      )}
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConnectionGrid;