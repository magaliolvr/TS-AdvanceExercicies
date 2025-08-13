import React, { useState, useEffect } from "react";
import "./WeatherWidget.css";

// TypeScript interfaces for component props and data
interface WeatherWidgetProps {
	widgetId?: string;
	initialCity?: string;
}

interface WeatherData {
	current: CurrentWeather;
	hourly: HourlyForecast[];
	daily: DailyForecast[];
	location: LocationInfo;
}

interface CurrentWeather {
	temperature: number;
	feelsLike: number;
	humidity: number;
	windSpeed: number;
	description: string;
	icon: string;
	uvIndex: number;
	visibility: number;
}

interface HourlyForecast {
	time: string;
	temperature: number;
	description: string;
	icon: string;
	precipitation: number;
}

interface DailyForecast {
	date: string;
	high: number;
	low: number;
	description: string;
	icon: string;
	precipitation: number;
	uvIndex: number;
}

interface LocationInfo {
	city: string;
	country: string;
	latitude: number;
	longitude: number;
	timezone: string;
}

interface WeatherWidgetState {
	weatherData: WeatherData | null;
	loading: boolean;
	error: string | null;
	searchCity: string;
	unit: "celsius" | "fahrenheit";
	showHourly: boolean;
	showDaily: boolean;
	favorites: string[];
}

