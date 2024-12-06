import React, { useState, useEffect } from 'react';
import interact from 'interactjs';

const WeatherComponent = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    interact('.weather-card')
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true }
      })
      .restrict({
        restriction: 'parent',
        endOnly: true
      })
      .on('resizemove', (event) => {
        event.target.style.width = `${event.rect.width}px`;
        event.target.style.height = `${event.rect.height}px`;
      });
  }, []);

  const getWeatherData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/weather');
      const data = await res.json();
      setWeatherData(data.weather);
    } catch (err) {
      console.error('Error fetching weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card weather-card p-3 shadow">
      <div className="card-body">
        <h5 className="card-title">Weather Information</h5>
        <button className="btn btn-primary mb-3" onClick={getWeatherData}>
          Get Weather
        </button>
        {loading ? (
          <p>Loading...</p>
        ) : (
          weatherData && (
            <div>
              <p>
                <strong>Location:</strong> {weatherData.name}
              </p>
              <p>
                <strong>Temperature:</strong> {weatherData.main.temp}°C
              </p>
              <p>
                <strong>Condition:</strong> {weatherData.weather[0].description}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default WeatherComponent;
