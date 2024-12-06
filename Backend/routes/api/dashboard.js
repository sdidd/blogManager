const express = require("express");const axios = require("axios");
const authMiddleware = require("../../middleware/authMiddleware");
const permissionMiddleware = require("../../middleware/permissionMiddleware");

const router = express.Router();

const applyMiddlewares = (middlewares, handler) => [...middlewares, handler];

// Default middleware stack
const defaultMiddlewares = [authMiddleware, permissionMiddleware(["view:dashboard"])];
/**
 * Weather API - Fetch current weather for a given city
 */
router.get(
  "/weather",
  applyMiddlewares(defaultMiddlewares, async (req, res) => {
    try {
      const weatherApiKey = process.env.OPENWEATHERMAP_API_KEY;
      const city = req.query.city || "London"; // Default to London if no city is provided
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}`;

      const response = await axios.get(weatherUrl);
      res.status(200).json({ weather: response.data });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch weather data", details: err.message });
    }
  })
);

/**
 * News API - Fetch top news headlines
 */
router.get(
  "/news",
  applyMiddlewares(defaultMiddlewares, async (req, res) => {
    try {
      const newsApiKey = process.env.NEWS_API_KEY;
      const category = req.query.category || "general"; // Default to general news
      const newsUrl = `https://newsapi.org/v2/top-headlines?category=${category}&country=us&apiKey=${newsApiKey}`;

      const response = await axios.get(newsUrl);
      res.status(200).json({ news: response.data.articles });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch news data", details: err.message });
    }
  })
);

/**
 * Holidays API - Fetch upcoming holidays for a given country
 */
router.get(
  "/holidays",
  applyMiddlewares(defaultMiddlewares, async (req, res) => {
    try {
      const holidaysApiKey = process.env.HOLIDAYS_API_KEY;
      const country = req.query.country || "IN"; // Default to US if no country is provided
      const year = new Date().getFullYear();
      const holidaysUrl = `https://calendarific.com/api/v2/holidays?api_key=${holidaysApiKey}&country=${country}&year=${year}`;

      const response = await axios.get(holidaysUrl);
      res.status(200).json({ holidays: response.data.response.holidays });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch holidays data", details: err.message });
    }
  })
);

/**
 * Joke API - Fetch a random joke
 */
router.get(
  "/joke",
  applyMiddlewares(defaultMiddlewares, async (req, res) => {
    try {
      const jokeUrl = "https://official-joke-api.appspot.com/random_joke";

      const response = await axios.get(jokeUrl);
      res.status(200).json({ joke: response.data });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch joke", details: err.message });
    }
  })
);

/**
 * Geolocation API - Fetch geolocation data for the user's IP
 */
router.get(
  "/geolocation",
  applyMiddlewares(defaultMiddlewares, async (req, res) => {
    try {
      const ipstackApiKey = process.env.IPSTACK_API_KEY;
      const ip = req.query.ip || "check"; // Default to the current user's IP
      const geoUrl = `http://api.ipstack.com/${ip}?access_key=${ipstackApiKey}`;

      const response = await axios.get(geoUrl);
      res.status(200).json({ geolocation: response.data });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch geolocation data", details: err.message });
    }
  })
);

/**
 * NASA API - Fetch NASA's Astronomy Picture of the Day
 */
router.get(
  "/nasa",
  applyMiddlewares(defaultMiddlewares, async (req, res) => {
    try {
      const nasaApiKey = process.env.NASA_API_KEY;
      const nasaUrl = `https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}`;

      const response = await axios.get(nasaUrl);
      res.status(200).json({ nasa: response.data });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch NASA data", details: err.message });
    }
  })
);

module.exports = router;
