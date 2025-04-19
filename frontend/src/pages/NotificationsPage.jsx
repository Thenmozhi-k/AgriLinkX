import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAsRead } from '../features/notifications/notificationsSlice';
import { Bell, Heart, MessageSquare, UserPlus, AlertTriangle, Calendar, X, Check, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

export default function NotificationsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [filter, setFilter] = useState('all');
  
  const dispatch = useDispatch();
  const { items: notifications, isLoading, unreadCount } = useSelector((state) => state.notifications);
  
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);
  
  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setIsDrawerOpen(true);
    
    if (!notification.isRead) {
      dispatch(markAsRead(notification.id));
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
  
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });
  
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
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <button
                  key={notification.id}
                  className={`w-full text-left p-4 hover:bg-gray-50 flex items-start transition-colors duration-200 ${
                    !notification.isRead ? 'bg-primary-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className={`text-gray-900 ${!notification.isRead ? 'font-medium' : ''}`}>
                      {notification.message}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">{formatDate(notification.createdAt)}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" />
                </button>
              ))}
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
                onClick={() => setIsDrawerOpen(false)}
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
              
              {selectedNotification.actionUrl && (
                <Link 
                  to={selectedNotification.actionUrl}
                  className="block w-full bg-primary-600 text-white text-center py-3 rounded-md hover:bg-primary-700 transition-colors duration-200"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  View Details
                </Link>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button 
                  className="flex-1 flex items-center justify-center py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Dismiss
                </button>
                <button className="flex-1 flex items-center justify-center py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200">
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Read
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Overlay when drawer is open */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsDrawerOpen(false)}
        ></div>
      )}
    </div>
  );
}