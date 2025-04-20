import { useState, useMemo } from 'react';
import { MessageSquare, Heart, Share2, MoreHorizontal, ThumbsUp } from 'lucide-react';
import timeAgo from '../../utils/timeAgo';

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  
  // Create a safe local copy of post data
  const postData = useMemo(() => {
    return {
      id: post._id || post.id,
      content: post.content || post.description || '',
      userName: post.userName || (post.userId && typeof post.userId === 'object' ? post.userId.name : 'User'),
      userAvatar: post.userAvatar || (post.userId && typeof post.userId === 'object' ? post.userId.avatar : null),
      hashtags: post.hashtags || [],
      media: post.media || (post.images && post.images.length > 0 ? post.images[0] : null),
      comments: post.comments || [],
      commentsCount: typeof post.comments === 'number' ? post.comments : (Array.isArray(post.comments) ? post.comments.length : 0),
      shares: post.shares || 0,
      createdAt: post.createdAt || new Date().toISOString()
    };
  }, [post]);
  
  const handleLike = () => {
    if (liked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }
    setLiked(!liked);
    
    // In a real app, would call API to like/unlike the post
    // postService.likePost(post.id);
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
            <p className="text-gray-500 text-sm">{getPostDate()}</p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <MoreHorizontal className="h-5 w-5" />
        </button>
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
      
      {/* Post Image(s) */}
      {postData.media && (
        <div className="mb-3">
          <img 
            src={postData.media} 
            alt={`Post by ${postData.userName}`} 
            className="w-full h-auto"
          />
        </div>
      )}
      
      {/* Post Metrics */}
      <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center">
          {liked ? (
            <ThumbsUp className="h-4 w-4 text-primary-600 fill-primary-600 mr-1" />
          ) : (
            <Heart className="h-4 w-4 mr-1" />
          )}
          <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
        </div>
        
        <div className="flex space-x-4">
          <button onClick={() => setShowComments(!showComments)} className="hover:text-gray-700">
            {postData.commentsCount} comments
          </button>
          <button className="hover:text-gray-700">
            {postData.shares} shares
          </button>
        </div>
      </div>
      
      {/* Post Actions */}
      <div className="px-2 py-1 border-t border-gray-200 flex">
        <button 
          onClick={handleLike}
          className={`flex items-center justify-center px-2 py-2 rounded-md flex-1 font-medium text-sm ${
            liked 
              ? 'text-primary-600' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {liked ? (
            <Heart className="h-5 w-5 mr-1 fill-primary-600 text-primary-600" />
          ) : (
            <Heart className="h-5 w-5 mr-1" />
          )}
          Like
        </button>
        
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center justify-center px-2 py-2 rounded-md flex-1 text-gray-600 hover:bg-gray-100 font-medium text-sm"
        >
          <MessageSquare className="h-5 w-5 mr-1" />
          Comment
        </button>
        
        <button className="flex items-center justify-center px-2 py-2 rounded-md flex-1 text-gray-600 hover:bg-gray-100 font-medium text-sm">
          <Share2 className="h-5 w-5 mr-1" />
          Share
        </button>
      </div>
      
      {/* Comments (Expandable) */}
      {showComments && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          {/* Comment input */}
          <div className="flex items-start mb-4">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
              <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 font-medium">
                U
              </div>
            </div>
            <div className="flex-1 bg-white rounded-lg overflow-hidden border border-gray-300">
              <textarea
                placeholder="Write a comment..."
                className="w-full p-2 text-sm focus:outline-none min-h-[60px] resize-none"
              ></textarea>
              <div className="bg-gray-50 px-2 py-1 flex justify-end">
                <button className="px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700">
                  Post
                </button>
              </div>
            </div>
          </div>
          
          {/* Show a message if no comments yet */}
          {postData.commentsCount === 0 && (
            <p className="text-center text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
          )}
          
          {/* Render actual comments if available */}
          {Array.isArray(postData.comments) && postData.comments.length > 0 && (
            <div className="space-y-3">
              {postData.comments.map((comment, index) => (
                <div key={index} className="flex">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                    {comment.userId && typeof comment.userId === 'object' && comment.userId.avatar ? (
                      <img 
                        src={comment.userId.avatar} 
                        alt={comment.userId.name || 'Commenter'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 font-medium">
                        {comment.userId && typeof comment.userId === 'object' && comment.userId.name 
                          ? comment.userId.name.charAt(0) 
                          : 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="bg-white p-2 rounded-lg">
                      <p className="font-medium text-sm">
                        {comment.userId && typeof comment.userId === 'object' && comment.userId.name 
                          ? comment.userId.name 
                          : 'User'}
                      </p>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
                      <button className="hover:text-gray-700">Like</button>
                      <button className="hover:text-gray-700">Reply</button>
                      <span>{comment.createdAt ? timeAgo(new Date(comment.createdAt)) : 'recently'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Fallback for when we have a count but no actual comments data */}
          {postData.commentsCount > 0 && (!Array.isArray(postData.comments) || postData.comments.length === 0) && (
            <p className="text-center text-gray-500 text-sm">Comments are loading...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;