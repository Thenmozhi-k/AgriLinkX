import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConnections, fetchSuggestions, followUser } from '../features/user/userSlice';
import { Plus, X, UserPlus, Users, Search } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState('connections');
  const [searchTerm, setSearchTerm] = useState('');
  
  const dispatch = useDispatch();
  const { profile, isLoading } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    dispatch(fetchConnections(user?.id));
    dispatch(fetchSuggestions());
  }, [dispatch, user?.id]);
  
  const handleFollow = (userId) => {
    dispatch(followUser(userId));
  };
  
  const allConnections = [...profile.followers, ...profile.following];
  
  const filteredConnections = allConnections.filter(connection => 
    connection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredSuggestions = profile.suggestions.filter(suggestion => 
    suggestion.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const renderConnectionCard = (connection) => (
    <div key={connection.id} className="bg-white rounded-lg shadow-sm p-4 flex items-start">
      <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
        {connection.avatar ? (
          <img src={connection.avatar} alt={connection.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 font-medium text-xl">
            {connection.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 text-lg">{connection.name}</h4>
        <p className="text-gray-600 capitalize">{connection.role}</p>
        <div className="flex space-x-2 mt-3">
          <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-md transition-colors duration-200">
            Message
          </button>
          <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-md transition-colors duration-200">
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
  
  const renderSuggestionCard = (suggestion) => (
    <div key={suggestion.id} className="bg-white rounded-lg shadow-sm p-4 flex items-start">
      <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
        {suggestion.avatar ? (
          <img src={suggestion.avatar} alt={suggestion.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 font-medium text-xl">
            {suggestion.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 text-lg">{suggestion.name}</h4>
        <p className="text-gray-600 capitalize">{suggestion.role}</p>
        <div className="flex space-x-2 mt-3">
          <button
            onClick={() => handleFollow(suggestion.id)}
            className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-md transition-colors duration-200"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Connect
          </button>
          <button className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-md transition-colors duration-200">
            <X className="h-4 w-4 mr-2" />
            Dismiss
          </button>
        </div>
      </div>
    </div>
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
        
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'connections'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('connections')}
            >
              <div className="flex items-center justify-center">
                <Users className="h-5 w-5 mr-2" />
                <span>My Connections ({allConnections.length})</span>
              </div>
            </button>
            <button
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'suggestions'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('suggestions')}
            >
              <div className="flex items-center justify-center">
                <UserPlus className="h-5 w-5 mr-2" />
                <span>Suggestions ({profile.suggestions.length})</span>
              </div>
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'connections' ? (
              filteredConnections.length > 0 ? (
                filteredConnections.map(renderConnectionCard)
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-10 w-10 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No connections found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Try a different search term' : 'Start connecting with other farmers and experts'}
                  </p>
                </div>
              )
            ) : (
              filteredSuggestions.length > 0 ? (
                filteredSuggestions.map(renderSuggestionCard)
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="h-10 w-10 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No suggestions found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Try a different search term' : 'We\'ll notify you when we find new connections for you'}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}