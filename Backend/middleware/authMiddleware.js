const jwt = require("jsonwebtoken");
const User = require("../models/User");
const mongoose = require("mongoose");

const authMiddleware = async (req, res, next) => {
  console.log("Auth middleware is running");
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1]; // Extract token after "Bearer"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    
    if (!decoded.id) {
      return res.status(401).json({ message: "Invalid token format" });
    }
    
    // Convert string ID to ObjectId if needed
    const userId = mongoose.Types.ObjectId.isValid(decoded.id) 
      ? decoded.id 
      : decoded.id.toString();
    
    // Find the user by ID to ensure it exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    // Set user object in request with proper format
    req.user = {
      id: userId,
      _id: userId // Include both formats for compatibility
    };
    
    console.log("User set in request:", req.user);
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;