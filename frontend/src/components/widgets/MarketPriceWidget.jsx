// import { useState, useEffect } from 'react';
// import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

// const MarketPriceWidget = () => {
//   const [prices, setPrices] = useState([
//     { crop: 'Rice', price: 1850, change: 2.5, trend: 'up' },
//     { crop: 'Wheat', price: 2100, change: -1.2, trend: 'down' },
//     { crop: 'Cotton', price: 6250, change: 0.8, trend: 'up' },
//     { crop: 'Sugarcane', price: 280, change: 0, trend: 'neutral' },
//   ]);
  
//   // In a real app, would fetch market data from an API
//   // useEffect(() => {
//   //   const fetchMarketPrices = async () => {
//   //     try {
//   //       const response = await fetch(`/api/agri-data/market-price/all`);
//   //       const data = await response.json();
//   //       setPrices(data);
//   //     } catch (error) {
//   //       console.error('Failed to fetch market prices:', error);
//   //     }
//   //   };
//   //   
//   //   fetchMarketPrices();
//   // }, []);
  
//   const getTrendIcon = (trend) => {
//     switch (trend) {
//       case 'up':
//         return <TrendingUp className="h-4 w-4 text-green-600" />;
//       case 'down':
//         return <TrendingDown className="h-4 w-4 text-red-600" />;
//       default:
//         return <span className="h-4 w-4 inline-block">—</span>;
//     }
//   };
  
//   return (
//     <div className="bg-white rounded-lg shadow-sm p-4">
//       <div className="flex justify-between items-center mb-4">
//         <h3 className="font-semibold text-gray-900">Market Prices</h3>
//         <button className="text-primary-600 text-sm font-medium">See All</button>
//       </div>
      
//       <div className="overflow-hidden">
//         <table className="min-w-full">
//           <thead>
//             <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//               <th className="py-2">Crop</th>
//               <th className="py-2 text-right">Price (₹/q)</th>
//               <th className="py-2 text-right">Change</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {prices.map((item, index) => (
//               <tr key={index}>
//                 <td className="py-2.5 text-sm font-medium text-gray-900">{item.crop}</td>
//                 <td className="py-2.5 text-sm text-gray-900 text-right">₹{item.price}</td>
//                 <td className="py-2.5 text-sm text-right flex items-center justify-end">
//                   {getTrendIcon(item.trend)}
//                   <span className={`ml-1 ${
//                     item.trend === 'up' 
//                       ? 'text-green-600' 
//                       : item.trend === 'down' 
//                       ? 'text-red-600' 
//                       : 'text-gray-600'
//                   }`}>
//                     {item.change > 0 ? '+' : ''}{item.change}%
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
      
//       <button className="w-full mt-4 flex items-center justify-center space-x-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200 text-sm font-medium">
//         <span>View Market Analysis</span>
//         <ArrowRight className="h-4 w-4" />
//       </button>
//     </div>
//   );
// };

// export default MarketPriceWidget;


import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';

const MarketPriceWidget = ({ compact = false }) => {
  const [prices, setPrices] = useState([
    { crop: 'Rice', price: 2250, change: 3.5 },
    { crop: 'Wheat', price: 1980, change: -1.2 },
    { crop: 'Cotton', price: 6500, change: 0.8 },
    { crop: 'Sugarcane', price: 350, change: 0 },
    { crop: 'Maize', price: 1850, change: 2.1 }
  ]);

  // In a real app, you would fetch market price data here
  useEffect(() => {
    // Simulate API call
    // fetchMarketPrices().then(data => setPrices(data));
  }, []);

  const getTrendIcon = (change) => {
    if (change > 0) {
      return <TrendingUp className="text-green-500" />;
    } else if (change < 0) {
      return <TrendingDown className="text-red-500" />;
    } else {
      return <Minus className="text-gray-500" />;
    }
  };

  if (compact) {
    return (
      <div className="text-sm">
        <div className="space-y-2">
          {prices.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="font-medium">{item.crop}</span>
              <div className="flex items-center">
                <span className="mr-2">₹{item.price}/q</span>
                <div className="flex items-center">
                  {getTrendIcon(item.change)}
                  <span className={`text-xs ml-1 ${
                    item.change > 0 ? 'text-green-500' : 
                    item.change < 0 ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {Math.abs(item.change)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-center text-gray-500">
          <a href="#" className="text-primary-600 hover:underline">View all market prices</a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Market Prices</h3>
        <button className="text-primary-600 text-sm font-medium">See All</button>
      </div>
      
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
              <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₹/q)</th>
              <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {prices.map((item, index) => (
              <tr key={index}>
                <td className="px-2 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.crop}</td>
                <td className="px-2 py-3 whitespace-nowrap text-sm text-right text-gray-700">₹{item.price}</td>
                <td className="px-2 py-3 whitespace-nowrap text-sm text-right">
                  <div className="flex items-center justify-end">
                    {getTrendIcon(item.change)}
                    <span className={`ml-1 ${
                      item.change > 0 ? 'text-green-500' : 
                      item.change < 0 ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {Math.abs(item.change)}%
                    </span>
                  </div>
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
