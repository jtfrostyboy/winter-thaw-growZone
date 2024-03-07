import React, { useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

export default function PlantRecommender() {
  const [zipCode, setZipCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [plantRecommendations, setPlantRecommendations] = useState([]);

  const fetchLatLongFromZip = async (zipCode) => {
    try {
      const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;
      const url = `http://api.openweathermap.org/geo/1.0/zip?zip=${zipCode},us&appid=${apiKey}`;
      const response = await axios.get(url);
      return { lat: response.data.lat, lon: response.data.lon };
    } catch (error) {
      console.error('Error fetching geocode:', error);
      throw new Error('Failed to fetch geocode. Please check the ZIP code and try again.');
    }
  };

  const fetchHistoricalWeather = async (lat, lon) => {
    try {
      const month = new Date().getMonth() + 1; // Fetch for current month
      const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;
      const url = `https://history.openweathermap.org/data/2.5/aggregated/month?month=${month}&lat=${lat}&lon=${lon}&appid=${apiKey}`;
      const response = await axios.get(url);
      return response.data.result;
    } catch (error) {
      console.error('Error fetching historical weather data:', error);
      throw new Error('Failed to fetch historical weather data. Please try again later.');
    }
  };

  const fetchAndRecommendPlants = async (precipitationMedian) => {
    const csvFileUrl = '/plants.csv';
  
    const response = await fetch(csvFileUrl);
    const reader = response.body.getReader();
    const result = await reader.read();
    const decoder = new TextDecoder('utf-8');
    const csv = decoder.decode(result.value);
  
    return new Promise((resolve, reject) => {
      Papa.parse(csv, {
        header: true,
        complete: (results) => {
          const plants = results.data;
          const recommendedPlants = plants.filter(plant => {
            const depthRequirement = parseInt(plant.depth_water_requirement, 10);
            return (
              plant.depth_water_requirement &&
              !isNaN(depthRequirement) &&
              depthRequirement < (precipitationMedian + 1)
            );
          }).map(plant => ({
            id: plant.id,
            common_name: plant.common_name,
            scientific_name: plant.scientific_name,
            other_name: plant.other_name,
            watering: plant.watering,
            depth_water_requirement: plant.depth_water_requirement,
            care_level: plant.care_level,
            sunlight: plant.sunlight,
            soil: plant.soil,
            drought_tolerant: plant.drought_tolerant,
            maintenance: plant.maintenance,
            pest_susceptibility: plant.pest_susceptibility,
            flowering_season: plant.flowering_season,
            default_image: plant.default_image,
            description: plant.description,
            poisonous_to_humans: plant.poisonous_to_humans,
            poisonous_to_pets: plant.poisonous_to_pets
          }));
          resolve(recommendedPlants);
        },
        error: (error) => reject(error),
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setPlantRecommendations([]);

    try {
      const { lat, lon } = await fetchLatLongFromZip(zipCode);
      const weatherData = await fetchHistoricalWeather(lat, lon);
      const recommendedPlants = await fetchAndRecommendPlants(weatherData.precipitation.median);
      setPlantRecommendations(recommendedPlants);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Plant Recommender</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="zipCode">Enter your zip code:</label>
        <input
          type="text"
          id="zipCode"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Get Recommendations'}
        </button>
      </form>
      {error && <p>Error: {error}</p>}
      <div>
        {plantRecommendations.map((plant) => (
          <div key={plant.id}>
            <h3>{plant.common_name} ({plant.scientific_name})</h3>
            <p>{plant.description}</p>
            {/* Render plant image if exists */}
            {plant.default_image && <img src={plant.default_image} alt={plant.common_name} />}
            {/* Add more plant details you want to render */}
          </div>
        ))}
      </div>
    </div>
  );
}
