import React, { useState, useEffect } from 'react';
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
    try {
      const res = await fetch('/api/dashboard/news');
      const data = await res.json();
      setNewsData(data.articles);
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card news-card p-3 shadow">
      <div className="card-body">
        <h5 className="card-title">Latest News</h5>
        <button className="btn btn-primary mb-3" onClick={getNewsData}>
          Get News
        </button>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div>
            {newsData.map((article, index) => (
              <div key={index} className="mb-3">
                <h6>{article.title}</h6>
                <p>{article.description}</p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read more
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsComponent;
