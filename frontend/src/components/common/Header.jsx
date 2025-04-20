import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks'; // Ensure correct path
import { logout } from '../../features/auth/authSlice';
import {
  Bell,
  MessageSquare,
  User,
  Home,
  Users,
  LogOut,
  Menu,
  X,
  Search,
  ChevronDown,
  Leaf,
} from 'lucide-react';
import AuthModal from '../auth/AuthModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  const profileDropdownRef = useRef(null);
  const profileButtonRef = useRef(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notifications);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileDropdownRef.current && 
        !profileDropdownRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setShowProfileDropdown(false);
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Check if the current path matches the given path
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Header for non-authenticated users (landing page)
  if (!isAuthenticated) {
    return (
      <>
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2">
                <Leaf className="h-8 w-8 text-primary-600" />
                <span className="text-2xl font-display font-bold text-primary-700">AgriLinkX</span>
              </Link>

              <div className="hidden md:flex items-center space-x-8">
                <nav className="flex items-center space-x-6">
                  <a href="#features" className="text-gray-700 hover:text-primary-600 font-medium">
                    Features
                  </a>
                  <a href="#how-it-works" className="text-gray-700 hover:text-primary-600 font-medium">
                    How it Works
                  </a>
                  <a href="#about" className="text-gray-700 hover:text-primary-600 font-medium">
                    About
                  </a>
                </nav>

                <button
                  onClick={() => openAuthModal('login')}
                  className="px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition duration-200 font-medium"
                >
                  Connect
                </button>
              </div>

              <button className="md:hidden text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white py-2 px-4 shadow-inner animate-fade-in">
              <nav className="flex flex-col space-y-3">
                <a
                  href="#features"
                  className="text-gray-700 hover:text-primary-600 py-2 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-gray-700 hover:text-primary-600 py-2 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How it Works
                </a>
                <a
                  href="#about"
                  className="text-gray-700 hover:text-primary-600 py-2 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </a>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="px-6 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition duration-200 font-medium w-full mt-2"
                >
                  Connect
                </button>
              </nav>
            </div>
          )}
        </header>

        {showAuthModal && (
          <AuthModal
            mode={authMode}
            onClose={() => setShowAuthModal(false)}
            onSwitchMode={(mode) => setAuthMode(mode)}
          />
        )}
      </>
    );
  }

  // Header for authenticated users
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/home" className="flex items-center space-x-2">
              <Leaf className="h-7 w-7 text-primary-600" />
              <span className="text-xl font-display font-bold text-primary-700 hidden md:inline">
                AgriLinkX
              </span>
            </Link>

            <div className="relative hidden md:block w-64">
              <input
                type="text"
                placeholder="Search AgriLinkX"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/home"
              className={`flex flex-col items-center ${
                isActive('/home')
                  ? 'text-primary-700 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-primary-600'
              } px-2 pb-1`}
            >
              <Home className="h-6 w-6" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link
              to="/connections"
              className={`flex flex-col items-center ${
                isActive('/connections')
                  ? 'text-primary-700 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-primary-600'
              } px-2 pb-1`}
            >
              <Users className="h-6 w-6" />
              <span className="text-xs mt-1">My Network</span>
            </Link>
            <Link
              to="/messages"
              className={`flex flex-col items-center ${
                isActive('/messages')
                  ? 'text-primary-700 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-primary-600'
              } px-2 pb-1`}
            >
              <MessageSquare className="h-6 w-6" />
              <span className="text-xs mt-1">Messaging</span>
            </Link>
            <Link
              to="/notifications"
              className={`flex flex-col items-center ${
                isActive('/notifications')
                  ? 'text-primary-700 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-primary-600'
              } px-2 pb-1 relative`}
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
              <span className="text-xs mt-1">Notifications</span>
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <button 
                ref={profileButtonRef}
                onClick={toggleProfileDropdown}
                className="flex items-center space-x-1 focus:outline-none"
                aria-expanded={showProfileDropdown}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 text-lg font-medium">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div className="hidden md:flex items-center space-x-1">
                  <span className="text-sm">Me</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showProfileDropdown ? 'transform rotate-180' : ''}`} />
                </div>
              </button>

              {showProfileDropdown && (
                <div 
                  ref={profileDropdownRef}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 transition-all duration-200 ease-in-out"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    View Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100"
                  >
                    <div className="flex items-center">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Sign Out</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button className="md:hidden text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white py-2 mt-2 shadow-inner animate-fade-in">
            <div className="relative mx-4 mb-3">
              <input
                type="text"
                placeholder="Search AgriLinkX"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>

            <nav className="flex flex-col space-y-1">
              <Link
                to="/home"
                className={`flex items-center space-x-3 px-4 py-2 ${
                  isActive('/home') ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
              <Link
                to="/connections"
                className={`flex items-center space-x-3 px-4 py-2 ${
                  isActive('/connections') ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="h-5 w-5" />
                <span>My Network</span>
              </Link>
              <Link
                to="/messages"
                className={`flex items-center space-x-3 px-4 py-2 ${
                  isActive('/messages') ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageSquare className="h-5 w-5" />
                <span>Messaging</span>
              </Link>
              <Link
                to="/notifications"
                className={`flex items-center space-x-3 px-4 py-2 ${
                  isActive('/notifications') ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                } relative`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 left-7 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
                <span>Notifications</span>
              </Link>
              <Link
                to="/profile"
                className={`flex items-center space-x-3 px-4 py-2 ${
                  isActive('/profile') ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>My Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-2 text-gray-700 w-full text-left"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;