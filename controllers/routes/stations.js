const express = require("express");
const router = express.Router();

// fake database
let stations = [
  {
    id: 1,
    name: "Kampala Central Hub",
    lat: 0.3476,
    lng: 32.5825,
    status: "busy",
    queue: 6,
    price: 800
  },
  {
    id: 2,
    name: "Nakawa Station",
    lat: 0.3600,
    lng: 32.6100,
    status: "free",
    queue: 1,
    price: 650
  },
  {
    id: 3,
    name: "Makerere Point",
    lat: 0.3350,
    lng: 32.5680,
    status: "full",
    queue: 10,
    price: 900
  }
];

// GET all stations
router.get("/", (req, res) => {
  res.json(stations);
});

// UPDATE station status (community system)
router.post("/update", (req, res) => {
  const { id, status, queue } = req.body;

  const station = stations.find(s => s.id === id);
  if (station) {
    station.status = status;
    station.queue = queue;
  }

  res.json({ message: "updated", stations });
});

module.exports = router;