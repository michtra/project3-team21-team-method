// src/hooks/useWeather.js
import { useState } from 'react';
import { fetchWeather } from '../api';

const useWeather = (defaultCity = 'College Station') => {
    const [showWeatherModal, setShowWeatherModal] = useState(false);
    const [weatherData, setWeatherData] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [weatherError, setWeatherError] = useState(null);
    const [weatherCity] = useState(defaultCity);

    const loadWeatherData = async () => {
        setWeatherLoading(true);
        setWeatherError(null);
        setWeatherData(null); // Clear old data
        try {
            console.log(`Fetching weather for ${weatherCity}...`);
            const data = await fetchWeather(weatherCity); // Use the configured city
            console.log('Weather data received:', data);
            setWeatherData(data);
        } catch (err) {
            console.error("Weather fetch failed:", err);
            setWeatherError(err.message || 'Could not fetch weather data.');
        } finally {
            setWeatherLoading(false);
        }
    };

    const handleOpenWeatherModal = () => {
        setShowWeatherModal(true);
        loadWeatherData();
    };

    const handleCloseWeatherModal = () => {
        setShowWeatherModal(false);
    };

    return {
        weatherCity,
        weatherData,
        weatherLoading,
        weatherError,
        showWeatherModal,
        handleOpenWeatherModal,
        handleCloseWeatherModal
    };
};

export default useWeather;