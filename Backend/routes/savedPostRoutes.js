const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/authMiddleware");

// Apply auth middleware to all routes
router.use(authMiddleware);

// Save a post
router.post("/:postId", async (req, res) => {
  try {
    const SavedPost = require("../models/SavedPost");
    const Post = require("../models/Post");
    
    const postId = req.params.postId;
    const userId = req.user.id;
    
    // Validate post ID
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Check if already saved
    const existingSave = await SavedPost.findOne({ userId, postId });
    if (existingSave) {
      return res.status(400).json({ message: "Post already saved" });
    }
    
    // Create new saved post
    const savedPost = new SavedPost({
      userId,
      postId
    });
    
    await savedPost.save();
    
    res.status(201).json({ 
      message: "Post saved successfully",
      savedPost
    });
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Unsave a post
router.delete("/:postId", async (req, res) => {
  try {
    const SavedPost = require("../models/SavedPost");
    
    const postId = req.params.postId;
    const userId = req.user.id;
    
    // Validate post ID
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    
    // Find and delete the saved post
    const result = await SavedPost.findOneAndDelete({ userId, postId });
    
    if (!result) {
      return res.status(404).json({ message: "Saved post not found" });
    }
    
    res.json({ message: "Post unsaved successfully" });
  } catch (error) {
    console.error("Error unsaving post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all saved posts for current user
router.get("/", async (req, res) => {
  try {
    const SavedPost = require("../models/SavedPost");
    const userId = req.user.id;
    
    const savedPosts = await SavedPost.find({ userId })
      .sort({ savedAt: -1 })
      .populate({
        path: "postId",
        populate: {
          path: "userId",
          select: "name avatar role"
        }
      });
    
    // Format the response
    const formattedPosts = savedPosts.map(savedPost => {
      if (!savedPost.postId) {
        return null; // Handle case where post might have been deleted
      }
      
      return {
        ...savedPost.postId.toObject(),
        savedAt: savedPost.savedAt
      };
    }).filter(post => post !== null);
    
    res.json(formattedPosts);
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Check if a post is saved by the current user
router.get("/check/:postId", async (req, res) => {
  try {
    const SavedPost = require("../models/SavedPost");
    
    const postId = req.params.postId;
    const userId = req.user.id;
    
    // Validate post ID
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    
    const savedPost = await SavedPost.findOne({ userId, postId });
    
    res.json({ isSaved: !!savedPost });
  } catch (error) {
    console.error("Error checking saved post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;