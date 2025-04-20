import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserPosts } from '../features/posts/postsSlice';
import { 
  MapPin, 
  Calendar, 
  Briefcase, 
  Edit, 
  Users, 
  Link as LinkIcon, 
  ChevronDown,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PostCard from '../components/feed/PostCard';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userPosts, isLoading } = useSelector((state) => state.posts);
  const [activeTab, setActiveTab] = useState('posts');
  
  useEffect(() => {
    if (user && user._id) {
      dispatch(fetchUserPosts(user._id));
    }
  }, [dispatch, user]);
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 min-h-screen pb-10">
      <div className="bg-white shadow-sm">
        {/* Cover Photo */}
        <div className="h-48 md:h-64 bg-primary-600 relative">
          <button className="absolute bottom-4 right-4 bg-white text-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100">
            <Edit className="h-5 w-5" />
          </button>
        </div>
        
        {/* Profile Summary */}
        <div className="container mx-auto px-4">
          <div className="relative -mt-20">
            <div className="flex flex-col md:flex-row">
              {/* Profile Picture */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 text-4xl font-semibold">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="mt-4 md:mt-12 md:ml-6 flex flex-col md:flex-row justify-between w-full">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-lg text-gray-600 capitalize">{user.role}</p>
                  <p className="text-gray-600 mt-1">Organic Farmer specializing in sustainable agriculture</p>
                  
                  <div className="mt-3 flex flex-wrap items-center text-sm text-gray-600">
                    <div className="flex items-center mr-4 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>Punjab, India</span>
                    </div>
                    <div className="flex items-center mr-4 mb-2">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span>10+ years experience</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Joined June 2023</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-4 md:mt-0">
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200 font-medium">
                    Edit Profile
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 font-medium">
                    Share Profile
                  </button>
                </div>
              </div>
            </div>
            
            {/* Connection Stats */}
            <div className="flex justify-start mt-6 pb-4 border-b border-gray-200">
              <button className="flex items-center mr-6 hover:text-primary-600">
                <span className="font-bold mr-1">120</span> 
                <span className="text-gray-600">connections</span>
              </button>
              <button className="flex items-center hover:text-primary-600">
                <span className="font-bold mr-1">45</span> 
                <span className="text-gray-600">groups</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div>
            {/* About */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 text-lg">About</h3>
                <button className="text-primary-600 hover:text-primary-700">
                  <Edit className="h-4 w-4" />
                </button>
              </div>
              
              <p className="text-gray-700 mb-4">
                Passionate organic farmer with 10 years of experience in sustainable agriculture methods. Specialized in cultivating organic vegetables and implementing water conservation techniques. Committed to sharing knowledge and fostering a community of eco-conscious farmers.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <Briefcase className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Owner</p>
                    <p className="text-gray-600 text-sm">Green Harvest Organic Farm</p>
                    <p className="text-gray-500 text-sm">2013 - Present</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <LinkIcon className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-primary-600 hover:underline cursor-pointer">greenharvest.com</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Skills */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 text-lg">Skills</h3>
                <button className="text-primary-600 hover:text-primary-700">
                  <Edit className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 text-sm">Organic Farming</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 text-sm">Soil Conservation</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 text-sm">Water Management</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 text-sm">Crop Rotation</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 text-sm">Pest Management</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 text-sm">Sustainable Practices</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 text-sm">Agricultural Marketing</span>
              </div>
            </div>
            
            {/* Activity */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 text-lg mb-4">Activity</h3>
              
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4 mr-2 text-primary-600" />
                  <span>Your posts received 142 views last week</span>
                </div>
                
                <div>
                  <p className="font-medium text-sm">Recent Hashtags</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-primary-600 text-sm hover:underline cursor-pointer">
                      #OrganicFarming
                    </span>
                    <span className="text-gray-500 mx-1">•</span>
                    <span className="text-primary-600 text-sm hover:underline cursor-pointer">
                      #Sustainability
                    </span>
                    <span className="text-gray-500 mx-1">•</span>
                    <span className="text-primary-600 text-sm hover:underline cursor-pointer">
                      #AgriTech
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="flex border-b border-gray-200">
                <button 
                  className={`px-4 py-3 font-medium text-sm ${
                    activeTab === 'posts' 
                      ? 'text-primary-600 border-b-2 border-primary-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('posts')}
                >
                  Posts
                </button>
                <button 
                  className={`px-4 py-3 font-medium text-sm ${
                    activeTab === 'activity' 
                      ? 'text-primary-600 border-b-2 border-primary-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('activity')}
                >
                  Activity
                </button>
                <button 
                  className={`px-4 py-3 font-medium text-sm ${
                    activeTab === 'groups' 
                      ? 'text-primary-600 border-b-2 border-primary-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('groups')}
                >
                  Groups
                </button>
                <button 
                  className={`px-4 py-3 font-medium text-sm ${
                    activeTab === 'connections' 
                      ? 'text-primary-600 border-b-2 border-primary-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('connections')}
                >
                  Connections
                </button>
              </div>
            </div>
            
            {/* Tab Content */}
            {activeTab === 'posts' && (
              <>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : userPosts.length > 0 ? (
                  <div className="space-y-6">
                    {userPosts.map((post) => (
                      <PostCard key={post._id || post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No posts yet</h3>
                    <p className="text-gray-600 mb-6">
                      Start sharing your agricultural knowledge and experiences with the community.
                    </p>
                    <button className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200 font-medium">
                      Create Your First Post
                    </button>
                  </div>
                )}
              </>
            )}
            
            {activeTab === 'activity' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                
                <div className="divide-y divide-gray-200">
                  <div className="py-4">
                    <div className="flex">
                      <div className="mr-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-800">
                          <span className="font-medium">You</span> joined the group <span className="font-medium text-primary-600">Organic Farming Network</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">2 days ago</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-4">
                    <div className="flex">
                      <div className="mr-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-800">
                          <span className="font-medium">Agricultural Expert</span> and <span className="font-medium">5 others</span> liked your post about organic tomatoes
                        </p>
                        <p className="text-sm text-gray-500 mt-1">5 days ago</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-4">
                    <div className="flex">
                      <div className="mr-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img 
                            src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150" 
                            alt="User"
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-800">
                          <span className="font-medium">You</span> connected with <span className="font-medium text-primary-600">AgriTech Solutions</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">1 week ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button className="w-full py-2 mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm">
                  Show more activity
                </button>
              </div>
            )}
            
            {activeTab === 'groups' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Your Groups</h3>
                  <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                    Manage groups
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex">
                      <div className="w-16 h-16 rounded-md bg-primary-100 flex items-center justify-center mr-3">
                        <Users className="h-8 w-8 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Organic Farming Network</h4>
                        <p className="text-sm text-gray-600">15,230 members</p>
                        <p className="text-xs text-gray-500 mt-1">5 new posts today</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex">
                      <div className="w-16 h-16 rounded-md bg-green-100 flex items-center justify-center mr-3">
                        <Users className="h-8 w-8 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Sustainable Agriculture</h4>
                        <p className="text-sm text-gray-600">8,750 members</p>
                        <p className="text-xs text-gray-500 mt-1">2 new posts today</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex">
                      <div className="w-16 h-16 rounded-md bg-blue-100 flex items-center justify-center mr-3">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Water Conservation Techniques</h4>
                        <p className="text-sm text-gray-600">5,430 members</p>
                        <p className="text-xs text-gray-500 mt-1">Active 2 hours ago</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex">
                      <div className="w-16 h-16 rounded-md bg-yellow-100 flex items-center justify-center mr-3">
                        <Users className="h-8 w-8 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Agricultural Market Updates</h4>
                        <p className="text-sm text-gray-600">12,100 members</p>
                        <p className="text-xs text-gray-500 mt-1">Active 5 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button className="w-full py-2 mt-6 border border-primary-600 text-primary-600 hover:bg-primary-50 rounded-md font-medium">
                  Discover More Groups
                </button>
              </div>
            )}
            
            {activeTab === 'connections' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Your Connections</h3>
                  <div className="flex items-center">
                    <input
                      type="text"
                      placeholder="Search connections"
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button className="ml-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                      Manage
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow duration-200">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                      <img 
                        src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150" 
                        alt="User"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Rajiv Singh</h4>
                      <p className="text-sm text-gray-600">Organic Farmer</p>
                    </div>
                    <button className="ml-auto text-gray-500 hover:text-gray-700">
                      <MessageSquare className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow duration-200">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                      <img 
                        src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150" 
                        alt="User"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Priya Sharma</h4>
                      <p className="text-sm text-gray-600">Agricultural Scientist</p>
                    </div>
                    <button className="ml-auto text-gray-500 hover:text-gray-700">
                      <MessageSquare className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow duration-200">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                      <img 
                        src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150" 
                        alt="User"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Amit Patel</h4>
                      <p className="text-sm text-gray-600">Agribusiness Consultant</p>
                    </div>
                    <button className="ml-auto text-gray-500 hover:text-gray-700">
                      <MessageSquare className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow duration-200">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                      <img 
                        src="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150" 
                        alt="User"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Neha Gupta</h4>
                      <p className="text-sm text-gray-600">Agricultural Engineer</p>
                    </div>
                    <button className="ml-auto text-gray-500 hover:text-gray-700">
                      <MessageSquare className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <button className="w-full py-2 mt-6 text-primary-600 hover:text-primary-700 font-medium text-sm">
                  View All Connections <ChevronDown className="h-4 w-4 inline ml-1" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;