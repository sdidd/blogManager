import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import interact from 'interactjs';

const NasaComponent = () => {
  const [nasaData, setNasaData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    interact('.nasa-card')
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

  const getNasaData = async () => {
    setLoading(true);
    const res = await fetch('/api/dashboard/nasa');
    const data = await res.json();
    setNasaData(data);
    setLoading(false);
  };

  return (
    <Card className="nasa-card p-3">
      <Card.Body>
        <Card.Title>NASA Astronomy Picture of the Day</Card.Title>
        <Button variant="primary" onClick={getNasaData}>Get NASA Picture</Button>
        {loading ? <p>Loading...</p> : (
          nasaData && (
            <div>
              <h5>{nasaData.title}</h5>
              <img src={nasaData.url} alt={nasaData.title} style={{ width: '100%' }} />
              <p>{nasaData.explanation}</p>
            </div>
          )
        )}
      </Card.Body>
    </Card>
  );
};

export default NasaComponent;
