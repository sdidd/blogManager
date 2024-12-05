import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import interact from 'interactjs';

const HolidaysComponent = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    interact('.holidays-card')
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

  const getHolidays = async () => {
    setLoading(true);
    const res = await fetch('/api/dashboard/holidays');
    const data = await res.json();
    setHolidays(data);
    setLoading(false);
  };

  return (
    <Card className="holidays-card p-3">
      <Card.Body>
        <Card.Title>Public Holidays</Card.Title>
        <Button variant="primary" onClick={getHolidays}>Get Holidays</Button>
        {loading ? <p>Loading...</p> : (
          <ul>
            {holidays.map((holiday, index) => (
              <li key={index}>{holiday.name} - {holiday.date}</li>
            ))}
          </ul>
        )}
      </Card.Body>
    </Card>
  );
};

export default HolidaysComponent;
