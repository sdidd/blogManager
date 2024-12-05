import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import interact from 'interactjs';

const NewsComponent = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    interact('.news-card')
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

  const getNewsData = async () => {
    setLoading(true);
    const res = await fetch('/api/dashboard/news');
    const data = await res.json();
    setNewsData(data.articles);
    setLoading(false);
  };

  return (
    <Card className="news-card p-3">
      <Card.Body>
        <Card.Title>Latest News</Card.Title>
        <Button variant="primary" onClick={getNewsData}>Get News</Button>
        {loading ? <p>Loading...</p> : (
          <div>
            {newsData.map((article, index) => (
              <div key={index}>
                <h5>{article.title}</h5>
                <p>{article.description}</p>
                <a href={article.url} target="_blank" rel="noopener noreferrer">Read more</a>
              </div>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default NewsComponent;
