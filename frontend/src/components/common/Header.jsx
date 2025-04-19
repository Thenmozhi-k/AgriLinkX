// src/components/common/Header.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notifications);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
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
              className="flex flex-col items-center text-primary-700 border-b-2 border-primary-600 px-2 pb-1"
            >
              <Home className="h-6 w-6" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link
              to="/connections"
              className="flex flex-col items-center text-gray-500 hover:text-primary-600 px-2 pb-1"
            >
              <Users className="h-6 w-6" />
              <span className="text-xs mt-1">My Network</span>
            </Link>
            <Link
              to="/messages"
              className="flex flex-col items-center text-gray-500 hover:text-primary-600 px-2 pb-1"
            >
              <MessageSquare className="h-6 w-6" />
              <span className="text-xs mt-1">Messaging</span>
            </Link>
            <Link
              to="/notifications"
              className="flex flex-col items-center text-gray-500 hover:text-primary-600 px-2 pb-1 relative"
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
            <div className="relative group">
              <button className="flex items-center space-x-1">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 text-lg font-medium">
                      {user?.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="hidden md:flex items-center space-x-1">
                  <span className="text-sm">Me</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  View Profile
                </Link>
                <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            </div>

            <button className="md:hidden text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mt-2 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search AgriLinkX"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white py-2 shadow-inner mt-2 animate-fade-in">
            <nav className="flex flex-col">
              <Link
                to="/home"
                className="flex items-center space-x-3 px-4 py-3 text-primary-700 bg-primary-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-6 w-6" />
                <span>Home</span>
              </Link>
              <Link
                to="/connections"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="h-6 w-6" />
                <span>My Network</span>
              </Link>
              <Link
                to="/messages"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageSquare className="h-6 w-6" />
                <span>Messaging</span>
              </Link>
              <Link
                to="/notifications"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Bell className="h-6 w-6" />
                <span>Notifications</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 w-full"
              >
                <LogOut className="h-6 w-6" />
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