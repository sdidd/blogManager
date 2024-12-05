import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import interact from 'interactjs';

const JokeComponent = () => {
  const [joke, setJoke] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    interact('.joke-card')
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

  const getJoke = async () => {
    setLoading(true);
    const res = await fetch('/api/dashboard/joke');
    const data = await res.json();
    setJoke(data.joke);
    setLoading(false);
  };

  return (
    <Card className="joke-card p-3">
      <Card.Body>
        <Card.Title>Random Joke</Card.Title>
        <Button variant="primary" onClick={getJoke}>Get Joke</Button>
        {loading ? <p>Loading...</p> : (
          <p>{joke}</p>
        )}
      </Card.Body>
    </Card>
  );
};

export default JokeComponent;
