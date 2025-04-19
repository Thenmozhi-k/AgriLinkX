import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeed, createPost } from '../features/posts/postsSlice';
import { fetchSuggestions } from '../features/user/userSlice';
import { Image, MapPin, Users, Calendar, Smile, Send, Plus } from 'lucide-react';
import PostCard from '../components/feed/PostCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConnectionSuggestions from '../components/connections/connectionSuggestions';
import WeatherWidget from '../components/widgets/WeatherWidget';
import MarketPriceWidget from '../components/widgets/MarketPriceWidget';

const HomePage = () => {
  const [postContent, setPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const { feed, isLoading } = useSelector((state) => state.posts);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchFeed());
    dispatch(fetchSuggestions());
  }, [dispatch]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    setIsSubmitting(true);

    try {
      await dispatch(createPost({ content: postContent })).unwrap();
      setPostContent('');
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
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

                <div className="flex items-center justify-between mt-4">
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className="flex items-center text-gray-600 hover:text-primary-600 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    >
                      <Image className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="flex items-center text-gray-600 hover:text-primary-600 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    >
                      <Smile className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="flex items-center text-gray-600 hover:text-primary-600 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    >
                      <MapPin className="h-5 w-5" />
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!postContent.trim() || isSubmitting}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium ${
                      !postContent.trim() || isSubmitting
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
                {feed.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
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

            {/* Group suggestions */}
            <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Popular Communities</h3>
                <button className="text-primary-600 text-sm font-medium">See All</button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-md bg-primary-100 flex items-center justify-center mr-3">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Organic Farming Network</h4>
                    <p className="text-xs text-gray-500">15,230 members</p>
                  </div>
                  <button className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-md bg-green-100 flex items-center justify-center mr-3">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Sustainable Agriculture</h4>
                    <p className="text-xs text-gray-500">8,450 members</p>
                  </div>
                  <button className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-md bg-yellow-100 flex items-center justify-center mr-3">
                    <Users className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Agriculture Innovators</h4>
                    <p className="text-xs text-gray-500">5,890 members</p>
                  </div>
                  <button className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
