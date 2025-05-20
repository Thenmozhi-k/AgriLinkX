require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path"); // Import path module
const http = require('http');
const { Server } = require('socket.io');
const postRoutes = require("./routes/postRoutes");
const hashtagRoutes = require('./routes/hashtagRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const savedPostRoutes = require('./routes/savedPostRoutes');
const botRoutes = require('./routes/botRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  maxHttpBufferSize: 50 * 1024 * 1024, // 50MB max payload size for Socket.io
  pingTimeout: 60000 // Increase timeout for large file transfers
});

// Middleware
app.use(express.json({ limit: '50mb' })); // Parse JSON data with increased limit
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Parse URL-encoded data with increased limit
app.use(cors()); // Enable CORS

// Connect Database
connectDB();

// WebSocket Connection
require('./socket')(io);

// Routes
app.use("/api/auth", require("./routes/authUserRoutes"));
app.use("/api/connections", require("./routes/connectionRoutes"));
app.use("/api/post", postRoutes);
app.use('/api/hashtags', hashtagRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/saved-posts', savedPostRoutes);
app.use('/api/bot', botRoutes);

// Fix the incorrect path usage
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 

// Default Route
app.get("/", (req, res) => {
    res.send("API is running... MongoDB connected successfully");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});