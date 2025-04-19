import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

const MarketPriceWidget = () => {
  const [prices, setPrices] = useState([
    { crop: 'Rice', price: 1850, change: 2.5, trend: 'up' },
    { crop: 'Wheat', price: 2100, change: -1.2, trend: 'down' },
    { crop: 'Cotton', price: 6250, change: 0.8, trend: 'up' },
    { crop: 'Sugarcane', price: 280, change: 0, trend: 'neutral' },
  ]);
  
  // In a real app, would fetch market data from an API
  // useEffect(() => {
  //   const fetchMarketPrices = async () => {
  //     try {
  //       const response = await fetch(`/api/agri-data/market-price/all`);
  //       const data = await response.json();
  //       setPrices(data);
  //     } catch (error) {
  //       console.error('Failed to fetch market prices:', error);
  //     }
  //   };
  //   
  //   fetchMarketPrices();
  // }, []);
  
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <span className="h-4 w-4 inline-block">—</span>;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Market Prices</h3>
        <button className="text-primary-600 text-sm font-medium">See All</button>
      </div>
      
      <div className="overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="py-2">Crop</th>
              <th className="py-2 text-right">Price (₹/q)</th>
              <th className="py-2 text-right">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {prices.map((item, index) => (
              <tr key={index}>
                <td className="py-2.5 text-sm font-medium text-gray-900">{item.crop}</td>
                <td className="py-2.5 text-sm text-gray-900 text-right">₹{item.price}</td>
                <td className="py-2.5 text-sm text-right flex items-center justify-end">
                  {getTrendIcon(item.trend)}
                  <span className={`ml-1 ${
                    item.trend === 'up' 
                      ? 'text-green-600' 
                      : item.trend === 'down' 
                      ? 'text-red-600' 
                      : 'text-gray-600'
                  }`}>
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <button className="w-full mt-4 flex items-center justify-center space-x-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200 text-sm font-medium">
        <span>View Market Analysis</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default MarketPriceWidget;
