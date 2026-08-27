const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");
require("dotenv").config();

const db = require("./utils/db");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const queueRoutes = require("./routes/queueRoutes");
const aiRoutes = require("./routes/aiRoutes");
const qrRoutes = require("./routes/qrRoutes");

const clientOrigin = process.env.CLIENT_ORIGIN || "*";
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: clientOrigin } });

const seedStaff = require("./seed/seedStaff");

app.use(helmet());
app.use(cors({ origin: clientOrigin }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/queue", queueRoutes(io));
app.use("/api/ai", aiRoutes);
app.use("/api/qr", qrRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "QueueWise AI Backend running smoothly",
    dbConnected: db.isDbConnected,
    mode: db.isDbConnected ? "MongoDB Atlas" : "In-Memory Engine Fallback",
    timestamp: new Date()
  });
});

app.use(errorHandler);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(async () => {
      db.setDbConnected(true);
      console.log("MongoDB connected successfully.");
      await db.seedDefaultData();
      await seedStaff(false);
    })
    .catch((error) => {
      db.setDbConnected(false);
      console.warn("MongoDB connection warning (IP whitelist or network):", error.message);
      console.log("QueueWise AI Server running with In-Memory Database Engine Fallback.");
    })
    .finally(() => {
      httpServer.listen(PORT, () => {
        console.log(`QueueWise AI Backend Server running on port ${PORT}`);
      });
    });
} else {
  db.setDbConnected(false);
  console.log("QueueWise AI Server running with In-Memory Database Engine Fallback.");
  httpServer.listen(PORT, () => {
    console.log(`QueueWise AI Backend Server running on port ${PORT}`);
  });
}