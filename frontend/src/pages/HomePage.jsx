import { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllPosts, createPost } from '../features/posts/postsSlice';
import { fetchSuggestions } from '../features/user/userSlice';
import { Image, MapPin, Users, Calendar, Smile, Send, Plus, X, File } from 'lucide-react';
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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [location, setLocation] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const observer = useRef();
  
  // Fetch posts on component mount
  useEffect(() => {
    dispatch(fetchAllPosts({ page: 1, limit: 10 }));
    dispatch(fetchSuggestions());
  }, [dispatch]);
  
  // Handle clicks outside emoji picker
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Infinite scroll implementation
  const lastPostElementRef = useCallback(node => {
    if (isLoading || isSubmitting) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, isSubmitting, hasMore]);

  const loadMorePosts = async () => {
    if (!hasMore || isLoading) return;
    
    setIsSubmitting(true);
    // In a real implementation, you would fetch the next page of posts
    // For now, we'll simulate it with a timeout
    setTimeout(() => {
      setPage(prevPage => prevPage + 1);
      // If there are no more posts to load, set hasMore to false
      if (page >= 3) {
        setHasMore(false);
      }
      setIsSubmitting(false);
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!postContent.trim() && selectedFiles.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Create post data object
      const postData = {
        content: postContent
      };
      
      // Add location if provided
      if (location) {
        postData.location = location;
      }
      
      // Add files if selected
      if (selectedFiles.length > 0) {
        console.log(`Adding ${selectedFiles.length} files to post data`);
        postData.media = selectedFiles;
      }
      
      // Extract hashtags from content
      const hashtags = postContent.match(/#(\w+)/g)?.map(tag => tag.substring(1)) || [];
      if (hashtags.length > 0) {
        postData.hashtags = hashtags;
      }
      
      console.log('Submitting post with data:', JSON.stringify({
        ...postData,
        media: selectedFiles.map(file => `${file.name} (${file.type}, ${file.size} bytes)`)
      }));
      
      const result = await dispatch(createPost(postData)).unwrap();
      console.log('Post created successfully:', result);
      
      // Reset form
      setPostContent('');
      setSelectedFiles([]);
      setFilePreviews([]);
      setLocation('');
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Validate total number of files
    if (selectedFiles.length + files.length > 10) {
      alert('You can upload a maximum of 10 files per post.');
      return;
    }
    
    const newSelectedFiles = [...selectedFiles];
    const newFilePreviews = [...filePreviews];
    let hasError = false;
    
    files.forEach(file => {
      console.log('File selected:', file.name, file.type, file.size);
      
      // Validate file type
      const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      
      const validTypes = [...validImageTypes, ...validVideoTypes];
      
      if (!validTypes.includes(file.type)) {
        alert('Invalid file type. Only images and videos are allowed.');
        hasError = true;
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File too large. Maximum size is 10MB.');
        hasError = true;
        return;
      }
      
      // Add file to selected files
      newSelectedFiles.push(file);
      
      // Create preview for images and videos
      if (validImageTypes.includes(file.type)) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newFilePreviews.push({
            url: reader.result,
            type: 'image',
            name: file.name
          });
          setFilePreviews([...newFilePreviews]);
        };
        reader.readAsDataURL(file);
      } else if (validVideoTypes.includes(file.type)) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newFilePreviews.push({
            url: reader.result,
            type: 'video',
            name: file.name
          });
          setFilePreviews([...newFilePreviews]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    if (!hasError) {
      setSelectedFiles(newSelectedFiles);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleRemoveFile = (index) => {
    const newSelectedFiles = [...selectedFiles];
    const newFilePreviews = [...filePreviews];
    
    newSelectedFiles.splice(index, 1);
    newFilePreviews.splice(index, 1);
    
    setSelectedFiles(newSelectedFiles);
    setFilePreviews(newFilePreviews);
  };
  
  const handleEmojiSelect = (emojiData) => {
    setPostContent(prev => prev + emojiData.emoji);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modified container to have a max-width on medium and large screens */}
      <div className="mx-auto px-4 py-6 max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-6 relative">
          {/* Left Sidebar - Hidden on mobile, visible on lg screens */}
          <div className="hidden lg:block w-full lg:w-1/4 xl:w-1/5 lg:sticky lg:top-6 lg:self-start lg:max-h-screen overflow-hidden pb-6">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden">
                  <img 
                    src={user?.avatar || 'https://via.placeholder.com/100'} 
                    alt={user?.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{user?.name}</h3>
                  <p className="text-sm text-gray-500">{user?.role || 'AgriLinkX User'}</p>
                </div>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Connections</span>
                  <span className="text-primary-600 font-medium">{user?.connectionCount || 0}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Posts</span>
                  <span className="text-primary-600 font-medium">{user?.postCount || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Profile views</span>
                  <span className="text-primary-600 font-medium">{user?.profileViews || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h3 className="font-semibold text-gray-800 mb-3">Weather Updates</h3>
              <WeatherWidget compact={true} />
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Market Prices</h3>
              <MarketPriceWidget compact={true} />
            </div>
          </div>
          
          {/* Main Feed - Full width on mobile, fixed width on larger screens */}
          <div className="w-full lg:w-2/4 xl:w-3/5 max-h-full">
            {/* Create Post */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <form onSubmit={handleSubmit} className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <img 
                      src={user?.avatar || 'https://via.placeholder.com/100'} 
                      alt={user?.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[60px] resize-none"
                  />
                </div>
                
                {/* File Previews */}
                {filePreviews.length > 0 && (
                  <div className="flex flex-wrap mb-4">
                    {filePreviews.map((preview, index) => (
                      <div key={index} className="relative mr-2 mb-2">
                        <div className="h-20 w-20 rounded-lg overflow-hidden border border-gray-200">
                          <img 
                            src={preview.url} 
                            alt={`Preview ${index}`} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 rounded-full p-1 text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Location Input */}
                {location && (
                  <div className="flex items-center mb-4 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{location}</span>
                    <button 
                      type="button"
                      onClick={() => setLocation('')}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between border-t pt-3">
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                    >
                      <Image className="h-5 w-5" />
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        multiple
                        accept="image/*,video/*"
                        className="hidden"
                      />
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setLocation('Your Location')}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                    >
                      <MapPin className="h-5 w-5" />
                    </button>
                    
                    <div className="relative" ref={emojiPickerRef}>
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                      >
                        <Smile className="h-5 w-5" />
                      </button>
                      
                      {showEmojiPicker && (
                        <div className="absolute z-10 mt-2">
                          <EmojiPicker onEmojiClick={handleEmojiSelect} />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || (!postContent.trim() && selectedFiles.length === 0)}
                    className={`px-4 py-2 rounded-lg flex items-center ${
                      isSubmitting || (!postContent.trim() && selectedFiles.length === 0)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {isSubmitting ? 'Posting...' : 'Post'}
                    {!isSubmitting && <Send className="h-4 w-4 ml-2" />}
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
                
                {isLoading && feed.length > 0 && (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner />
                  </div>
                )}
                
                {!isLoading && !hasMore && feed.length > 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No more posts to load
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Right Sidebar - Hidden on mobile, visible on lg screens - with hidden scrollbars */}
          <div className="hidden lg:block w-full lg:w-1/4 xl:w-1/5 lg:sticky lg:top-6 lg:self-start lg:max-h-screen overflow-hidden pb-6">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <h3 className="font-semibold text-gray-800 mb-3">People You May Know</h3>
              <ConnectionSuggestions compact={true} maxSuggestions={5} />
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <h3 className="font-semibold text-gray-800 mb-3">Trending Topics</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="block hover:bg-gray-50 p-2 rounded-md transition-colors">
                    <span className="text-xs text-gray-500">Farming</span>
                    <p className="text-sm font-medium text-gray-800">#OrganicFarming</p>
                    <span className="text-xs text-gray-500">1,234 posts</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="block hover:bg-gray-50 p-2 rounded-md transition-colors">
                    <span className="text-xs text-gray-500">Agriculture</span>
                    <p className="text-sm font-medium text-gray-800">#SustainableAgriculture</p>
                    <span className="text-xs text-gray-500">987 posts</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="block hover:bg-gray-50 p-2 rounded-md transition-colors">
                    <span className="text-xs text-gray-500">Technology</span>
                    <p className="text-sm font-medium text-gray-800">#AgriTech</p>
                    <span className="text-xs text-gray-500">756 posts</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;