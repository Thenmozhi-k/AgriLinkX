import { useState } from 'react';
import { SendHorizontal, Bot, Leaf, Info } from 'lucide-react';

const AgriBot = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([
    {
      sender: 'bot',
      message: "Hello! I'm AgriBot, your agricultural assistant. How can I help you today? You can ask me about crop diseases, weather patterns, market prices, or farming techniques.",
      timestamp: new Date(),
    },
  ]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Add user message to conversation
    setConversation(prev => [
      ...prev,
      {
        sender: 'user',
        message: query,
        timestamp: new Date(),
      },
    ]);
    
    // Clear input and show loading
    setQuery('');
    setIsLoading(true);
    
    // In a real app, would call the AI chatbot API
    // Mock response for demonstration
    setTimeout(() => {
      let botResponse = '';
      
      if (query.toLowerCase().includes('tomato') && query.toLowerCase().includes('disease')) {
        botResponse = "Based on your description, it sounds like your tomato plants might be suffering from Early Blight. This fungal disease typically appears as dark spots with concentric rings on lower leaves first. To manage it: 1) Remove affected leaves immediately, 2) Ensure proper spacing between plants for air circulation, 3) Water at the base of plants, not the leaves, 4) Apply a copper-based fungicide following package instructions. Would you like more specific advice or information about prevention?";
      } else if (query.toLowerCase().includes('price') || query.toLowerCase().includes('market')) {
        botResponse = "Current market prices for major crops in your region: Rice: ₹1,850/quintal (↑2.5%), Wheat: ₹2,100/quintal (↓1.2%), Cotton: ₹6,250/quintal (↑0.8%), Sugarcane: ₹280/quintal (unchanged). These prices reflect the wholesale market as of today. Would you like to know about price trends or specific markets?";
      } else if (query.toLowerCase().includes('weather') || query.toLowerCase().includes('rain')) {
        botResponse = "Weather forecast for Punjab region for the next 5 days: Today: Partly Cloudy, 28°C, Wednesday: Sunny, 31°C, Thursday: Rain likely (70%), 27°C, Friday: Light showers, 26°C, Saturday: Partly cloudy, 28°C. The expected rainfall on Thursday could benefit crops that need moisture, but consider postponing any chemical applications until Friday evening.";
      } else if (query.toLowerCase().includes('fertilizer') || query.toLowerCase().includes('soil')) {
        botResponse = "For optimal soil health and fertility, I recommend a balanced approach. First, get a soil test to understand your specific needs. For most crops, a combination of organic matter (compost, manure) and balanced NPK fertilizer works well. Apply nitrogen in split doses throughout the growing season, and phosphorus/potassium before planting. Would you like specific recommendations for a particular crop?";
      } else {
        botResponse = "Thank you for your question. Based on the agricultural data available, I can provide some insights. However, to give you more specific and actionable advice, could you please provide more details about your crop type, growing region, and specific concerns? This will help me tailor my response to your particular situation.";
      }
      
      setConversation(prev => [
        ...prev,
        {
          sender: 'bot',
          message: botResponse,
          timestamp: new Date(),
        },
      ]);
      
      setIsLoading(false);
    }, 1500);
  };
  
  return (
    <div className="bg-gray-100 min-h-screen pb-6">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-primary-600 text-white p-4 flex items-center">
            <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center mr-3">
              <Bot className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">AgriBot Assistant</h1>
              <p className="text-primary-100 text-sm">Powered by AI for agricultural insights</p>
            </div>
          </div>
          
          {/* Info Banner */}
          <div className="bg-primary-50 p-4 border-b border-primary-100 flex items-start">
            <Info className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-primary-800">
              AgriBot can answer questions about crop diseases, weather patterns, market prices, and farming techniques. Your conversations help improve the AI's knowledge.
            </p>
          </div>
          
          {/* Conversation */}
          <div className="p-4 h-[500px] overflow-y-auto flex flex-col space-y-4">
            {conversation.map((item, index) => (
              <div
                key={index}
                className={`flex ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    item.sender === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {item.sender === 'bot' && (
                    <div className="flex items-center mb-1">
                      <Leaf className="h-4 w-4 text-primary-600 mr-1" />
                      <span className="font-medium text-primary-700">AgriBot</span>
                    </div>
                  )}
                  <p className="whitespace-pre-line">{item.message}</p>
                  <p
                    className={`text-xs mt-1 text-right ${
                      item.sender === 'user' ? 'text-primary-100' : 'text-gray-500'
                    }`}
                  >
                    {item.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-gray-100">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-200 mr-1"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-400"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input Form */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex items-center">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask AgriBot about farming, crops, weather, or markets..."
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none max-h-32"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              ></textarea>
              <button
                type="submit"
                disabled={!query.trim() || isLoading}
                className={`p-3 rounded-r-md ${
                  !query.trim() || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                <SendHorizontal className="h-5 w-5" />
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for a new line
            </p>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              AgriBot provides general agricultural information and is not a substitute for professional advice. Always consult with local agricultural experts for your specific needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgriBot;
