const express = require("express");
const router = express.Router();
const { createPost, getPost, getUserPosts, deletePost, updatePost } = require("../controllers/postController");
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create a new post
router.post("/create", upload.single("media"), createPost);

// Get all posts for the homepage feed
router.get("/all", async (req, res) => {
  try {
    const Post = require("../models/Post");
    
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("userId", "name avatar role");
    
    res.json(posts);
  } catch (error) {
    console.error("Error fetching all posts:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get feed (posts from users the current user follows)
router.get("/feed", async (req, res) => {
  try {
    const User = require("../models/User");
    const Post = require("../models/Post");
    
    // Get current user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get posts from users the current user follows and their own posts
    const following = user.following;
    const posts = await Post.find({
      $or: [
        { userId: { $in: following } },
        { userId: req.user.id }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("userId", "name avatar role");
    
    res.json(posts);
  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get posts by a specific user
router.get("/user/:userId", getUserPosts);

// Like a post
router.post("/:id/like", async (req, res) => {
  try {
    const Post = require("../models/Post");
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Check if user already liked the post
    const userLiked = post.reactions.some(reaction => 
      reaction.has(req.user.id) && reaction.get(req.user.id) === 1
    );
    
    if (userLiked) {
      // Remove like
      post.reactions = post.reactions.filter(reaction => 
        !reaction.has(req.user.id) || reaction.get(req.user.id) !== 1
      );
    } else {
      // Add like
      const likeReaction = new Map();
      likeReaction.set(req.user.id, 1);
      post.reactions.push(likeReaction);
    }
    
    await post.save();
    
    // Count total likes
    const likes = post.reactions.filter(reaction => {
      for (const [_, value] of reaction.entries()) {
        return value === 1;
      }
      return false;
    }).length;
    
    res.json({ postId: post._id, likes });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Comment on a post
router.post("/:id/comment", async (req, res) => {
  try {
    const Post = require("../models/Post");
    const Comment = require("../models/Comment");
    
    const { content } = req.body;
    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Comment content is required" });
    }
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    const comment = new Comment({
      postId: post._id,
      userId: req.user.id,
      content
    });
    
    await comment.save();
    
    // Add comment to post
    post.comments.push(comment._id);
    await post.save();
    
    // Populate user info
    await comment.populate("userId", "name avatar role");
    
    res.status(201).json({
      postId: post._id,
      comment
    });
  } catch (error) {
    console.error("Error commenting on post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get comments for a post
router.get("/:id/comments", async (req, res) => {
  try {
    const Comment = require("../models/Comment");
    
    const comments = await Comment.find({ postId: req.params.id })
      .populate("userId", "name avatar role")
      .sort({ createdAt: 1 });
    
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a specific post - This should come after other GET routes with specific paths
router.get("/:id", getPost);

// Delete a post
router.delete("/:id", deletePost);

// Update a post
router.put("/:id", upload.single("media"), updatePost);

module.exports = router;