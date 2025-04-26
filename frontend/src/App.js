import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './app/hooks.js';
import Header from './components/common/Header.jsx';
import LandingPage from './pages/LandingPage.jsx';
import HomePage from './pages/HomePage.jsx';
import AgriBot from './pages/AgriBot.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ConnectionsPage from './pages/ConnectionsPage.jsx';
import MessagesPage from './pages/MessagesPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import GroupsPage from './pages/GroupsPage.jsx';
import MarketplacePage from './pages/MarketplacePage.jsx';
import SavedPostsPage from './pages/SavedPostsPage.jsx';
import Footer from './components/common/Footer.jsx';
import { fetchUnreadCount } from './features/notifications/notificationsSlice.jsx';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const App = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Fetch unread notification count for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      // Fetch initial count
      dispatch(fetchUnreadCount());
      
      // Set up interval to periodically fetch unread count (every 60 seconds)
      const intervalId = setInterval(() => {
        dispatch(fetchUnreadCount());
      }, 60000);
      
      // Clean up interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, dispatch]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/home" replace /> : <LandingPage />} 
          />
          
          {/* Protected routes */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/connections" 
            element={
              <ProtectedRoute>
                <ConnectionsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/messages" 
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/groups" 
            element={
              <ProtectedRoute>
                <GroupsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/marketplace" 
            element={
              <ProtectedRoute>
                <MarketplacePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/saved-posts" 
            element={
              <ProtectedRoute>
                <SavedPostsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/agribot" 
            element={
              <ProtectedRoute>
                <AgriBot />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/"} replace />} />
        </Routes>
      </main>
      
      {!location.pathname.includes('/messages') && <Footer />}
    </div>
  );
};

export default App;