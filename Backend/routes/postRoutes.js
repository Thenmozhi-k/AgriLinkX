const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { createPost, getPost, getUserPosts, deletePost, updatePost } = require("../controllers/postController");
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create a new post
router.post("/create", upload.array("media", 10), createPost);

// Update an existing post
router.patch("/:id", upload.array("media", 10), updatePost);

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

// React to a post (like, love, etc.)
router.post("/:id/react", async (req, res) => {
  try {
    const Post = require("../models/Post");
    const { type } = req.body;
    
    console.log("Reaction request received:", { 
      postId: req.params.id, 
      userId: req.user.id, 
      type,
      body: req.body 
    });
    
    // Validate reaction type
    const validReactionTypes = ['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry'];
    if (!type || !validReactionTypes.includes(type)) {
      console.error("Invalid reaction type:", type);
      return res.status(400).json({ message: "Invalid reaction type" });
    }
    
    // Validate post ID
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error("Invalid post ID:", req.params.id);
      return res.status(400).json({ message: "Invalid post ID" });
    }
    
    // Find the post without modifying it first
    const post = await Post.findById(req.params.id);
    if (!post) {
      console.error("Post not found:", req.params.id);
      return res.status(404).json({ message: "Post not found" });
    }
    
    console.log("Found post:", {
      id: post._id,
      userId: post.userId,
      mediaCount: post.media ? post.media.length : 0,
      reactionsCount: post.reactions ? post.reactions.length : 0,
      sharesCount: post.shares ? post.shares.length : 0
    });
    
    // Ensure arrays are properly initialized
    if (!Array.isArray(post.reactions)) {
      post.reactions = [];
    }
    
    if (!Array.isArray(post.shares)) {
      post.shares = [];
    }
    
    if (!Array.isArray(post.media)) {
      post.media = [];
    }
    
    // Check if user already reacted to the post
    const existingReactionIndex = post.reactions.findIndex(
      reaction => reaction.userId && reaction.userId.toString() === req.user.id
    );
    
    console.log("Existing reaction index:", existingReactionIndex);
    
    let userReaction = null;
    
    if (existingReactionIndex !== -1) {
      // If same reaction type, remove it (toggle off)
      if (post.reactions[existingReactionIndex].type === type) {
        console.log("Removing existing reaction of same type");
        post.reactions.splice(existingReactionIndex, 1);
      } else {
        // If different reaction type, update it
        console.log("Updating reaction to new type:", type);
        post.reactions[existingReactionIndex].type = type;
        post.reactions[existingReactionIndex].createdAt = Date.now();
        userReaction = type;
      }
    } else {
      // Add new reaction
      console.log("Adding new reaction:", type);
      post.reactions.push({
        userId: req.user.id,
        type: type,
        createdAt: Date.now()
      });
      userReaction = type;
    }
    
    // Use updateOne instead of save to avoid validation issues with other fields
    const updateResult = await Post.updateOne(
      { _id: post._id },
      { $set: { reactions: post.reactions } }
    );
    
    console.log("Update result:", updateResult);
    
    // Return reaction counts
    const reactionCounts = {};
    validReactionTypes.forEach(type => {
      reactionCounts[type] = post.reactions.filter(r => r.type === type).length;
    });
    
    // Find user's current reaction after update
    if (!userReaction) {
      const userReactionObj = post.reactions.find(r => r.userId && r.userId.toString() === req.user.id);
      userReaction = userReactionObj ? userReactionObj.type : null;
    }
    
    console.log("Updated reactions:", {
      totalReactions: post.reactions.length,
      reactionCounts,
      userReaction
    });
    
    res.json({ 
      postId: post._id, 
      reactions: reactionCounts,
      totalReactions: post.reactions.length,
      userReaction
    });
  } catch (error) {
    console.error("Error reacting to post:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Comment on a post
router.post("/:id/comment", async (req, res) => {
  try {
    const Post = require("../models/Post");
    const Comment = require("../models/Comment");
    
    const { content } = req.body;
    console.log("Comment request received:", {
      postId: req.params.id,
      userId: req.user.id,
      content: content
    });
    
    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Comment content is required" });
    }
    
    // Validate post ID
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error("Invalid post ID:", req.params.id);
      return res.status(400).json({ message: "Invalid post ID" });
    }
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      console.error("Post not found:", req.params.id);
      return res.status(404).json({ message: "Post not found" });
    }
    
    console.log("Found post for comment:", {
      id: post._id,
      userId: post.userId,
      commentsCount: post.comments ? post.comments.length : 0
    });
    
    // Extract hashtags from content
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    const hashtags = matches ? matches.map(tag => tag.substring(1)) : [];
    
    // Create new comment
    const comment = new Comment({
      postId: post._id,
      userId: req.user.id,
      content,
      hashtags
    });
    
    console.log("Saving new comment");
    const savedComment = await comment.save();
    
    // Add comment to post using updateOne to avoid validation issues
    if (!Array.isArray(post.comments)) {
      post.comments = [];
    }
    
    post.comments.push(savedComment._id);
    
    console.log("Updating post with new comment reference");
    await Post.updateOne(
      { _id: post._id },
      { $push: { comments: savedComment._id } }
    );
    
    // Populate user info before sending response
    await savedComment.populate("userId", "name avatar role");
    
    console.log("Comment added successfully");
    res.status(201).json({
      postId: post._id,
      comment: savedComment
    });
  } catch (error) {
    console.error("Error commenting on post:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Like a comment
router.post("/comment/:commentId/like", async (req, res) => {
  try {
    const Comment = require("../models/Comment");
    
    console.log("Like comment request received:", {
      commentId: req.params.commentId,
      userId: req.user.id
    });
    
    // Validate comment ID
    if (!req.params.commentId || !mongoose.Types.ObjectId.isValid(req.params.commentId)) {
      console.error("Invalid comment ID:", req.params.commentId);
      return res.status(400).json({ message: "Invalid comment ID" });
    }
    
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      console.error("Comment not found:", req.params.commentId);
      return res.status(404).json({ message: "Comment not found" });
    }
    
    console.log("Found comment for like:", {
      id: comment._id,
      postId: comment.postId,
      userId: comment.userId,
      likesCount: comment.likes ? comment.likes.length : 0
    });
    
    // Ensure likes array exists
    if (!Array.isArray(comment.likes)) {
      comment.likes = [];
    }
    
    // Check if user already liked the comment
    const existingLikeIndex = comment.likes.findIndex(
      like => like.userId && like.userId.toString() === req.user.id
    );
    
    console.log("Existing like index:", existingLikeIndex);
    
    let userLiked = false;
    
    if (existingLikeIndex !== -1) {
      // Remove like (toggle off)
      console.log("Removing existing like");
      comment.likes.splice(existingLikeIndex, 1);
    } else {
      // Add like
      console.log("Adding new like");
      comment.likes.push({
        userId: req.user.id,
        createdAt: Date.now()
      });
      userLiked = true;
    }
    
    // Update the comment using updateOne to avoid validation issues
    console.log("Updating comment with likes");
    await Comment.updateOne(
      { _id: comment._id },
      { $set: { likes: comment.likes } }
    );
    
    console.log("Comment like updated successfully");
    res.json({
      commentId: comment._id,
      likeCount: comment.likes.length,
      userLiked
    });
  } catch (error) {
    console.error("Error liking comment:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Reply to a comment
router.post("/comment/:commentId/reply", async (req, res) => {
  try {
    const Comment = require("../models/Comment");
    
    const { content } = req.body;
    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Reply content is required" });
    }
    
    const parentComment = await Comment.findById(req.params.commentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Extract hashtags from content
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    const hashtags = matches ? matches.map(tag => tag.substring(1)) : [];
    
    const reply = new Comment({
      postId: parentComment.postId,
      userId: req.user.id,
      content,
      isReply: true,
      parentId: parentComment._id,
      hashtags
    });
    
    await reply.save();
    
    // Add reply to parent comment
    parentComment.replies.push(reply._id);
    await parentComment.save();
    
    // Populate user info before sending response
    await reply.populate("userId", "name avatar role");
    
    res.status(201).json({
      commentId: parentComment._id,
      reply
    });
  } catch (error) {
    console.error("Error replying to comment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get reactions for a post (who reacted and when)
router.get("/:id/reactions", async (req, res) => {
  try {
    const Post = require("../models/Post");
    const User = require("../models/User");
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Get reaction counts
    const reactionCounts = {};
    const validReactionTypes = ['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry'];
    validReactionTypes.forEach(type => {
      reactionCounts[type] = post.reactions.filter(r => r.type === type).length;
    });
    
    // Get user details for each reaction
    const reactionDetails = await Promise.all(
      post.reactions.map(async (reaction) => {
        const user = await User.findById(reaction.userId).select('name avatar role');
        return {
          id: reaction._id,
          type: reaction.type,
          createdAt: reaction.createdAt,
          user: user || { name: 'Unknown User' }
        };
      })
    );
    
    // Sort by most recent
    reactionDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      postId: post._id,
      reactionCounts,
      totalReactions: post.reactions.length,
      reactionDetails
    });
  } catch (error) {
    console.error("Error fetching post reactions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Share a post with specific users
router.post("/:id/share", async (req, res) => {
  try {
    const Post = require("../models/Post");
    const User = require("../models/User");
    const { userIds } = req.body;
    
    console.log("Share post request received:", {
      postId: req.params.id,
      userId: req.user.id,
      userIds: userIds
    });
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "Please provide at least one user to share with" });
    }
    
    // Validate post ID
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error("Invalid post ID:", req.params.id);
      return res.status(400).json({ message: "Invalid post ID" });
    }
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      console.error("Post not found:", req.params.id);
      return res.status(404).json({ message: "Post not found" });
    }
    
    console.log("Found post for sharing:", {
      id: post._id,
      userId: post.userId,
      sharesCount: post.shares ? post.shares.length : 0
    });
    
    // Ensure users exist
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length === 0) {
      console.error("No valid users found to share with");
      return res.status(404).json({ message: "No valid users found to share with" });
    }
    
    console.log(`Found ${users.length} users to share with`);
    
    // Add share records
    const newShares = users.map(user => ({
      userId: user._id,
      createdAt: Date.now()
    }));
    
    // Update the post using updateOne to avoid validation issues
    console.log("Updating post with shares");
    await Post.updateOne(
      { _id: post._id },
      { $push: { shares: { $each: newShares } } }
    );
    
    // Get updated share count
    const updatedPost = await Post.findById(post._id);
    const shareCount = updatedPost.shares ? updatedPost.shares.length : 0;
    
    console.log("Post shared successfully, new share count:", shareCount);
    res.json({ 
      postId: post._id,
      shareCount,
      message: `Post shared with ${users.length} user(s)`
    });
  } catch (error) {
    console.error("Error sharing post:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get users to share with (user's connections)
router.get("/share/connections", async (req, res) => {
  try {
    const User = require("../models/User");
    
    // Get current user with following and followers
    const user = await User.findById(req.user.id)
      .populate('following', 'name avatar role')
      .populate('followers', 'name avatar role');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Combine and deduplicate connections
    const connections = [...user.following, ...user.followers];
    const uniqueConnections = Array.from(new Map(connections.map(conn => [conn._id.toString(), conn])).values());
    
    res.json(uniqueConnections);
  } catch (error) {
    console.error("Error fetching connections:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Search all users for sharing
router.get("/share/search", async (req, res) => {
  try {
    const User = require("../models/User");
    const { query } = req.query;
    
    console.log("Searching users with query:", query);
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    // Search users by name (case insensitive)
    const users = await User.find({
      name: { $regex: query, $options: 'i' },
      _id: { $ne: req.user.id } // Exclude current user
    })
    .select('name avatar role')
    .limit(20);
    
    console.log(`Found ${users.length} users matching query "${query}"`);
    
    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get comments for a post
router.get("/:id/comments", async (req, res) => {
  try {
    const Comment = require("../models/Comment");
    
    // Get top-level comments (not replies)
    const comments = await Comment.find({ 
      postId: req.params.id,
      isReply: false
    })
      .populate("userId", "name avatar role")
      .sort({ createdAt: -1 });
    
    // For each comment, get its replies
    const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
      const replies = await Comment.find({
        parentId: comment._id
      })
        .populate("userId", "name avatar role")
        .sort({ createdAt: 1 });
      
      const commentObj = comment.toObject({ virtuals: true });
      commentObj.replies = replies;
      return commentObj;
    }));
    
    res.json(commentsWithReplies);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a specific post - This should come after other GET routes with specific paths
router.get("/:id", getPost);

// Delete a post
router.delete("/:id", deletePost);

module.exports = router;