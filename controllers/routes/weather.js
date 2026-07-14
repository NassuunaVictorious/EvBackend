const express = require("express");
const axios = require("axios");
const router = express.Router();

const API_KEY = "YOUR_OPENWEATHER_API_KEY";

router.get("/", async (req, res) => {
  const city = req.query.city || "Kampala";

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    res.json({
      temp: response.data.main.temp,
      weather: response.data.weather[0].main
    });

  } catch (err) {
    res.json({ error: "weather fetch failed" });
  }
});

module.exports = router;