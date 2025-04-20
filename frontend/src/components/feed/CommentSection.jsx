import { useState, useRef, useEffect } from 'react';
import { Heart, Send, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { commentOnPost, likeComment } from '../../features/posts/postsSlice';
import timeAgo from '../../utils/timeAgo';

const CommentSection = ({ postId, comments = [], onClose }) => {
  const dispatch = useDispatch();
  const [commentText, setCommentText] = useState('');
  const commentInputRef = useRef(null);
  const commentsContainerRef = useRef(null);
  const { isLoading } = useSelector(state => state.posts);
  
  // Focus comment input when opened
  useEffect(() => {
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  }, []);
  
  // Scroll to bottom when new comments are added
  useEffect(() => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    }
  }, [comments.length]);
  
  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    dispatch(commentOnPost({ postId, content: commentText }));
    setCommentText('');
  };
  
  const handleLikeComment = (commentId) => {
    dispatch(likeComment(commentId));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium">Comments ({comments.length})</h3>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Comments List */}
      <div 
        ref={commentsContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-4"
      >
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id || comment.id} className="flex">
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                {comment.userId && comment.userId.avatar ? (
                  <img 
                    src={comment.userId.avatar} 
                    alt={comment.userId.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 font-medium text-sm">
                    {comment.userId && comment.userId.name ? comment.userId.name.charAt(0) : 'U'}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {comment.userId && comment.userId.name ? comment.userId.name : 'User'}
                  </h4>
                  <p className="text-gray-800 text-sm break-words">{comment.content}</p>
                </div>
                <div className="flex items-center mt-1 ml-1 text-xs text-gray-500">
                  <button 
                    onClick={() => handleLikeComment(comment._id || comment.id)}
                    className={`flex items-center mr-3 ${comment.userLiked ? 'text-primary-600' : 'hover:text-gray-700'}`}
                  >
                    <Heart className={`h-3 w-3 mr-1 ${comment.userLiked ? 'fill-primary-600' : ''}`} />
                    {comment.likeCount || 0}
                  </button>
                  <span>{timeAgo(new Date(comment.createdAt))}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <p>No comments yet</p>
            <p className="text-sm mt-1">Be the first to comment!</p>
          </div>
        )}
      </div>
      
      {/* Comment Input */}
      <div className="p-3 border-t">
        <form onSubmit={handleSubmitComment} className="flex">
          <input
            ref={commentInputRef}
            type="text"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!commentText.trim() || isLoading}
            className={`flex items-center justify-center px-4 rounded-r-lg ${
              !commentText.trim() || isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentSection;