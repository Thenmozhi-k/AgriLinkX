import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { 
  Search, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  Smile, 
  MoreVertical, 
  Phone, 
  Video,
  ChevronLeft
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function MessagesPage() {
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showChatList, setShowChatList] = useState(true);
  
  const messagesEndRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  
  // Mock data for chat rooms
  const mockChatRooms = [
    {
      id: 'room1',
      name: 'Organic Farmers Group',
      lastMessage: 'Has anyone tried the new organic fertilizer?',
      lastMessageTime: '2023-05-10T14:30:00Z',
      unreadCount: 3,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 'room2',
      name: 'Agricultural Experts',
      lastMessage: 'The forecast shows rain next week. Plan your harvesting accordingly.',
      lastMessageTime: '2023-05-09T10:15:00Z',
      unreadCount: 0,
      avatar: 'https://images.pexels.com/photos/977402/pexels-photo-977402.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: 'room3',
      name: 'Local Farmers Market',
      lastMessage: 'Market day is moved to Saturday this week due to the festival.',
      lastMessageTime: '2023-05-08T16:45:00Z',
      unreadCount: 1,
      avatar: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
  ];
  
  // Mock messages for each room
  const mockMessages = {
    room1: [
      {
        id: 'msg1',
        senderId: '3',
        senderName: 'Agricultural Expert',
        senderAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
        content: 'Has anyone tried the new organic fertilizer from EcoGrow?',
        createdAt: '2023-05-10T14:30:00Z',
      },
      {
        id: 'msg2',
        senderId: '5',
        senderName: 'Organic Seed Supplier',
        senderAvatar: 'https://images.pexels.com/photos/977402/pexels-photo-977402.jpeg?auto=compress&cs=tinysrgb&w=150',
        content: 'Yes, we\'ve been using it for a month now. The results are impressive!',
        createdAt: '2023-05-10T14:32:00Z',
      },
      {
        id: 'msg3',
        senderId: '1',
        senderName: 'Demo Farmer',
        senderAvatar: 'https://images.pexels.com/photos/3912578/pexels-photo-3912578.jpeg?auto=compress&cs=tinysrgb&w=150',
        content: 'I\'m planning to try it next week. Any tips on application rates?',
        createdAt: '2023-05-10T14:35:00Z',
      },
    ],
    room2: [
      {
        id: 'msg4',
        senderId: '3',
        senderName: 'Agricultural Expert',
        senderAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
        content: 'The forecast shows rain next week. Plan your harvesting accordingly.',
        createdAt: '2023-05-09T10:15:00Z',
      },
    ],
    room3: [
      {
        id: 'msg5',
        senderId: '6',
        senderName: 'Green Farming Initiative',
        senderAvatar: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=150',
        content: 'Market day is moved to Saturday this week due to the festival.',
        createdAt: '2023-05-08T16:45:00Z',
      },
    ],
  };
  
  useEffect(() => {
    // Simulate API call
    const fetchChatRooms = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setChatRooms(mockChatRooms);
      setIsLoading(false);
    };
    
    fetchChatRooms();
    
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowChatList(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (selectedRoom) {
      // Simulate API call to fetch messages
      const fetchMessages = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setMessages(mockMessages[selectedRoom.id] || []);
        setIsLoading(false);
        
        if (isMobileView) {
          setShowChatList(false);
        }
      };
      
      fetchMessages();
    }
  }, [selectedRoom, isMobileView]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;
    
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || '1',
      senderName: user?.name || 'You',
      senderAvatar: user?.avatar,
      content: newMessage,
      createdAt: new Date().toISOString(),
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  if (isLoading && chatRooms.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex h-[calc(100vh-120px)]">
            {/* Chat List - Hidden on mobile when viewing a chat */}
            {(showChatList || !isMobileView) && (
              <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                  <div className="mt-3 relative">
                    <input
                      type="text"
                      placeholder="Search messages..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {chatRooms.map((room) => (
                    <button
                      key={room.id}
                      className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 flex items-start ${
                        selectedRoom?.id === room.id ? 'bg-primary-50' : ''
                      }`}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          {room.avatar ? (
                            <img src={room.avatar} alt={room.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 font-medium">
                              {room.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        {room.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="ml-3 flex-1 overflow-hidden">
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-medium text-gray-900 truncate">{room.name}</h4>
                          <span className="text-xs text-gray-500">
                            {formatDate(room.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm truncate mt-1">{room.lastMessage}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Chat Area */}
            {selectedRoom ? (
              <div className={`w-full ${!isMobileView ? 'md:w-2/3' : ''} flex flex-col`}>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center">
                    {isMobileView && (
                      <button 
                        className="mr-3 text-gray-600"
                        onClick={() => setShowChatList(true)}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                    )}
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                      {selectedRoom.avatar ? (
                        <img src={selectedRoom.avatar} alt={selectedRoom.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 font-medium">
                          {selectedRoom.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedRoom.name}</h3>
                      <p className="text-xs text-gray-500">Online</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button className="text-gray-600 hover:text-gray-900">
                      <Phone className="h-5 w-5" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Video className="h-5 w-5" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {messages.map((message) => {
                    const isCurrentUser = message.senderId === (user?.id || '1');
                    
                    return (
                      <div 
                        key={message.id} 
                        className={`mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isCurrentUser && (
                          <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                            {message.senderAvatar ? (
                              <img src={message.senderAvatar} alt={message.senderName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 font-medium text-xs">
                                {message.senderName.charAt(0)}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className={`max-w-[70%] ${isCurrentUser ? 'bg-primary-600 text-white' : 'bg-white text-gray-800'} rounded-lg px-4 py-2 shadow-sm`}>
                          {!isCurrentUser && (
                            <p className="text-xs font-medium mb-1">{message.senderName}</p>
                          )}
                          <p>{message.content}</p>
                          <p className={`text-xs ${isCurrentUser ? 'text-primary-100' : 'text-gray-500'} text-right mt-1`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex items-center">
                    <button type="button" className="text-gray-500 hover:text-gray-700 mr-2">
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <button type="button" className="text-gray-500 hover:text-gray-700 mr-2">
                      <ImageIcon className="h-5 w-5" />
                    </button>
                    <button type="button" className="text-gray-500 hover:text-gray-700 mr-2">
                      <Smile className="h-5 w-5" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className={`ml-2 rounded-full p-2 ${
                        newMessage.trim() ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-300'
                      } text-white`}
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="w-full md:w-2/3 flex flex-col items-center justify-center bg-gray-50">
                <div className="text-center p-6">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-10 w-10 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Your Messages</h3>
                  <p className="text-gray-600 mb-6">
                    Select a conversation or start a new one
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}