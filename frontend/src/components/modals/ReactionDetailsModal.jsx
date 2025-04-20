import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReactionDetails } from '../../features/posts/postsSlice';
import timeAgo from '../../utils/timeAgo';

const ReactionIcons = {
  like: '👍',
  love: '❤️',
  care: '🤗',
  haha: '😄',
  wow: '😮',
  sad: '😢',
  angry: '😠'
};

const ReactionDetailsModal = ({ postId, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { reactionDetails, isLoading } = useSelector(state => state.posts);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    if (isOpen && postId) {
      dispatch(fetchReactionDetails(postId));
    }
  }, [isOpen, postId, dispatch]);
  
  if (!isOpen) return null;
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
  };
  
  const getFilteredReactions = () => {
    if (!reactionDetails || !reactionDetails.reactionDetails) return [];
    
    let filtered = reactionDetails.reactionDetails;
    
    // Filter by reaction type if not "all"
    if (activeTab !== 'all') {
      filtered = filtered.filter(reaction => reaction.type === activeTab);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(reaction => 
        reaction.user && reaction.user.name && reaction.user.name.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  };
  
  const filteredReactions = getFilteredReactions();
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">Reactions</h3>
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
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b overflow-x-auto">
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'all' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleTabChange('all')}
          >
            All ({reactionDetails?.totalReactions || 0})
          </button>
          {Object.entries(reactionDetails?.reactionCounts || {}).map(([type, count]) => (
            count > 0 && (
              <button
                key={type}
                className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === type ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => handleTabChange(type)}
              >
                <span className="mr-1">{ReactionIcons[type]}</span>
                <span>{count}</span>
              </button>
            )
          ))}
        </div>
        
        {/* Reaction List */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredReactions.length > 0 ? (
            <ul className="space-y-2">
              {filteredReactions.map((reaction) => (
                <li key={reaction.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                  {/* User Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    {reaction.user?.avatar ? (
                      <img src={reaction.user.avatar} alt={reaction.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 font-medium">
                        {reaction.user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="font-medium text-gray-900">{reaction.user?.name || 'Unknown User'}</h4>
                      <span className="ml-2 text-gray-500 text-sm">{timeAgo(new Date(reaction.createdAt))}</span>
                    </div>
                    {reaction.user?.role && (
                      <p className="text-sm text-gray-500 capitalize">{reaction.user.role}</p>
                    )}
                  </div>
                  
                  {/* Reaction Type */}
                  <div className="text-xl" title={reaction.type}>
                    {ReactionIcons[reaction.type]}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <p>No reactions found</p>
              {searchTerm && <p className="text-sm mt-1">Try a different search term</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReactionDetailsModal;