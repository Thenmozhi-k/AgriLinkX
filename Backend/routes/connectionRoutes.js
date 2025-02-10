const express = require("express");
const authMiddleware = require("../middleware/authMiddleware"); // Middleware for authentication
const User = require("../models/User");

const router = express.Router();

// Follow a user
router.post("/follow/:userId", authMiddleware, async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUser = req.user.id;
  
      if (userId === currentUser) {
        return res.status(400).json({ message: "You cannot follow yourself" });
      }
  
      const userToFollow = await User.findById(userId).select("name followers");
      const user = await User.findById(currentUser).select("name following");
  
      if (!userToFollow || !user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (user.following.includes(userId)) {
        return res.status(400).json({ message: "You already follow this user" });
      }
  
      user.following.push(userId);
      userToFollow.followers.push(currentUser);
  
      await user.save();
      await userToFollow.save();
  
      res.json({
        message: "User followed successfully",
        currentUser: {
          id: user._id,
          name: user.name,
        },
        followedUser: {
          id: userToFollow._id,
          name: userToFollow.name,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  });
  

// Unfollow a user
router.delete("/unfollow/:userId", authMiddleware, async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUser = req.user.id;
  
      const userToUnfollow = await User.findById(userId).select("name followers");
      const user = await User.findById(currentUser).select("name following");
  
      if (!userToUnfollow || !user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      user.following = user.following.filter((id) => id.toString() !== userId);
      userToUnfollow.followers = userToUnfollow.followers.filter((id) => id.toString() !== currentUser);
  
      await user.save();
      await userToUnfollow.save();
  
      res.json({
        message: "User unfollowed successfully",
        currentUser: {
          id: user._id,
          name: user.name,
        },
        unfollowedUser: {
          id: userToUnfollow._id,
          name: userToUnfollow.name,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  });
  

// Get followers of a user
router.get("/followers/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId)
        .select("name")
        .populate("followers", "name email");
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json({
        message: "Followers retrieved successfully",
        currentUser: {
          id: user._id,
          name: user.name,
        },
        followers: user.followers.map((follower) => ({
          id: follower._id,
          name: follower.name,
          email: follower.email,
        })),
      });
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  });
  

// Get following list of a user
router.get("/following/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId)
        .select("name")
        .populate("following", "name email");
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json({
        message: "Following list retrieved successfully",
        currentUser: {
          id: user._id,
          name: user.name,
        },
        following: user.following.map((followingUser) => ({
          id: followingUser._id,
          name: followingUser.name,
          email: followingUser.email,
        })),
      });
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  });
  
// Get follow suggestions
router.get("/suggestions", authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const suggestedUsers = await User.find({
      _id: { $nin: [...currentUser.following, req.user.id] },
    }).select("name email");

    res.json({ suggestions: suggestedUsers });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
