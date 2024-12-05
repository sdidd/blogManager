import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
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
    const res = await fetch('/api/dashboard/weather');
    const data = await res.json();
    setWeatherData(data);
    setLoading(false);
  };

  return (
    <Card className="weather-card p-3">
      <Card.Body>
        <Card.Title>Weather Information</Card.Title>
        <Button variant="primary" onClick={getWeatherData}>Get Weather</Button>
        {loading ? <p>Loading...</p> : (
          weatherData && (
            <div>
              <p><strong>Location:</strong> {weatherData.name}</p>
              <p><strong>Temperature:</strong> {weatherData.main.temp}°C</p>
              <p><strong>Condition:</strong> {weatherData.weather[0].description}</p>
            </div>
          )
        )}
      </Card.Body>
    </Card>
  );
};

export default WeatherComponent;
