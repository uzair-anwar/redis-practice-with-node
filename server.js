const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { createClient } = require("redis");
const redisClient = createClient();
const DEFAULT_EXPIRATION = 3600 * 24;
const app = express();

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.connect();

app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/photos", async (req, res) => {
  const albumId = req.query.albumId;
  const photos = await redisClient.get("photos");
  if (photos) {
    res.status(200).json(JSON.parse(photos));
  } else {
    const { data } = await axios.get(
      `https://jsonplaceholder.typicode.com/photos`,
      { params: { albumId } }
    );
    redisClient.setEx("photos", DEFAULT_EXPIRATION, JSON.stringify(data));
    res.json(data);
  }
});

app.get("/photos/:id", async (req, res) => {
  const singlePhotos = await redisClient.get(`photos:${req.params.id}`);
  if (singlePhotos) {
    res.status(200).json(JSON.parse(singlePhotos));
  } else {
    const { data } = await axios.get(
      `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
    );
    redisClient.setEx(
      `photos:${req.params.id}`,
      DEFAULT_EXPIRATION,
      JSON.stringify(data)
    );
    res.json(data);
  }
});

app.listen(3001, () => {
  console.log("Running");
});
