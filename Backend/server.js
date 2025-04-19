require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path"); // ✅ Import path module
const postRoutes = require("./routes/postRoutes");
const hashtagRoutes = require('./routes/hashtagRoutes');

const app = express();

// Middleware
app.use(express.json()); // Parse JSON data
app.use(cors()); // Enable CORS

// Connect Database
connectDB();

// Routes
app.use("/api/auth", require("./routes/authUserRoutes"));
app.use("/api", require("./routes/connectionRoutes"));
app.use("/api/post", postRoutes);
app.use('/api/hashtags', hashtagRoutes);

// ✅ Fix the incorrect path usage
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 

// Default Route
app.get("/", (req, res) => {
    res.send("API is running... MongoDB connected successfully");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
