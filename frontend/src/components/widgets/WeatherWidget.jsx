import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets } from 'lucide-react';

const WeatherWidget = () => {
  const [weather, setWeather] = useState({
    temperature: 28,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    forecast: [
      { day: 'Tue', temp: 29, condition: 'sunny' },
      { day: 'Wed', temp: 31, condition: 'sunny' },
      { day: 'Thu', temp: 27, condition: 'rainy' },
      { day: 'Fri', temp: 26, condition: 'rainy' },
      { day: 'Sat', temp: 28, condition: 'cloudy' },
    ]
  });
  
  // In a real app, would fetch weather data from an API
  // useEffect(() => {
  //   const fetchWeather = async () => {
  //     try {
  //       const response = await fetch(`/api/agri-data/weather/punjab`);
  //       const data = await response.json();
  //       setWeather(data);
  //     } catch (error) {
  //       console.error('Failed to fetch weather data:', error);
  //     }
  //   };
  //   
  //   fetchWeather();
  // }, []);
  
  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'rainy':
        return <CloudRain className="h-6 w-6 text-blue-500" />;
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud className="h-6 w-6 text-gray-500" />;
      default:
        return <Cloud className="h-6 w-6 text-gray-500" />;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Weather Forecast</h3>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getWeatherIcon(weather.condition)}
          <div className="ml-3">
            <p className="text-3xl font-bold">{weather.temperature}°C</p>
            <p className="text-gray-600">{weather.condition}</p>
          </div>
        </div>
        
        <div>
          <p className="text-right text-sm text-gray-600">Punjab</p>
          <p className="text-right text-xs text-gray-500">Today</p>
        </div>
      </div>
      
      <div className="flex justify-between mt-4 text-sm text-gray-600">
        <div className="flex items-center">
          <Droplets className="h-4 w-4 mr-1 text-blue-500" />
          <span>{weather.humidity}%</span>
        </div>
        <div className="flex items-center">
          <Wind className="h-4 w-4 mr-1 text-teal-500" />
          <span>{weather.windSpeed} km/h</span>
        </div>
      </div>
      
      <div className="border-t border-gray-200 mt-4 pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">5-Day Forecast</h4>
        <div className="flex justify-between">
          {weather.forecast.map((day, index) => (
            <div key={index} className="text-center">
              <p className="text-xs font-medium">{day.day}</p>
              <div className="my-1">
                {getWeatherIcon(day.condition)}
              </div>
              <p className="text-sm font-medium">{day.temp}°</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500">
          Weather data is important for planning your agricultural activities
        </p>
      </div>
    </div>
  );
};

export default WeatherWidget;
