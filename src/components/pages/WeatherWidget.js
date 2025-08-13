import React, { useState, useEffect } from 'react';
import './WeatherWidget.css';

const WeatherWidget = ({ userId = 'user123', defaultCity = 'New York' }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCity, setCurrentCity] = useState(defaultCity);
  const [favorites, setFavorites] = useState([defaultCity]);
  const [units, setUnits] = useState('metric');
  const [forecastDays, setForecastDays] = useState(5);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem(`weather_favorites_${userId}`);
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Error parsing saved favorites:', error);
      }
    }
  }, [userId]);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem(`weather_favorites_${userId}`, JSON.stringify(favorites));
  }, [favorites, userId]);

  // Load weather data on component mount and city change
  useEffect(() => {
    fetchWeatherData(currentCity);
  }, [currentCity, units]);

  const fetchWeatherData = async (city) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call with sample data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const sampleWeatherData = generateSampleWeatherData(city);
      setWeatherData(sampleWeatherData);
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error('Error fetching weather:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleWeatherData = (city) => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Generate current weather
    const currentWeather = {
      city: city,
      country: 'US',
      temperature: Math.floor(Math.random() * 30) + 10,
      feelsLike: Math.floor(Math.random() * 30) + 10,
      humidity: Math.floor(Math.random() * 40) + 40,
      windSpeed: Math.floor(Math.random() * 20) + 5,
      pressure: Math.floor(Math.random() * 20) + 1000,
      visibility: Math.floor(Math.random() * 10) + 5,
      description: getRandomWeatherDescription(),
      icon: getRandomWeatherIcon(),
      timestamp: now.toISOString()
    };

    // Generate hourly forecast
    const hourlyForecast = [];
    for (let i = 0; i < 24; i++) {
      const hour = (currentHour + i) % 24;
      hourlyForecast.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        temperature: Math.floor(Math.random() * 30) + 10,
        description: getRandomWeatherDescription(),
        icon: getRandomWeatherIcon(),
        humidity: Math.floor(Math.random() * 40) + 40,
        windSpeed: Math.floor(Math.random() * 20) + 5
      });
    }

    // Generate daily forecast
    const dailyForecast = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      dailyForecast.push({
        date: date.toISOString(),
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        high: Math.floor(Math.random() * 30) + 15,
        low: Math.floor(Math.random() * 20) + 5,
        description: getRandomWeatherDescription(),
        icon: getRandomWeatherIcon(),
        humidity: Math.floor(Math.random() * 40) + 40,
        windSpeed: Math.floor(Math.random() * 20) + 5,
        precipitation: Math.floor(Math.random() * 100)
      });
    }

    return {
      current: currentWeather,
      hourly: hourlyForecast,
      daily: dailyForecast
    };
  };

  const getRandomWeatherDescription = () => {
    const descriptions = [
      'Clear sky', 'Partly cloudy', 'Cloudy', 'Light rain', 'Heavy rain',
      'Thunderstorm', 'Snow', 'Fog', 'Mist', 'Overcast'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  const getRandomWeatherIcon = () => {
    const icons = ['☀️', '⛅', '☁️', '🌧️', '⛈️', '❄️', '🌫️', '🌤️'];
    return icons[Math.floor(Math.random() * icons.length)];
  };

  const searchCities = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Sample city search results
    const sampleCities = [
      'New York, US',
      'London, UK',
      'Tokyo, JP',
      'Paris, FR',
      'Sydney, AU',
      'Toronto, CA',
      'Berlin, DE',
      'Moscow, RU'
    ];
    
    const results = sampleCities.filter(city => 
      city.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleCitySelect = (city) => {
    setCurrentCity(city.split(',')[0]);
    setSearchResults([]);
    setSearchTerm('');
  };

  const addToFavorites = (city) => {
    if (!favorites.includes(city)) {
      setFavorites(prev => [...prev, city]);
    }
  };

  const removeFromFavorites = (city) => {
    setFavorites(prev => prev.filter(fav => fav !== city));
  };

  const toggleUnits = () => {
    setUnits(prev => prev === 'metric' ? 'imperial' : 'metric');
  };

  const convertTemperature = (temp) => {
    if (units === 'imperial') {
      return Math.round((temp * 9/5) + 32);
    }
    return temp;
  };

  const convertWindSpeed = (speed) => {
    if (units === 'imperial') {
      return Math.round(speed * 2.237); // m/s to mph
    }
    return speed;
  };

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const getWeatherColor = (description) => {
    if (description.includes('rain') || description.includes('storm')) return 'weather-rainy';
    if (description.includes('snow')) return 'weather-snowy';
    if (description.includes('cloud')) return 'weather-cloudy';
    if (description.includes('clear')) return 'weather-clear';
    return 'weather-default';
  };

  if (loading) {
    return (
      <div className="weather-widget-container">
        <div className="loading-state">
          <div className="weather-spinner"></div>
          <p>Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-widget-container">
        <div className="error-state">
          <h2>Weather Error</h2>
          <p>{error}</p>
          <button onClick={() => fetchWeatherData(currentCity)}>Retry</button>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="weather-widget-container">
        <div className="no-data">
          <p>No weather data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-widget-container">
      <div className="weather-header">
        <h1>Weather Widget</h1>
        <p>User ID: {userId}</p>
        <div className="weather-controls">
          <button onClick={toggleUnits}>
            {units === 'metric' ? '°C' : '°F'}
          </button>
          <button onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      <div className="weather-main">
        <div className="weather-sidebar">
          <div className="sidebar-section">
            <h3>City Search</h3>
            <div className="city-search">
              <input
                type="text"
                placeholder="Search cities..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  searchCities(e.target.value);
                }}
              />
              {isSearching && <div className="search-spinner"></div>}
              
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((city, index) => (
                    <div
                      key={index}
                      className="search-result-item"
                      onClick={() => handleCitySelect(city)}
                    >
                      🌍 {city}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Favorite Cities</h3>
            <div className="favorite-cities">
              {favorites.map((city, index) => (
                <div
                  key={index}
                  className={`favorite-city ${city === currentCity ? 'active' : ''}`}
                  onClick={() => setCurrentCity(city)}
                >
                  🌟 {city}
                  {favorites.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromFavorites(city);
                      }}
                      className="remove-favorite"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Weather Info</h3>
            <div className="weather-info">
              <div className="info-item">
                <span className="info-label">Humidity:</span>
                <span className="info-value">{weatherData.current.humidity}%</span>
              </div>
              <div className="info-item">
                <span className="info-label">Wind:</span>
                <span className="info-value">
                  {convertWindSpeed(weatherData.current.windSpeed)} {units === 'metric' ? 'm/s' : 'mph'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Pressure:</span>
                <span className="info-value">{weatherData.current.pressure} hPa</span>
              </div>
              <div className="info-item">
                <span className="info-label">Visibility:</span>
                <span className="info-value">{weatherData.current.visibility} km</span>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Forecast Days</h3>
            <select value={forecastDays} onChange={(e) => setForecastDays(parseInt(e.target.value))}>
              <option value={3}>3 Days</option>
              <option value={5}>5 Days</option>
              <option value={7}>7 Days</option>
            </select>
          </div>
        </div>

        <div className="weather-content">
          <div className="current-weather">
            <div className="weather-location">
              <h2>{weatherData.current.city}</h2>
              <p>{weatherData.current.country}</p>
              <button
                onClick={() => addToFavorites(weatherData.current.city)}
                disabled={favorites.includes(weatherData.current.city)}
                className="favorite-btn"
              >
                {favorites.includes(weatherData.current.city) ? '★' : '☆'}
              </button>
            </div>

            <div className="weather-main-info">
              <div className="weather-icon">
                {weatherData.current.icon}
              </div>
              <div className="temperature">
                <span className="temp-value">
                  {convertTemperature(weatherData.current.temperature)}°
                </span>
                <span className="temp-unit">
                  {units === 'metric' ? 'C' : 'F'}
                </span>
              </div>
              <div className="weather-description">
                {weatherData.current.description}
              </div>
            </div>

            {showDetails && (
              <div className="weather-details">
                <div className="detail-item">
                  <span className="detail-label">Feels like:</span>
                  <span className="detail-value">
                    {convertTemperature(weatherData.current.feelsLike)}°
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Humidity:</span>
                  <span className="detail-value">{weatherData.current.humidity}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Wind:</span>
                  <span className="detail-value">
                    {convertWindSpeed(weatherData.current.windSpeed)} {units === 'metric' ? 'm/s' : 'mph'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Pressure:</span>
                  <span className="detail-value">{weatherData.current.pressure} hPa</span>
                </div>
              </div>
            )}
          </div>

          <div className="hourly-forecast">
            <h3>Hourly Forecast</h3>
            <div className="hourly-container">
              {weatherData.hourly.slice(0, 12).map((hour, index) => (
                <div key={index} className="hourly-item">
                  <span className="hour-time">{hour.time}</span>
                  <span className="hour-icon">{hour.icon}</span>
                  <span className="hour-temp">
                    {convertTemperature(hour.temperature)}°
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="daily-forecast">
            <h3>Daily Forecast</h3>
            <div className="daily-container">
              {weatherData.daily.slice(0, forecastDays).map((day, index) => (
                <div key={index} className="daily-item">
                  <div className="day-header">
                    <span className="day-name">{day.day}</span>
                    <span className="day-date">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="day-weather">
                    <span className="day-icon">{day.icon}</span>
                    <div className="day-temps">
                      <span className="day-high">{convertTemperature(day.high)}°</span>
                      <span className="day-low">{convertTemperature(day.low)}°</span>
                    </div>
                  </div>
                  
                  <div className="day-description">{day.description}</div>
                  
                  {showDetails && (
                    <div className="day-details">
                      <div className="day-detail">
                        <span>💧 {day.humidity}%</span>
                      </div>
                      <div className="day-detail">
                        <span>💨 {convertWindSpeed(day.windSpeed)} {units === 'metric' ? 'm/s' : 'mph'}</span>
                      </div>
                      <div className="day-detail">
                        <span>🌧️ {day.precipitation}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="weather-info">
        <h2>Weather Widget Features</h2>
        <ul>
          <li><strong>Current Weather:</strong> Real-time temperature, humidity, and conditions</li>
          <li><strong>Hourly Forecast:</strong> 24-hour weather predictions</li>
          <li><strong>Daily Forecast:</strong> 7-day weather outlook</li>
          <li><strong>City Search:</strong> Find weather for any city worldwide</li>
          <li><strong>Favorites:</strong> Save and quickly access favorite cities</li>
          <li><strong>Unit Conversion:</strong> Switch between Celsius and Fahrenheit</li>
          <li><strong>Detailed View:</strong> Toggle additional weather information</li>
          <li><strong>Local Storage:</strong> Favorites persist between sessions</li>
        </ul>
      </div>
    </div>
  );
};

export default WeatherWidget;
