import React, { useState, useEffect } from 'react';
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
    try {
      const res = await fetch('/api/dashboard/geolocation');
      const data = await res.json();
      setGeoData(data.geolocation);
    } catch (err) {
      console.error('Error fetching geolocation data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card geo-card p-3 shadow">
      <div className="card-body">
        <h5 className="card-title">Geolocation Information</h5>
        <button className="btn btn-primary mb-3" onClick={getGeoData}>
          Get Location
        </button>
        {loading ? (
          <p>Loading...</p>
        ) : (
          geoData && (
            <div>
              <p>
                <strong>IP:</strong> {geoData.ip}
              </p>
              <p>
                <strong>Location:</strong> {geoData.city}, {geoData.country_name}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default GeoLocationComponent;
