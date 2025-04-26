import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAsRead, markAllAsRead } from '../features/notifications/notificationsSlice';
import { Bell, Heart, MessageSquare, UserPlus, AlertTriangle, Calendar, X, Check, ChevronRight, UserCheck } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { acceptFollowRequest, followUser } from '../features/user/userSlice';

export default function NotificationsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [filter, setFilter] = useState('all');
  const [processingActions, setProcessingActions] = useState({});
  const [localReadStatus, setLocalReadStatus] = useState({});
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [acceptedRequests, setAcceptedRequests] = useState({});
  
  const dispatch = useDispatch();
  const { items: notifications, isLoading, unreadCount } = useSelector((state) => state.notifications);
  
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);
  
  // Initialize local read status when notifications change
  useEffect(() => {
    const initialReadStatus = {};
    notifications.forEach(notification => {
      initialReadStatus[notification.id || notification._id] = notification.isRead;
    });
    setLocalReadStatus(initialReadStatus);
  }, [notifications]);
  
  const handleNotificationClick = (notification) => {
    const notificationId = notification.id || notification._id;
    
    // Update local state immediately for a responsive UI
    setLocalReadStatus(prev => ({
      ...prev,
      [notificationId]: true
    }));
    
    setSelectedNotification(notification);
    setIsDrawerOpen(true);
    
    // Mark as read in the backend if not already read
    if (!notification.isRead) {
      dispatch(markAsRead(notificationId))
        .unwrap()
        .then(() => {
          console.log('Notification marked as read:', notificationId);
        })
        .catch(error => {
          console.error('Error marking notification as read:', error);
          // Revert local state if the API call fails
          setLocalReadStatus(prev => ({
            ...prev,
            [notificationId]: false
          }));
        });
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    // Refresh notifications to get updated read status
    dispatch(fetchNotifications());
  };

  const handleAcceptFollowRequest = async (notification, followBack = false) => {
    if (!notification.sender || processingActions[notification.id]) return;
    
    const notificationId = notification.id || notification._id;

    try {
      setProcessingActions(prev => ({ ...prev, [notificationId]: true }));
      
      // Accept the follow request
      await dispatch(acceptFollowRequest(notification.sender)).unwrap();
      
      // If followBack is true, also follow the user back
      if (followBack) {
        await dispatch(followUser(notification.sender)).unwrap();
      }
      
      // Mark this request as accepted in local state
      setAcceptedRequests(prev => ({
        ...prev,
        [notificationId]: {
          accepted: true,
          followedBack: followBack
        }
      }));
      
      // Refresh notifications
      dispatch(fetchNotifications());
      
      // Don't close the drawer so user can see the "Accepted" message
    } catch (error) {
      console.error('Error handling follow request:', error);
    } finally {
      setProcessingActions(prev => ({ ...prev, [notificationId]: false }));
    }
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'system':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Use local read status for filtering
  const filteredNotifications = notifications.filter(notification => {
    const notificationId = notification.id || notification._id;
    const isRead = localReadStatus[notificationId] !== undefined 
      ? localReadStatus[notificationId] 
      : notification.isRead;
      
    if (filter === 'all') return true;
    if (filter === 'unread') return !isRead;
    return notification.type === filter;
  });
  
  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    if (isMarkingAllRead) return;
    
    setIsMarkingAllRead(true);
    
    // Update local state immediately
    const updatedReadStatus = { ...localReadStatus };
    notifications.forEach(notification => {
      const notificationId = notification.id || notification._id;
      updatedReadStatus[notificationId] = true;
    });
    setLocalReadStatus(updatedReadStatus);
    
    // Update in backend using the proper thunk action
    dispatch(markAllAsRead())
      .unwrap()
      .then(() => {
        console.log('All notifications marked as read');
        dispatch(fetchNotifications());
        setIsMarkingAllRead(false);
      })
      .catch(error => {
        console.error('Error marking all notifications as read:', error);
        setIsMarkingAllRead(false);
        
        // Revert local state if the API call fails
        const revertedReadStatus = { ...localReadStatus };
        notifications.forEach(notification => {
          const notificationId = notification.id || notification._id;
          revertedReadStatus[notificationId] = notification.isRead;
        });
        setLocalReadStatus(revertedReadStatus);
      });
  };
  
  if (isLoading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 relative">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          
          <div className="flex space-x-2">
            <button 
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'all' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'unread' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setFilter('unread')}
            >
              Unread
            </button>
            {notifications.some(notification => !notification.isRead) && (
              <button 
                className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAllRead}
              >
                {isMarkingAllRead ? (
                  <>
                    <LoadingSpinner size="xs" className="mr-1" />
                    Marking...
                  </>
                ) : (
                  'Mark all as read'
                )}
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => {
                const notificationId = notification.id || notification._id;
                const isRead = localReadStatus[notificationId] !== undefined 
                  ? localReadStatus[notificationId] 
                  : notification.isRead;
                
                return (
                  <button
                    key={notificationId}
                    className={`w-full text-left p-4 hover:bg-gray-50 flex items-start transition-colors duration-200 ${
                      !isRead ? 'bg-primary-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-gray-900 ${!isRead ? 'font-medium' : ''}`}>
                        {notification.message}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">{formatDate(notification.createdAt)}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
              <p className="text-gray-600">
                {filter !== 'all' 
                  ? 'Try changing your filter to see more notifications' 
                  : 'You\'re all caught up!'}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Notification Detail Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedNotification && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Notification Details</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={handleCloseDrawer}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-start mb-6">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-4 flex-shrink-0">
                  {getNotificationIcon(selectedNotification.type)}
                </div>
                <div>
                  <p className="text-gray-900 font-medium text-lg">
                    {selectedNotification.message}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {new Date(selectedNotification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Details</h3>
                <p className="text-gray-700">
                  {selectedNotification.type === 'like' && 'Someone liked your content. Engagement like this helps your posts reach more people in the AgriLinkX community.'}
                  {selectedNotification.type === 'comment' && 'Someone commented on your post. Respond to keep the conversation going and build connections with other farmers.'}
                  {selectedNotification.type === 'follow' && 'You have a new follower! This means your content will appear in their feed, and they\'ll be notified of your new posts.'}
                  {selectedNotification.type === 'system' && 'This is an important system notification that may require your attention.'}
                </p>
              </div>
              
              {/* Follow request actions */}
              {selectedNotification.type === 'follow' && 
                selectedNotification.sender && 
                selectedNotification.message.includes('requested to follow you') && (
                  <div className="flex flex-col space-y-3 mb-6">
                    {acceptedRequests[selectedNotification.id || selectedNotification._id] ? (
                      <div className="bg-green-100 text-green-800 p-4 rounded-md flex items-center">
                        <Check className="h-5 w-5 mr-2 text-green-600" />
                        <span>
                          {acceptedRequests[selectedNotification.id || selectedNotification._id].followedBack
                            ? 'Accepted and followed back'
                            : 'Request accepted'}
                        </span>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleAcceptFollowRequest(selectedNotification)}
                          disabled={processingActions[selectedNotification.id]}
                          className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                        >
                          {processingActions[selectedNotification.id] ? (
                            <LoadingSpinner size="sm" color="white" />
                          ) : (
                            <>
                              <Check className="h-5 w-5 mr-2" />
                              Accept
                            </>
                          )}
                        </button>
                        
                        <button 
                          onClick={() => handleAcceptFollowRequest(selectedNotification, true)}
                          disabled={processingActions[selectedNotification.id]}
                          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          {processingActions[selectedNotification.id] ? (
                            <LoadingSpinner size="sm" color="white" />
                          ) : (
                            <>
                              <UserCheck className="h-5 w-5 mr-2" />
                              Accept & Follow Back
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                )
              }
              
              {selectedNotification.actionUrl && (
                <Link 
                  to={selectedNotification.actionUrl}
                  className="block w-full bg-primary-600 text-white text-center py-3 rounded-md hover:bg-primary-700 transition-colors duration-200"
                  onClick={handleCloseDrawer}
                >
                  View Details
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}