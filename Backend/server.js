require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json()); // Parse JSON data
app.use(cors()); // Enable CORS

// Connect Database
connectDB();

// Default Route
// app.get("/", (req, res) => {
//   res.send("API is running...");
// });
app.use("/api/auth", require("./routes/authRoutes"));
app.get("/", (req, res) => {
    res.send("API is running... mongodb  connecteed successfully");
  });
  

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
