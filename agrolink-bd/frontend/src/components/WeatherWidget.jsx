import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Sun,
  CloudRain,
  Cloud,
  Wind,
  Droplets,
  AlertTriangle,
  MapPin,
  Sprout
} from 'lucide-react';

const districtsList = [
  'Dhaka', 'Rajshahi', 'Sylhet', 'Chittagong',
  'Barisal', 'Khulna', 'Rangpur', 'Mymensingh'
];

const WeatherWidget = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('Dhaka');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/smart/weather?district=${selectedDistrict}`);
        if (res.data.success) {
          setWeatherData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch weather advice');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [selectedDistrict]);

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'Sunny':
      case 'Hot & Dry':
        return <Sun className="h-12 w-12 text-amber-500 animate-spin-slow" />;
      case 'Heavy Rain':
        return <CloudRain className="h-12 w-12 text-blue-500 animate-bounce" />;
      case 'Scattered Showers':
        return <CloudRain className="h-12 w-12 text-teal-500" />;
      case 'Cloudy':
      case 'Partly Cloudy':
        return <Cloud className="h-12 w-12 text-slate-400" />;
      default:
        return <Sun className="h-12 w-12 text-amber-500" />;
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 shadow-sm border border-white/20 transition-all duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Sprout className="h-5 w-5 text-emerald-500" />
          <h3 className="font-semibold text-slate-800 dark:text-white">Smart Agri-Weather</h3>
        </div>
        
        {/* District Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl px-2 py-1">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none border-none cursor-pointer"
          >
            {districtsList.map((d) => (
              <option key={d} value={d} className="dark:bg-slate-900">{d}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-36 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : weatherData ? (
        <div className="space-y-4">
          
          {/* Temperature and Main Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {getWeatherIcon(weatherData.condition)}
              <div>
                <span className="text-3xl font-bold dark:text-white">{weatherData.temp}°C</span>
                <p className="text-xs text-slate-400">{weatherData.condition}</p>
              </div>
            </div>
            
            {/* Quick Metrics */}
            <div className="text-right space-y-1">
              <div className="flex items-center justify-end text-xs text-slate-500 dark:text-slate-400 space-x-1.5">
                <Droplets className="h-3.5 w-3.5 text-blue-500" />
                <span>Humidity: {weatherData.humidity}%</span>
              </div>
              <div className="flex items-center justify-end text-xs text-slate-500 dark:text-slate-400 space-x-1.5">
                <Wind className="h-3.5 w-3.5 text-slate-400" />
                <span>Wind: {weatherData.wind} km/h</span>
              </div>
            </div>
          </div>

          {/* Rain Probability Progress Bar */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>Rain Probability</span>
              <span>{weatherData.rainChance}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: weatherData.rainChance }}
              ></div>
            </div>
          </div>

          {/* Agricultural Advisory */}
          <div className="rounded-xl bg-emerald-50/50 dark:bg-slate-800/40 p-3 flex gap-2 border border-emerald-500/10">
            <AlertTriangle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 block mb-0.5">Farming Action Call:</span>
              {weatherData.advice}
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center text-xs text-slate-400 py-6">Could not load weather details.</div>
      )}
    </div>
  );
};

export default WeatherWidget;
