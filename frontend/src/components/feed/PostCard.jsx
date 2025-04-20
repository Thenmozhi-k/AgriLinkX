import { useState, useMemo, useRef, useEffect } from 'react';
import { MessageSquare, Heart, Share2, MoreHorizontal, ThumbsUp, MapPin, Edit, Trash2, Bookmark, BookmarkCheck } from 'lucide-react';
import timeAgo from '../../utils/timeAgo';
import PostMediaGallery from './PostMediaGallery';
import { useDispatch, useSelector } from 'react-redux';
import { reactToPost, deletePost, savePost, unsavePost, checkSavedPost } from '../../features/posts/postsSlice';
import ReactionDetailsModal from '../modals/ReactionDetailsModal';
import CommentSection from '../comments/CommentSection';
import SharePostModal from '../modals/SharePostModal';
import EditPostModal from '../modals/EditPostModal';
import { useLocation } from 'react-router-dom';

const ReactionIcons = {
  like: '👍',
  love: '❤️',
  care: '🤗',
  haha: '😄',
  wow: '😮',
  sad: '😢',
  angry: '😠'
};

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [showComments, setShowComments] = useState(false);
  const [showReactionDetails, setShowReactionDetails] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeReaction, setActiveReaction] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactionError, setReactionError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef(null);
  const currentUser = useSelector(state => state.auth.user);
  
  // Create a safe local copy of post data
  const postData = useMemo(() => {
    console.log("Post data:", post);
    
    return {
      id: post._id || post.id,
      content: post.content || post.description || '',
      userName: post.userName || (post.userId && typeof post.userId === 'object' ? post.userId.name : 'User'),
      userAvatar: post.userAvatar || (post.userId && typeof post.userId === 'object' ? post.userId.avatar : null),
      userRole: post.userRole || (post.userId && typeof post.userId === 'object' ? post.userId.role : null),
      hashtags: post.hashtags || [],
      media: post.media || (post.images && post.images.length > 0 ? [{ url: post.images[0], type: 'image' }] : []),
      comments: post.comments || [],
      commentsCount: post.commentCount || (typeof post.comments === 'number' ? post.comments : (Array.isArray(post.comments) ? post.comments.length : 0)),
      shares: post.shares || [],
      shareCount: post.shareCount || (Array.isArray(post.shares) ? post.shares.length : (post.shares || 0)),
      createdAt: post.createdAt || new Date().toISOString(),
      location: post.location || null,
      reactions: post.reactions || [],
      reactionCounts: post.reactionCounts || {},
      totalReactions: post.totalReactions || 0,
      userReaction: post.userReaction || null,
      userId: post.userId // Keep the original userId for author checking
    };
  }, [post]);
  
  // Check if the current user is the post author
  const isAuthor = useMemo(() => {
    if (!currentUser) {
      console.log('No current user found');
      return false;
    }
    
    if (!post.userId && !postData.userId) {
      console.log('No post userId found');
      return false;
    }
    
    // Extract post user ID, handling different formats
    let postUserId;
    if (typeof post.userId === 'object') {
      postUserId = post.userId._id || post.userId.id;
    } else {
      postUserId = post.userId;
    }
    
    // Extract current user ID, handling different formats
    const currentUserId = currentUser.id || currentUser._id;
    
    console.log('Post author check:', {
      post: post,
      postUserId,
      currentUser: currentUser,
      currentUserId,
      isMatch: String(postUserId) === String(currentUserId)
    });
    
    // Convert both to strings to ensure consistent comparison
    return String(postUserId) === String(currentUserId);
  }, [currentUser, post.userId, postData.userId]);
  
  // Determine if we're on the profile page
  const isProfilePage = location.pathname.includes('/profile');
  // Determine if we're on the home page
  const isHomePage = location.pathname === '/home';
  
  const handleReaction = (reactionType) => {
    console.log(`Reacting to post ${postData.id} with reaction: ${reactionType}`);
    setReactionError(null);
    
    // Ensure we have a valid reaction type
    const validReactionTypes = ['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry'];
    if (!validReactionTypes.includes(reactionType)) {
      console.error('Invalid reaction type:', reactionType);
      setReactionError('Invalid reaction type');
      return;
    }
    
    dispatch(reactToPost({ postId: postData.id, reactionType }))
      .unwrap()
      .then(response => {
        console.log('Reaction success:', response);
      })
      .catch(error => {
        console.error('Reaction failed:', error);
        setReactionError(typeof error === 'string' ? error : 'Failed to react to post');
      });
      
    setShowReactionPicker(false);
  };
  
  const handleReactionHover = (type) => {
    setActiveReaction(type);
  };
  
  const handleReactionLeave = () => {
    setActiveReaction(null);
  };
  
  const handleShare = () => {
    setShowShareModal(true);
  };
  
  // Safely format content with hashtag highlighting
  const renderContent = () => {
    if (!postData.content || typeof postData.content !== 'string') {
      return null;
    }
    
    return postData.content.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span key={index} className="text-primary-600 hover:underline cursor-pointer">
            {word}{' '}
          </span>
        );
      }
      return word + ' ';
    });
  };
  
  // Get post date safely
  const getPostDate = () => {
    try {
      return timeAgo(new Date(postData.createdAt));
    } catch (e) {
      return 'recently';
    }
  };
  
  // Get reaction counts
  const getReactionCounts = () => {
    const totalCount = postData.totalReactions || 0;
    
    if (totalCount === 0) {
      return null;
    }
    
    return (
      <div 
        className="flex items-center cursor-pointer hover:underline"
        onClick={() => setShowReactionDetails(true)}
      >
        <div className="flex -space-x-1 mr-1">
          {Object.keys(postData.reactionCounts || {}).slice(0, 3).map((type, index) => {
            if (postData.reactionCounts[type] > 0) {
              return (
                <div 
                  key={type} 
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    type === 'like' ? 'bg-blue-500' :
                    type === 'love' ? 'bg-red-500' :
                    type === 'care' ? 'bg-yellow-500' :
                    type === 'haha' ? 'bg-yellow-400' :
                    type === 'wow' ? 'bg-yellow-600' :
                    type === 'sad' ? 'bg-purple-500' :
                    'bg-orange-500'
                  } text-white border border-white`}
                >
                  {type === 'like' && <ThumbsUp className="h-3 w-3" />}
                  {type === 'love' && <Heart className="h-3 w-3" />}
                  {type === 'care' && '🤗'}
                  {type === 'haha' && '😄'}
                  {type === 'wow' && '😮'}
                  {type === 'sad' && '😢'}
                  {type === 'angry' && '😠'}
                </div>
              );
            }
            return null;
          })}
        </div>
        <span className="text-sm text-gray-500">{totalCount}</span>
      </div>
    );
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Check if post is saved when component mounts
  useEffect(() => {
    const checkPostSavedStatus = async () => {
      if (post._id) {
        try {
          const result = await dispatch(checkSavedPost(post._id)).unwrap();
          setIsSaved(result.isSaved);
        } catch (error) {
          console.error('Error checking saved status:', error);
        }
      }
    };
    
    checkPostSavedStatus();
  }, [dispatch, post._id]);

  // Toggle save post
  const handleSavePost = () => {
    if (isSaved) {
      dispatch(unsavePost(postData.id))
        .unwrap()
        .then(() => {
          setIsSaved(false);
          setShowDropdown(false);
        })
        .catch(error => {
          console.error('Error unsaving post:', error);
        });
    } else {
      dispatch(savePost(postData.id))
        .unwrap()
        .then(() => {
          setIsSaved(true);
          setShowDropdown(false);
        })
        .catch(error => {
          console.error('Error saving post:', error);
        });
    }
  };
  
  // Handle post deletion
  const handleDeletePost = () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      setIsDeleting(true);
      dispatch(deletePost(postData.id))
        .unwrap()
        .then(() => {
          // Post deleted successfully
          setShowDropdown(false);
        })
        .catch(error => {
          console.error('Error deleting post:', error);
          setIsDeleting(false);
        });
    } else {
      setShowDropdown(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
            {postData.userAvatar ? (
              <img src={postData.userAvatar} alt={postData.userName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 font-medium">
                {postData.userName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{postData.userName}</h3>
            <div className="flex items-center text-gray-500 text-sm">
              {postData.userRole && (
                <span className="capitalize mr-2">{postData.userRole}</span>
              )}
              <span>{getPostDate()}</span>
              
              {postData.location && (
                <div className="flex items-center ml-2">
                  <span className="mx-1">•</span>
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{postData.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button 
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            onClick={() => {
              console.log('Dropdown clicked, isAuthor:', isAuthor);
              setShowDropdown(!showDropdown);
            }}
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200">
              {isAuthor && (
                <>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => {
                      setShowEditModal(true);
                      setShowDropdown(false);
                    }}
                    disabled={isDeleting}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Post
                  </button>
                  
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    onClick={handleDeletePost}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete Post'}
                  </button>
                </>
              )}
              
              <button 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={handleSavePost}
                disabled={isDeleting}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 mr-2" />
                    Unsave Post
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save Post
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 whitespace-pre-line">{renderContent()}</p>
        
        {postData.hashtags && postData.hashtags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {postData.hashtags.map((tag, index) => (
              <span key={index} className="text-primary-600 text-sm hover:underline cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Post Media Gallery */}
      {postData.media && postData.media.length > 0 && (
        <PostMediaGallery media={postData.media} />
      )}
      
      {/* Post Metrics */}
      <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        {getReactionCounts()}
        
        <div className="flex space-x-4">
          <button onClick={() => setShowComments(!showComments)} className="hover:text-gray-700">
            {postData.commentsCount} comments
          </button>
          <button className="hover:text-gray-700">
            {postData.shareCount} shares
          </button>
        </div>
      </div>
      
      {/* Post Actions */}
      <div className="px-2 py-1 border-t border-gray-200 flex">
        {reactionError && (
          <div className="absolute -top-8 left-0 right-0 bg-red-100 text-red-700 p-2 text-sm text-center">
            {reactionError}
          </div>
        )}
        <div className="relative flex-1">
          <button 
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            onMouseLeave={() => showReactionPicker || setActiveReaction(null)}
            className={`flex items-center justify-center px-2 py-2 rounded-md w-full font-medium text-sm ${
              postData.userReaction 
                ? 'text-primary-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {postData.userReaction ? (
              <>
                <span className="mr-1 text-lg">{ReactionIcons[postData.userReaction]}</span>
                <span className="capitalize">{postData.userReaction}</span>
              </>
            ) : activeReaction ? (
              <>
                <span className="mr-1 text-lg">{ReactionIcons[activeReaction]}</span>
                <span className="capitalize">{activeReaction}</span>
              </>
            ) : (
              <>
                <Heart className="h-5 w-5 mr-1" />
                Like
              </>
            )}
          </button>
          
          {/* Reaction Picker */}
          {showReactionPicker && (
            <div 
              className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg border p-1 flex space-x-1"
              onMouseLeave={() => setShowReactionPicker(false)}
            >
              {Object.entries(ReactionIcons).map(([type, icon]) => (
                <button
                  key={type}
                  onClick={() => handleReaction(type)}
                  onMouseEnter={() => handleReactionHover(type)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-lg transition-transform hover:scale-125"
                  title={type}
                >
                  {icon}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center justify-center px-2 py-2 rounded-md flex-1 text-gray-600 hover:bg-gray-100 font-medium text-sm"
        >
          <MessageSquare className="h-5 w-5 mr-1" />
          Comment
        </button>
        
        <button 
          onClick={handleShare}
          className="flex items-center justify-center px-2 py-2 rounded-md flex-1 text-gray-600 hover:bg-gray-100 font-medium text-sm"
        >
          <Share2 className="h-5 w-5 mr-1" />
          Share
        </button>
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200 bg-gray-50">
          <CommentSection 
            postId={postData.id} 
            comments={postData.comments}
            onClose={() => setShowComments(false)}
          />
        </div>
      )}
      
      {/* Modals */}
      {showReactionDetails && (
        <ReactionDetailsModal 
          postId={postData.id}
          isOpen={showReactionDetails}
          onClose={() => setShowReactionDetails(false)}
        />
      )}
      
      {showShareModal && (
        <SharePostModal
          postId={postData.id}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}
      
      {showEditModal && (
        <EditPostModal
          post={post}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default PostCard;