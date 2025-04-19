import { useState } from 'react';
import { MessageSquare, Heart, Share2, MoreHorizontal, ThumbsUp } from 'lucide-react';
import timeAgo from '../../utils/timeAgo';

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  
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
  
  const formattedContent = post.content.split(' ').map((word, index) => {
    if (word.startsWith('#')) {
      return (
        <span key={index} className="text-primary-600 hover:underline cursor-pointer">
          {word}{' '}
        </span>
      );
    }
    return word + ' ';
  });
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
            {post.userAvatar ? (
              <img src={post.userAvatar} alt={post.userName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 font-medium">
                {post.userName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{post.userName}</h3>
            <p className="text-gray-500 text-sm">{timeAgo(new Date(post.createdAt))}</p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
      
      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 whitespace-pre-line">{formattedContent}</p>
        
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {post.hashtags.map((tag, index) => (
              <span key={index} className="text-primary-600 text-sm hover:underline cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Post Image(s) */}
      {post.images && post.images.length > 0 && (
        <div className="mb-3">
          {post.images.map((image, index) => (
            <img 
              key={index}
              src={image} 
              alt={`Post by ${post.userName}`} 
              className="w-full h-auto"
            />
          ))}
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
            {post.comments} comments
          </button>
          <button className="hover:text-gray-700">
            {post.shares} shares
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
          {post.comments === 0 && (
            <p className="text-center text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
          )}
          
          {/* Sample comments (would come from API in real app) */}
          {post.comments > 0 && (
            <div className="space-y-3">
              <div className="flex">
                <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                  <img 
                    src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150" 
                    alt="Commenter" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="bg-white p-2 rounded-lg">
                    <p className="font-medium text-sm">Agricultural Expert</p>
                    <p className="text-sm">Great insights! Have you tried implementing companion planting with your crops?</p>
                  </div>
                  <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
                    <button className="hover:text-gray-700">Like</button>
                    <button className="hover:text-gray-700">Reply</button>
                    <span>3h ago</span>
                  </div>
                </div>
              </div>
              
              {post.comments > 1 && (
                <div className="flex">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                    <img 
                      src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150" 
                      alt="Commenter" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="bg-white p-2 rounded-lg">
                      <p className="font-medium text-sm">AgriTech Solutions</p>
                      <p className="text-sm">Would you be interested in testing our new soil monitoring system? It could help optimize your crop yield.</p>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
                      <button className="hover:text-gray-700">Like</button>
                      <button className="hover:text-gray-700">Reply</button>
                      <span>2h ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
