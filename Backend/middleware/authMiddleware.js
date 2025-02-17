const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  console.log("Middleware is running"); // Check if middleware is being called
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1]; // Extract token after "Bearer"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // Log the full decoded token
    req.user = decoded; // Attach user info to request object
    console.log("Extracted userId from token:", req.user);
    next();
  } catch (error) {
    console.error("Error verifying token:", error); // Log the error
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
