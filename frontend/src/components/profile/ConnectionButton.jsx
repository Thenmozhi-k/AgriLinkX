import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserPlus, UserCheck, UserMinus, Loader } from 'lucide-react';
import { 
  followUser, 
  unfollowUser, 
  checkFollowingStatus 
} from '../../features/user/userSlice';

const ConnectionButton = ({ userId, size = 'md', className = '' }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [followStatus, setFollowStatus] = useState({
    isFollowing: false,
    hasRequestedToFollow: false,
    connectionStatus: null,
    isLoading: true,
    isRequesting: false
  });
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!userId || !user || userId === user.id) return;
      
      try {
        setFollowStatus(prev => ({ ...prev, isLoading: true }));
        const result = await dispatch(checkFollowingStatus(userId)).unwrap();
        setFollowStatus({
          isFollowing: result.isFollowing,
          hasRequestedToFollow: result.hasRequestedToFollow,
          connectionStatus: result.connectionStatus,
          isLoading: false,
          isRequesting: false
        });
      } catch (error) {
        console.error('Error checking follow status:', error);
        setFollowStatus(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    checkFollowStatus();
  }, [dispatch, userId, user]);

  const handleFollowToggle = async () => {
    if (!userId || !user) return;
    
    if (followStatus.isFollowing || followStatus.connectionStatus === 'following' || 
        followStatus.hasRequestedToFollow || followStatus.connectionStatus === 'requested') {
      setFollowStatus(prev => ({ ...prev, isLoading: true }));
      
      try {
        await dispatch(unfollowUser(userId)).unwrap();
        
        const updatedStatus = await dispatch(checkFollowingStatus(userId)).unwrap();
        setFollowStatus({
          isFollowing: updatedStatus.isFollowing,
          hasRequestedToFollow: updatedStatus.hasRequestedToFollow,
          connectionStatus: updatedStatus.connectionStatus,
          isLoading: false,
          isRequesting: false
        });
      } catch (error) {
        console.error('Error unfollowing user:', error);
        setFollowStatus(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setFollowStatus(prev => ({ ...prev, isRequesting: true, isLoading: true }));
      
      try {
        await dispatch(followUser(userId)).unwrap();
        
        const updatedStatus = await dispatch(checkFollowingStatus(userId)).unwrap();
        setFollowStatus({
          isFollowing: updatedStatus.isFollowing,
          hasRequestedToFollow: updatedStatus.hasRequestedToFollow,
          connectionStatus: updatedStatus.connectionStatus,
          isLoading: false,
          isRequesting: false
        });
      } catch (error) {
        console.error('Error following user:', error);
        setFollowStatus(prev => ({ ...prev, isLoading: false, isRequesting: false }));
      }
    }
    
    setShowDropdown(false);
  };

  if (!userId || !user || userId === user.id) {
    return null;
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const buttonSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={className}>
      {followStatus.isFollowing || followStatus.connectionStatus === 'following' ? (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`${buttonSize} rounded-md font-medium flex items-center bg-gray-200 text-gray-700 hover:bg-gray-300`}
          >
            <UserCheck className="w-4 h-4 mr-1" />
            Following
          </button>
          
          {showDropdown && (
            <div className="absolute top-full mt-1 right-0 bg-white rounded-md shadow-lg z-10 w-36 py-1 border border-gray-200">
              <button 
                onClick={handleFollowToggle}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Unfollow
              </button>
            </div>
          )}
        </div>
      ) : followStatus.isLoading ? (
        <button
          disabled
          className={`${buttonSize} rounded-md font-medium flex items-center bg-gray-200 text-gray-700`}
        >
          <Loader className="w-4 h-4 mr-1 animate-spin" />
          Loading...
        </button>
      ) : followStatus.hasRequestedToFollow || followStatus.connectionStatus === 'requested' ? (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`${buttonSize} rounded-md font-medium flex items-center bg-gray-200 text-gray-700 hover:bg-gray-300`}
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Requested
          </button>
          
          {showDropdown && (
            <div className="absolute top-full mt-1 right-0 bg-white rounded-md shadow-lg z-10 w-48 py-1 border border-gray-200">
              <button 
                onClick={handleFollowToggle}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Cancel Request
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleFollowToggle}
          disabled={followStatus.isRequesting}
          className={`${buttonSize} rounded-md font-medium flex items-center bg-primary-600 text-white hover:bg-primary-700`}
        >
          {followStatus.isRequesting ? (
            <>
              <Loader className="w-4 h-4 mr-1 animate-spin" />
              Requesting...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-1" />
              Follow
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ConnectionButton;