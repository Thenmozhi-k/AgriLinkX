const Post = require("../models/Post");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");
const mongoose = require("mongoose");

exports.createPost = async (req, res) => {
  try {
    console.log("Creating post with user:", req.user);
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    
    let mediaUrl = "";

    if (req.file) {
      console.log("Uploading file:", req.file.path, "Size:", req.file.size, "Type:", req.file.mimetype);
      try {
        // Upload to Cloudinary with specific folder and resource type
        const result = await cloudinary.uploader.upload(req.file.path, { 
          resource_type: "auto",
          folder: "agrilinkx_posts",
          use_filename: true
        });
        
        console.log("Cloudinary upload result:", result);
        mediaUrl = result.secure_url;
        
        // Delete local file after upload
        fs.unlinkSync(req.file.path);
        console.log("Local file deleted after upload");
      } catch (uploadError) {
        console.error("Error uploading to cloudinary:", uploadError);
        return res.status(400).json({ 
          message: "Error uploading image. Please try again.",
          error: uploadError.message 
        });
      }
    }

    // Parse hashtags if they're provided as a string
    let hashtags = [];
    if (req.body.hashtags) {
      try {
        hashtags = JSON.parse(req.body.hashtags);
      } catch (e) {
        // If it's not valid JSON, treat it as a comma-separated string
        hashtags = req.body.hashtags.split(',').map(tag => tag.trim());
      }
    }

    console.log("Creating post with userId:", req.user.id);
    
    const newPost = new Post({
      userId: req.user.id,
      description: req.body.description,
      media: mediaUrl,
      hashtags: hashtags,
      reactions: [],
      comments: [],
      location: req.body.location || null
    });

    console.log("New post object:", JSON.stringify(newPost, null, 2));
    
    const savedPost = await newPost.save();
    console.log("Post saved successfully with ID:", savedPost._id, "and postId:", savedPost.postId);
    
    // Populate user info before sending response
    await savedPost.populate('userId', 'name avatar role');
    
    res.status(201).json(savedPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id); // Convert the ID from string to number

    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid Post ID" });
    }

    const post = await Post.findOne({ postId: postId })
      .populate("userId", "name avatar role")
      .populate({
        path: "comments",
        populate: {
          path: "userId",
          select: "name avatar role"
        }
      });
      
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const posts = await Post.find({ userId })
      .sort({ createdAt: -1 })
      .populate("userId", "name avatar role")
      .populate({
        path: "comments",
        populate: {
          path: "userId",
          select: "name avatar role"
        }
      });
      
    res.json(posts);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    
    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid Post ID" });
    }
    
    const post = await Post.findOne({ postId });
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Ensure user is authorized to delete this post
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this post" });
    }

    // Delete media from cloudinary if exists
    if (post.media) {
      try {
        const publicId = post.media.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Error deleting media from cloudinary:", error);
        // Continue with post deletion even if media deletion fails
      }
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    
    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid Post ID" });
    }
    
    const post = await Post.findOne({ postId });
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Ensure user is authorized to update this post
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to update this post" });
    }

    let mediaUrl = post.media;

    if (req.file) {
      // Delete old media if exists
      if (post.media) {
        try {
          const publicId = post.media.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error("Error deleting old media from cloudinary:", error);
          // Continue with update even if old media deletion fails
        }
      }
      
      // Upload new media
      const result = await cloudinary.uploader.upload(req.file.path, { 
        resource_type: "auto",
        folder: "agrilinkx_posts",
        use_filename: true
      });
      mediaUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    // Parse hashtags if they're provided as a string
    let hashtags = post.hashtags;
    if (req.body.hashtags) {
      try {
        hashtags = JSON.parse(req.body.hashtags);
      } catch (e) {
        // If it's not valid JSON, treat it as a comma-separated string
        hashtags = req.body.hashtags.split(',').map(tag => tag.trim());
      }
    }

    post.description = req.body.description || post.description;
    post.media = mediaUrl;
    post.hashtags = hashtags;
    post.location = req.body.location || post.location;

    await post.save();
    
    // Populate user info before sending response
    await post.populate('userId', 'name avatar role');
    
    res.json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: error.message });
  }
};