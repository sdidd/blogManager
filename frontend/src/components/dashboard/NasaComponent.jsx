import React, { useState, useEffect } from 'react';
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
    try {
      const res = await fetch('/api/dashboard/joke');
      const data = await res.json();
      setJoke(data.joke);
    } catch (err) {
      console.error('Error fetching joke:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card joke-card p-3 shadow">
      <div className="card-body">
        <h5 className="card-title">Random Joke</h5>
        <button className="btn btn-primary mb-3" onClick={getJoke}>
          Get Joke
        </button>
        {loading ? <p>Loading...</p> : <p>{joke}</p>}
      </div>
    </div>
  );
};

export default JokeComponent;
