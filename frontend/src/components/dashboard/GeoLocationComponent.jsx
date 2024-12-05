import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import interact from 'interactjs';

const GeoLocationComponent = () => {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    interact('.geo-card')
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

  const getGeoData = async () => {
    setLoading(true);
    const res = await fetch('/api/dashboard/geolocation');
    const data = await res.json();
    setGeoData(data);
    setLoading(false);
  };

  return (
    <Card className="geo-card p-3">
      <Card.Body>
        <Card.Title>Geolocation Information</Card.Title>
        <Button variant="primary" onClick={getGeoData}>Get Location</Button>
        {loading ? <p>Loading...</p> : (
          geoData && (
            <div>
              <p><strong>IP:</strong> {geoData.ip}</p>
              <p><strong>Location:</strong> {geoData.city}, {geoData.country}</p>
            </div>
          )
        )}
      </Card.Body>
    </Card>
  );
};

export default GeoLocationComponent;
