const express = require("express");
const cors = require("cors");
const path = require("path");
const { initDB } = require("./db");
const eventsRoutes = require("./events.js");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve the frontend from the same folder (optional)
app.use(express.static(path.join(__dirname, "../homemade-frontend")));

// Health check
app.get("/", (req, res) => {
  res.send("Homemade. API is running 🎀");
});

// Routes
app.use("/api/events", eventsRoutes);

// Start
async function startServer() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Server running → http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
  }
}

startServer();