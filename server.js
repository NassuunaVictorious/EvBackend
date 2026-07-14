const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const pool = require("./db");
const authRoutes = require("./controllers/routes/auth");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

/* =========================
   GET STATIONS (DB)
========================= */

app.get("/stations", async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT * FROM stations"
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "DB error" });
    }

});

/* =========================
   UPDATE STATION
========================= */

app.post("/stations/update", async (req, res) => {

    const { id, status, queue } = req.body;

    try {

        await pool.query(
            "UPDATE stations SET status=$1, queue=$2 WHERE id=$3",
            [status, queue, id]
        );

        const updated = await pool.query("SELECT * FROM stations");

        // 🔴 REAL-TIME BROADCAST
        io.emit("stations:update", updated.rows);

        res.json({
            success: true,
            stations: updated.rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Update failed" });
    }

});

/* =========================
   COMMUNITY REPORT
========================= */

app.post("/community/report", async (req, res) => {

    const { station_id, message, type } = req.body;

    try {

        await pool.query(
            "INSERT INTO reports (station_id, message, type) VALUES ($1,$2,$3)",
            [station_id, message, type]
        );

        // 🔴 SEND TO ALL USERS IN REAL TIME
        io.emit("community:new", {
            station_id,
            message,
            type
        });

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Report failed" });
    }

});

/* =========================
   SOCKET SYSTEM
========================= */

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });

});

/* 
   START SERVER
*/

server.listen(3000, () => {
    console.log("⚡ ChargeFlow running with PostgreSQL");
});
