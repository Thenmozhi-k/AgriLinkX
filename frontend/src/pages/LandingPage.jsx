import { useState } from 'react';
import { Leaf, Users, MessageSquare, BarChart, CloudLightning, Shield, Bot, Target } from 'lucide-react';
import AuthModal from '../components/auth/AuthModal';
import Footer from '../components/common/Footer';

const LandingPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  
  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-800 to-primary-600 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6">
                Connect, Collaborate & Cultivate with AgriLinkX
              </h1>
              <p className="text-lg md:text-xl text-primary-50 mb-8 max-w-lg">
                The smart platform connecting farmers, buyers, and agricultural experts in a data-driven ecosystem to enhance productivity and sustainability.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => openAuthModal('signup')}
                  className="px-8 py-3 bg-white text-primary-700 rounded-full hover:bg-gray-100 transition duration-200 font-semibold text-lg"
                >
                  Get Started
                </button>
                <button 
                  onClick={() => openAuthModal('login')}
                  className="px-8 py-3 bg-primary-700 text-white rounded-full hover:bg-primary-800 transition duration-200 font-semibold text-lg border border-primary-400"
                >
                  Sign In
                </button>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Agricultural collaboration" 
                className="rounded-lg shadow-2xl max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6">
              <p className="text-3xl md:text-4xl font-bold text-primary-700 mb-2">10,000+</p>
              <p className="text-gray-600">Active Farmers</p>
            </div>
            <div className="p-6">
              <p className="text-3xl md:text-4xl font-bold text-primary-700 mb-2">1,200+</p>
              <p className="text-gray-600">Agricultural Experts</p>
            </div>
            <div className="p-6">
              <p className="text-3xl md:text-4xl font-bold text-primary-700 mb-2">500+</p>
              <p className="text-gray-600">Community Groups</p>
            </div>
            <div className="p-6">
              <p className="text-3xl md:text-4xl font-bold text-primary-700 mb-2">15,000+</p>
              <p className="text-gray-600">Connections Made</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Transforming Agriculture Through Connection
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AgriLinkX brings together smart technology and real-time collaboration to create a thriving agricultural ecosystem.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Collaborative Network</h3>
              <p className="text-gray-600">
                Connect with fellow farmers, buyers, suppliers, and experts to share knowledge and opportunities.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AgriBot Assistant</h3>
              <p className="text-gray-600">
                Get instant answers to your farming questions from our AI-powered agricultural assistant.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community Groups</h3>
              <p className="text-gray-600">
                Join district-based farming communities to discuss local challenges and share solutions.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Target className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Marketplace</h3>
              <p className="text-gray-600">
                Connect directly with buyers and suppliers to sell your produce at fair prices.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <CloudLightning className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Weather Alerts</h3>
              <p className="text-gray-600">
                Receive timely weather forecasts and alerts specific to your farming location.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <BarChart className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Market Insights</h3>
              <p className="text-gray-600">
                Access real-time crop prices and market trends to make informed selling decisions.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Disease Alerts</h3>
              <p className="text-gray-600">
                Get early warnings about crop diseases and pest outbreaks in your region.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Leaf className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Sustainable Practices</h3>
              <p className="text-gray-600">
                Access resources on sustainable farming techniques and eco-friendly practices.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              How AgriLinkX Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform connects you to the world of agriculture through smart, innovative solutions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-primary-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                <Target className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 1: Sign Up</h3>
              <p className="text-gray-600">
                Create your account and set up your farmer or buyer profile.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 2: Connect</h3>
              <p className="text-gray-600">
                Start connecting with other farmers, suppliers, and buyers to exchange ideas and opportunities.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                <CloudLightning className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 3: Thrive</h3>
              <p className="text-gray-600">
                Leverage resources, expert advice, and market insights to grow your business.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-primary-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-primary-200 max-w-3xl mx-auto">
              Hear from the farmers, buyers, and experts who have seen the impact of AgriLinkX firsthand.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {/* Testimonial 1 */}
            <div className="bg-primary-700 p-8 rounded-xl shadow-lg text-center max-w-xs">
              <p className="text-lg text-primary-50 mb-4">
                "AgriLinkX has completely transformed the way we manage our crops and reach buyers. It's a game-changer!"
              </p>
              <p className="text-sm text-primary-100 font-semibold">John Doe</p>
              <p className="text-xs text-primary-200">Farmer</p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-primary-700 p-8 rounded-xl shadow-lg text-center max-w-xs">
              <p className="text-lg text-primary-50 mb-4">
                "I found buyers for all my produce through AgriLinkX. It’s the perfect platform for connecting with other farmers."
              </p>
              <p className="text-sm text-primary-100 font-semibold">Jane Smith</p>
              <p className="text-xs text-primary-200">Farmer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
     

      {/* Authentication Modal */}
      {showAuthModal && (
        <AuthModal mode={authMode} onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default LandingPage;
