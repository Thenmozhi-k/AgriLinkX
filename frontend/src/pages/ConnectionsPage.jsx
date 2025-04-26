import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchConnections, 
  fetchSuggestions, 
  followUser, 
  unfollowUser, 
  fetchFollowRequests,
  acceptFollowRequest,
  rejectFollowRequest
} from '../features/user/userSlice';
import { Plus, X, UserPlus, Users, Search, UserCheck, UserMinus, UserX, Bell } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import ConnectionStats from '../components/connections/ConnectionStats';
import ConnectionGrid from '../components/connections/ConnectionGrid';

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState('followers');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingActions, setProcessingActions] = useState({});
  
  const dispatch = useDispatch();
  const { profile, isLoading } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.auth);
  console.log(JSON.stringify(profile) + 'usss')
  // Log profile data whenever it changes
  useEffect(() => {
    console.log('Current profile data:', profile);
    console.log('Followers count:', profile?.followers?.length || 0);
    console.log('Following count:', profile?.following?.length || 0);
    console.log('Requests count:', profile?.followRequests?.length || 0);
    console.log('Suggestions count:', profile?.suggestions?.length || 0);
  }, [profile]);

  // Fetch all connection data when component mounts
  useEffect(() => {
    if (user?.id) {
      console.log('Fetching connection data for user:', user.id);
      
      // Fetch followers and following
      dispatch(fetchConnections(user.id));
      
      // Fetch suggestions
      dispatch(fetchSuggestions());
      
      // Fetch follow requests
      dispatch(fetchFollowRequests());
    }
  }, [dispatch, user?.id]);

  // Refetch data when the active tab changes
  useEffect(() => {
    if (!user?.id) return;
    
    console.log(`Tab changed to ${activeTab}`);
    
    if (activeTab === 'followers' || activeTab === 'following') {
      console.log('Fetching followers/following data');
      dispatch(fetchConnections(user.id));
    } else if (activeTab === 'suggestions') {
      console.log('Fetching suggestions data');
      dispatch(fetchSuggestions());
    } else if (activeTab === 'requests') {
      console.log('Fetching requests data');
      dispatch(fetchFollowRequests());
    }
  }, [activeTab, dispatch, user?.id]);
  
  // Handle follow action
  const handleFollow = async (userId) => {
    if (processingActions[userId]) return;
    
    try {
      setProcessingActions(prev => ({ ...prev, [userId]: true }));
      await dispatch(followUser(userId)).unwrap();
      console.log('Follow request sent successfully');
      
      // Refetch suggestions after following a user
      dispatch(fetchSuggestions());
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setProcessingActions(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  // Handle unfollow action
  const handleUnfollow = async (userId) => {
    if (processingActions[userId]) return;
    
    if (window.confirm('Are you sure you want to unfollow this user?')) {
      try {
        setProcessingActions(prev => ({ ...prev, [userId]: true }));
        await dispatch(unfollowUser(userId)).unwrap();
        console.log('Unfollowed user successfully');
        
        // Refetch following list after unfollowing
        dispatch(fetchConnections(user.id));
      } catch (error) {
        console.error('Error unfollowing user:', error);
      } finally {
        setProcessingActions(prev => ({ ...prev, [userId]: false }));
      }
    }
  };
  
  // Handle accept follow request
  const handleAcceptRequest = async (userId) => {
    if (processingActions[userId]) return;
    
    try {
      setProcessingActions(prev => ({ ...prev, [userId]: true }));
      await dispatch(acceptFollowRequest(userId)).unwrap();
      console.log('Follow request accepted successfully');
      
      // Refetch requests and followers after accepting
      dispatch(fetchFollowRequests());
      dispatch(fetchConnections(user.id));
    } catch (error) {
      console.error('Error accepting follow request:', error);
    } finally {
      setProcessingActions(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  // Handle reject follow request
  const handleRejectRequest = async (userId) => {
    if (processingActions[userId]) return;
    
    try {
      setProcessingActions(prev => ({ ...prev, [userId]: true }));
      await dispatch(rejectFollowRequest(userId)).unwrap();
      console.log('Follow request rejected successfully');
      
      // Refetch requests after rejecting
      dispatch(fetchFollowRequests());
    } catch (error) {
      console.error('Error rejecting follow request:', error);
    } finally {
      setProcessingActions(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  // Filter data based on search term - with safety checks
  const filteredFollowers = (profile?.followers || []).filter(follower => 
    follower?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredFollowing = (profile?.following || []).filter(following => 
    following?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredRequests = (profile?.followRequests || []).filter(request => 
    request?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredSuggestions = (profile?.suggestions || []).filter(suggestion => 
    suggestion?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">My Network</h1>
          
          <div className="w-full md:w-64 relative">
            <input
              type="text"
              placeholder="Search connections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          </div>
        </div>
        
        {/* LinkedIn-like Connection Stats */}
        {!isLoading && (
          <ConnectionStats 
            followers={profile?.followers} 
            following={profile?.following}
            userId={user?.id}
          />
        )}
        
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex flex-wrap border-b">
            <button
              data-tab="followers"
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'followers'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('followers')}
            >
              <div className="flex items-center justify-center">
                <Users className="h-5 w-5 mr-2" />
                <span>Followers ({profile?.followers?.length || 0})</span>
              </div>
            </button>
            <button
              data-tab="following"
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'following'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('following')}
            >
              <div className="flex items-center justify-center">
                <UserCheck className="h-5 w-5 mr-2" />
                <span>Following ({profile?.following?.length || 0})</span>
              </div>
            </button>
            <button
              data-tab="requests"
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'requests'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              } ${profile?.followRequests?.length > 0 ? 'relative' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              <div className="flex items-center justify-center">
                <Bell className="h-5 w-5 mr-2" />
                <span>Requests ({profile?.followRequests?.length || 0})</span>
              </div>
              {profile?.followRequests?.length > 0 && (
                <span className="absolute top-3 right-1/4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {profile?.followRequests?.length}
                </span>
              )}
            </button>
            <button
              data-tab="suggestions"
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'suggestions'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('suggestions')}
            >
              <div className="flex items-center justify-center">
                <UserPlus className="h-5 w-5 mr-2" />
                <span>Suggestions ({profile?.suggestions?.length || 0})</span>
              </div>
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {activeTab === 'followers' && (
              <div className="mb-8">
                <ConnectionGrid 
                  users={filteredFollowers}
                  type="followers"
                  processingActions={processingActions}
                  emptyMessage="No followers found"
                  searchTerm={searchTerm}
                />
              </div>
            )}
            
            {activeTab === 'following' && (
              <div className="mb-8">
                <ConnectionGrid 
                  users={filteredFollowing}
                  type="following"
                  onUnfollow={handleUnfollow}
                  processingActions={processingActions}
                  emptyMessage="Not following anyone yet"
                  searchTerm={searchTerm}
                />
              </div>
            )}
            
            {activeTab === 'requests' && (
              <div className="mb-8">
                <ConnectionGrid 
                  users={filteredRequests}
                  type="requests"
                  onAccept={handleAcceptRequest}
                  onReject={handleRejectRequest}
                  processingActions={processingActions}
                  emptyMessage="No pending follow requests"
                  searchTerm={searchTerm}
                />
              </div>
            )}
            
            {activeTab === 'suggestions' && (
              <div className="mb-8">
                <ConnectionGrid 
                  users={filteredSuggestions}
                  type="suggestions"
                  onFollow={handleFollow}
                  processingActions={processingActions}
                  emptyMessage="No suggestions found"
                  searchTerm={searchTerm}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}