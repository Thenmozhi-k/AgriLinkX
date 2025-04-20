import { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllPosts, createPost } from '../features/posts/postsSlice';
import { fetchSuggestions } from '../features/user/userSlice';
import { Image, MapPin, Users, Calendar, Smile, Send, Plus, X } from 'lucide-react';
import PostCard from '../components/feed/PostCard';
import WeatherWidget from '../components/widgets/WeatherWidget';
import MarketPriceWidget from '../components/widgets/MarketPriceWidget';
import ConnectionSuggestions from '../components/connections/connectionSuggestions';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmojiPicker from 'emoji-picker-react';

const HomePage = () => {
  const dispatch = useDispatch();
  const { feed, isLoading } = useSelector((state) => state.posts);
  const { user } = useSelector((state) => state.auth);
  
  const [postContent, setPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const locationInputRef = useRef(null);
  const observer = useRef();

  useEffect(() => {
    dispatch(fetchAllPosts());
    dispatch(fetchSuggestions());
  }, [dispatch]);
  
  // Handle clicks outside emoji picker
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      
      if (locationInputRef.current && !locationInputRef.current.contains(event.target) && 
          !event.target.closest('button[data-location-button="true"]')) {
        setShowLocationInput(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Infinite scroll implementation
  const lastPostElementRef = useCallback(node => {
    if (isLoading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, loadingMore, hasMore]);

  const loadMorePosts = async () => {
    if (!hasMore || loadingMore) return;
    
    setLoadingMore(true);
    // In a real implementation, you would fetch the next page of posts
    // For now, we'll simulate it with a timeout
    setTimeout(() => {
      setPage(prevPage => prevPage + 1);
      // If there are no more posts to load, set hasMore to false
      if (page >= 3) {
        setHasMore(false);
      }
      setLoadingMore(false);
    }, 1000);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!postContent.trim() && !selectedFile) return;
    
    setIsSubmitting(true);
    setUploadError('');
    
    try {
      // Create post data object
      const postData = {
        content: postContent
      };
      
      // Add location if provided
      if (location) {
        postData.location = location;
      }
      
      // Add file if selected - this is the key part for file uploads
      if (selectedFile) {
        console.log('Adding file to post data:', selectedFile.name, selectedFile.type, selectedFile.size);
        postData.media = selectedFile;
      }
      
      // Extract hashtags from content
      const hashtags = postContent.match(/#(\w+)/g)?.map(tag => tag.substring(1)) || [];
      if (hashtags.length > 0) {
        postData.hashtags = hashtags;
      }
      
      console.log('Submitting post with data:', JSON.stringify({
        ...postData,
        media: selectedFile ? `${selectedFile.name} (${selectedFile.type}, ${selectedFile.size} bytes)` : null
      }));
      
      const result = await dispatch(createPost(postData)).unwrap();
      console.log('Post created successfully:', result);
      
      // Reset form
      setPostContent('');
      setSelectedFile(null);
      setFilePreview('');
      setLocation('');
      setShowLocationInput(false);
    } catch (error) {
      console.error('Failed to create post:', error);
      setUploadError(error.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Invalid file type. Only JPEG, PNG, JPG, and GIF are allowed.');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File too large. Maximum size is 5MB.');
        return;
      }
      
      // Store the actual File object, not just a reference
      setSelectedFile(file);
      setUploadError('');
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleEmojiClick = (emojiData) => {
    setPostContent(prev => prev + emojiData.emoji);
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview('');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-10">
      <div className="container mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-24 bg-primary-600"></div>
              <div className="px-6 pb-6">
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden -mt-12">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 text-2xl font-semibold">
                        {user?.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                <h2 className="text-xl font-bold text-center mt-2">{user?.name}</h2>
                <p className="text-gray-600 text-center capitalize">{user?.role}</p>

                {user?.bio && (
                  <p className="text-gray-700 text-sm mt-4">
                    {user.bio}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">Punjab, India</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="text-sm">120 connections</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">Joined June 2023</span>
                  </div>
                </div>

                <button className="w-full mt-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-md transition-colors duration-200 font-medium">
                  View Profile
                </button>
              </div>
            </div>

            <div className="mt-6">
              <WeatherWidget />
            </div>

            <div className="mt-6">
              <MarketPriceWidget />
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2">
            {/* Create Post */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 font-medium">
                      {user?.name.charAt(0)}
                    </div>
                  )}
                </div>
                <button
                  className="w-full text-left bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full px-4 py-2 transition-colors duration-200"
                  onClick={() => document.getElementById('post-content')?.focus()}
                >
                  What's on your mind, {user?.name.split(' ')[0]}?
                </button>
              </div>

              <form onSubmit={handleCreatePost}>
                <textarea
                  id="post-content"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share your agricultural insights, questions, or updates..."
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[120px] resize-none"
                ></textarea>
                
                {/* Error message */}
                {uploadError && (
                  <div className="mt-2 text-red-500 text-sm">
                    {uploadError}
                  </div>
                )}
                
                {/* File Preview */}
                {filePreview && (
                  <div className="mt-3 relative">
                    <img 
                      src={filePreview} 
                      alt="Upload preview" 
                      className="max-h-64 rounded-lg mx-auto"
                    />
                    <button 
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 bg-gray-800 bg-opacity-60 text-white rounded-full p-1 hover:bg-opacity-80"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
                
                {/* Location Input */}
                {showLocationInput && (
                  <div className="mt-3" ref={locationInputRef}>
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <MapPin className="h-5 w-5 mx-2 text-gray-500" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Add your location"
                        className="flex-1 py-2 px-1 focus:outline-none"
                      />
                      {location && (
                        <button 
                          type="button"
                          onClick={() => setLocation('')}
                          className="p-2 text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4">
                  <div className="flex space-x-2">
                    {/* File Upload Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex items-center p-2 rounded-full transition-colors duration-200 ${
                        selectedFile 
                          ? 'text-primary-600 bg-primary-50' 
                          : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
                      }`}
                    >
                      <Image className="h-5 w-5" />
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/jpeg,image/png,image/jpg,image/gif"
                        className="hidden"
                      />
                    </button>
                    
                    {/* Emoji Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="flex items-center text-gray-600 hover:text-primary-600 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                      >
                        <Smile className="h-5 w-5" />
                      </button>
                      
                      {showEmojiPicker && (
                        <div className="absolute z-10 mt-1" ref={emojiPickerRef}>
                          <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </div>
                      )}
                    </div>
                    
                    {/* Location Button */}
                    <button
                      type="button"
                      data-location-button="true"
                      onClick={() => setShowLocationInput(!showLocationInput)}
                      className={`flex items-center p-2 rounded-full transition-colors duration-200 ${
                        showLocationInput || location 
                          ? 'text-primary-600 bg-primary-50' 
                          : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
                      }`}
                    >
                      <MapPin className="h-5 w-5" />
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={(!postContent.trim() && !selectedFile) || isSubmitting}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium ${
                      (!postContent.trim() && !selectedFile) || isSubmitting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    } transition-colors duration-200`}
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Posting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Post</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Feed */}
            {isLoading && feed.length === 0 ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="space-y-6">
                {feed.map((post, index) => {
                  if (feed.length === index + 1) {
                    return (
                      <div ref={lastPostElementRef} key={post._id || post.id || `post-${post.postId || Math.random().toString(36).substr(2, 9)}`}>
                        <PostCard post={post} />
                      </div>
                    );
                  } else {
                    return (
                      <PostCard 
                        key={post._id || post.id || `post-${post.postId || Math.random().toString(36).substr(2, 9)}`} 
                        post={post} 
                      />
                    );
                  }
                })}
                
                {loadingMore && (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner size="md" />
                  </div>
                )}
                
                {!hasMore && feed.length > 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No more posts to load
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - Mobile and Desktop */}
          <div className="col-span-1">
            <ConnectionSuggestions />

            {/* Mobile widgets (visible only on mobile) */}
            <div className="lg:hidden mt-6">
              <WeatherWidget />
            </div>

            <div className="lg:hidden mt-6">
              <MarketPriceWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;