const WeatherWidgetTS: React.FC<WeatherWidgetProps> = ({
	widgetId = "weather123",
	initialCity = "London",
}) => {
	// TypeScript state with explicit typing
	const [weatherState, setWeatherState] = useState<WeatherWidgetState>({
		weatherData: null,
		loading: false,
		error: null,
		searchCity: "",
		unit: "celsius",
		showHourly: false,
		showDaily: false,
		favorites: [],
	});

	// Load favorites from localStorage on component mount
	useEffect(() => {
		const savedFavorites = localStorage.getItem(
			`weather_favorites_${widgetId}`
		);
		if (savedFavorites) {
			try {
				const parsedFavorites: string[] = JSON.parse(savedFavorites);
				setWeatherState((prev: WeatherWidgetState) => ({
					...prev,
					favorites: parsedFavorites,
				}));
			} catch (error) {
				console.error("Error parsing saved favorites:", error);
			}
		}
	}, [widgetId]);

	// Save favorites to localStorage
	useEffect(() => {
		localStorage.setItem(
			`weather_favorites_${widgetId}`,
			JSON.stringify(weatherState.favorites)
		);
	}, [weatherState.favorites, widgetId]);

	// Load initial weather data
	useEffect(() => {
		if (initialCity) {
			fetchWeatherData(initialCity);
		}
	}, [initialCity]);

	// Fetch weather data for a city
	const fetchWeatherData = async (city: string): Promise<void> => {
		setWeatherState((prev: WeatherWidgetState) => ({
			...prev,
			loading: true,
			error: null,
		}));

		try {
			// Simulate API call delay
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Generate mock weather data
			const mockWeatherData: WeatherData = generateMockWeatherData(city);

			setWeatherState((prev: WeatherWidgetState) => ({
				...prev,
				weatherData: mockWeatherData,
				loading: false,
			}));
		} catch (error) {
			setWeatherState((prev: WeatherWidgetState) => ({
				...prev,
				error: "Failed to fetch weather data",
				loading: false,
			}));
		}
	};

	// Generate mock weather data
	const generateMockWeatherData = (city: string): WeatherData => {
		const baseTemp: number = Math.floor(Math.random() * 30) + 5; // 5-35°C
		const currentTime: Date = new Date();

		// Generate hourly forecast (24 hours)
		const hourly: HourlyForecast[] = Array.from(
			{ length: 24 },
			(_, index: number) => {
				const hour: Date = new Date(currentTime);
				hour.setHours(currentTime.getHours() + index);

				return {
					time: hour.toLocaleTimeString("en-US", {
						hour: "2-digit",
						minute: "2-digit",
					}),
					temperature: baseTemp + Math.floor(Math.random() * 10) - 5,
					description: getRandomDescription(),
					icon: getRandomWeatherIcon(),
					precipitation: Math.floor(Math.random() * 100),
				};
			}
		);

		// Generate daily forecast (7 days)
		const daily: DailyForecast[] = Array.from(
			{ length: 7 },
			(_, index: number) => {
				const date: Date = new Date(currentTime);
				date.setDate(currentTime.getDate() + index);

				return {
					date: date.toLocaleDateString("en-US", {
						weekday: "short",
						month: "short",
						day: "numeric",
					}),
					high: baseTemp + Math.floor(Math.random() * 15) + 5,
					low: baseTemp + Math.floor(Math.random() * 10) - 10,
					description: getRandomDescription(),
					icon: getRandomWeatherIcon(),
					precipitation: Math.floor(Math.random() * 100),
					uvIndex: Math.floor(Math.random() * 10) + 1,
				};
			}
		);

		return {
			current: {
				temperature: baseTemp,
				feelsLike: baseTemp + Math.floor(Math.random() * 5) - 2,
				humidity: Math.floor(Math.random() * 40) + 40,
				windSpeed: Math.floor(Math.random() * 30) + 5,
				description: getRandomDescription(),
				icon: getRandomWeatherIcon(),
				uvIndex: Math.floor(Math.random() * 10) + 1,
				visibility: Math.floor(Math.random() * 10) + 5,
			},
			hourly,
			daily,
			location: {
				city,
				country: "United Kingdom",
				latitude: 51.5074 + (Math.random() - 0.5) * 0.1,
				longitude: -0.1278 + (Math.random() - 0.5) * 0.1,
				timezone: "Europe/London",
			},
		};
	};

	// Get random weather description
	const getRandomDescription = (): string => {
		const descriptions: string[] = [
			"Sunny",
			"Partly Cloudy",
			"Cloudy",
			"Light Rain",
			"Rain",
			"Thunderstorm",
			"Snow",
			"Foggy",
			"Clear",
			"Overcast",
		];
		return descriptions[Math.floor(Math.random() * descriptions.length)];
	};

	// Get random weather icon
	const getRandomWeatherIcon = (): string => {
		const icons: string[] = [
			"☀️",
			"⛅",
			"☁️",
			"🌧️",
			"⛈️",
			"🌨️",
			"🌫️",
			"🌤️",
			"🌥️",
		];
		return icons[Math.floor(Math.random() * icons.length)];
	};

	// Handle city search
	const handleCitySearch = (): void => {
		if (weatherState.searchCity.trim()) {
			fetchWeatherData(weatherState.searchCity.trim());
			setWeatherState((prev: WeatherWidgetState) => ({
				...prev,
				searchCity: "",
			}));
		}
	};

	// Handle key press for city search
	const handleCityKeyPress = (
		e: React.KeyboardEvent<HTMLInputElement>
	): void => {
		if (e.key === "Enter") {
			handleCitySearch();
		}
	};

	// Toggle temperature unit
	const toggleUnit = (): void => {
		setWeatherState((prev: WeatherWidgetState) => ({
			...prev,
			unit: prev.unit === "celsius" ? "fahrenheit" : "celsius",
		}));
	};

	// Convert temperature
	const convertTemperature = (temp: number): number => {
		if (weatherState.unit === "fahrenheit") {
			return Math.round((temp * 9) / 5 + 32);
		}
		return temp;
	};

	// Add/remove city from favorites
	const toggleFavorite = (city: string): void => {
		setWeatherState((prev: WeatherWidgetState) => ({
			...prev,
			favorites: prev.favorites.includes(city)
				? prev.favorites.filter((fav: string) => fav !== city)
				: [...prev.favorites, city],
		}));
	};

	// Toggle hourly forecast view
	const toggleHourlyView = (): void => {
		setWeatherState((prev: WeatherWidgetState) => ({
			...prev,
			showHourly: !prev.showHourly,
			showDaily: false,
		}));
	};

	// Toggle daily forecast view
	const toggleDailyView = (): void => {
		setWeatherState((prev: WeatherWidgetState) => ({
			...prev,
			showDaily: !prev.showDaily,
			showHourly: false,
		}));
	};

	// Get weather statistics
	const getWeatherStats = () => {
		if (!weatherState.weatherData) return null;

		const { current, hourly, daily } = weatherState.weatherData;
		const avgTemp: number =
			hourly.reduce(
				(sum: number, h: HourlyForecast) => sum + h.temperature,
				0
			) / hourly.length;
		const maxTemp: number = Math.max(
			...daily.map((d: DailyForecast) => d.high)
		);
		const minTemp: number = Math.min(...daily.map((d: DailyForecast) => d.low));
		const totalPrecipitation: number = daily.reduce(
			(sum: number, d: DailyForecast) => sum + d.precipitation,
			0
		);

		return { avgTemp, maxTemp, minTemp, totalPrecipitation };
	};

	if (weatherState.loading) {
		return (
			<div className="weather-widget">
				<div className="loading">Loading weather data...</div>
			</div>
		);
	}

	if (weatherState.error) {
		return (
			<div className="weather-widget">
				<div className="error">Error: {weatherState.error}</div>
			</div>
		);
	}

	if (!weatherState.weatherData) {
		return (
			<div className="weather-widget">
				<div className="no-data">No weather data available</div>
			</div>
		);
	}

	const { current, hourly, daily, location } = weatherState.weatherData;
	const stats = getWeatherStats();

	return (
		<div className="weather-widget">
			<div className="weather-header">
				<h2>Weather Widget</h2>
				<p>Widget ID: {widgetId}</p>
			</div>

			<div className="weather-search">
				<input
					type="text"
					value={weatherState.searchCity}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setWeatherState((prev: WeatherWidgetState) => ({
							...prev,
							searchCity: e.target.value,
						}))
					}
					onKeyPress={handleCityKeyPress}
					placeholder="Enter city name..."
					className="city-input"
				/>
				<button onClick={handleCitySearch} className="search-btn">
					Search
				</button>
			</div>

			<div className="weather-controls">
				<button onClick={toggleUnit} className="unit-toggle">
					°{weatherState.unit === "celsius" ? "C" : "F"}
				</button>
				<button
					onClick={() => toggleFavorite(location.city)}
					className={`favorite-btn ${
						weatherState.favorites.includes(location.city) ? "active" : ""
					}`}>
					{weatherState.favorites.includes(location.city) ? "★" : "☆"}
				</button>
				<button onClick={toggleHourlyView} className="view-toggle">
					Hourly
				</button>
				<button onClick={toggleDailyView} className="view-toggle">
					Daily
				</button>
			</div>

			<div className="current-weather">
				<div className="location-info">
					<h3>
						{location.city}, {location.country}
					</h3>
					<p className="coordinates">
						{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
					</p>
				</div>

				<div className="weather-main">
					<div className="temperature">
						<span className="temp-value">
							{convertTemperature(current.temperature)}°
						</span>
						<span className="temp-unit">
							{weatherState.unit === "celsius" ? "C" : "F"}
						</span>
					</div>
					<div className="weather-icon">{current.icon}</div>
					<div className="weather-description">{current.description}</div>
				</div>

				<div className="weather-details">
					<div className="detail-item">
						<span className="detail-label">Feels Like</span>
						<span className="detail-value">
							{convertTemperature(current.feelsLike)}°
						</span>
					</div>
					<div className="detail-item">
						<span className="detail-label">Humidity</span>
						<span className="detail-value">{current.humidity}%</span>
					</div>
					<div className="detail-item">
						<span className="detail-label">Wind</span>
						<span className="detail-value">{current.windSpeed} km/h</span>
					</div>
					<div className="detail-item">
						<span className="detail-label">UV Index</span>
						<span className="detail-value">{current.uvIndex}</span>
					</div>
					<div className="detail-item">
						<span className="detail-label">Visibility</span>
						<span className="detail-value">{current.visibility} km</span>
					</div>
				</div>
			</div>

			{weatherState.showHourly && (
				<div className="hourly-forecast">
					<h3>Hourly Forecast</h3>
					<div className="hourly-container">
						{hourly.slice(0, 12).map((hour: HourlyForecast, index: number) => (
							<div key={index} className="hourly-item">
								<div className="hourly-time">{hour.time}</div>
								<div className="hourly-icon">{hour.icon}</div>
								<div className="hourly-temp">
									{convertTemperature(hour.temperature)}°
								</div>
								<div className="hourly-precipitation">
									{hour.precipitation}%
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{weatherState.showDaily && (
				<div className="daily-forecast">
					<h3>7-Day Forecast</h3>
					<div className="daily-container">
						{daily.map((day: DailyForecast, index: number) => (
							<div key={index} className="daily-item">
								<div className="daily-date">{day.date}</div>
								<div className="daily-icon">{day.icon}</div>
								<div className="daily-temps">
									<span className="daily-high">
										{convertTemperature(day.high)}°
									</span>
									<span className="daily-low">
										{convertTemperature(day.low)}°
									</span>
								</div>
								<div className="daily-precipitation">{day.precipitation}%</div>
								<div className="daily-uv">UV: {day.uvIndex}</div>
							</div>
						))}
					</div>
				</div>
			)}

			{stats && (
				<div className="weather-stats">
					<div className="stat-item">
						<span className="stat-number">
							{convertTemperature(stats.avgTemp)}°
						</span>
						<span className="stat-label">Average Temp</span>
					</div>
					<div className="stat-item">
						<span className="stat-number">
							{convertTemperature(stats.maxTemp)}°
						</span>
						<span className="stat-label">High</span>
					</div>
					<div className="stat-item">
						<span className="stat-number">
							{convertTemperature(stats.minTemp)}°
						</span>
						<span className="stat-label">Low</span>
					</div>
					<div className="stat-item">
						<span className="stat-number">{stats.totalPrecipitation}%</span>
						<span className="stat-label">Precipitation</span>
					</div>
				</div>
			)}

			{weatherState.favorites.length > 0 && (
				<div className="favorites-section">
					<h3>Favorite Cities</h3>
					<div className="favorites-list">
						{weatherState.favorites.map((city: string) => (
							<button
								key={city}
								onClick={() => fetchWeatherData(city)}
								className="favorite-city">
								{city}
							</button>
						))}
					</div>
				</div>
			)}

			<div className="typescript-features">
				<h3>TypeScript Features Used:</h3>
				<ul>
					<li>
						<strong>Type Safety:</strong> All weather properties have defined
						interfaces
					</li>
					<li>
						<strong>Union Types:</strong> Temperature units use specific string
						literals
					</li>
					<li>
						<strong>Interface Contracts:</strong> Clear structure for weather
						data and forecasts
					</li>
					<li>
						<strong>Generic State:</strong> useState hooks with explicit typing
					</li>
					<li>
						<strong>Event Handler Types:</strong> React events are properly
						typed
					</li>
					<li>
						<strong>Array Methods:</strong> Type-safe filtering, mapping, and
						reducing
					</li>
					<li>
						<strong>Key Safety:</strong> Object property access is type-checked
					</li>
				</ul>
			</div>
		</div>
	);
};

export default WeatherWidgetTS;
