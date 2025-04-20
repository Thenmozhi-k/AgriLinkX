import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSavedPosts } from '../features/posts/postsSlice';
import PostCard from '../components/feed/PostCard';
import { Bookmark } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SavedPostsPage = () => {
  const dispatch = useDispatch();
  const { savedPosts, isLoading, error } = useSelector(state => state.posts);
  
  useEffect(() => {
    dispatch(getSavedPosts());
  }, [dispatch]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Bookmark className="h-6 w-6 mr-2 text-primary-600" />
              Saved Posts
            </h1>
            <p className="text-gray-600 mt-1">
              Posts you've saved for later
            </p>
          </div>
          
          {isLoading && (
            <div className="text-center py-10">
              <LoadingSpinner />
              <p className="mt-2 text-gray-600">Loading saved posts...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              <p>{error}</p>
            </div>
          )}
          
          {!isLoading && !error && savedPosts && savedPosts.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Bookmark className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No saved posts yet</h2>
              <p className="text-gray-600">
                When you save posts, they'll appear here for easy access.
              </p>
            </div>
          )}
          
          {savedPosts && savedPosts.map(post => (
            <div key={post._id} className="mb-6">
              <PostCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedPostsPage;