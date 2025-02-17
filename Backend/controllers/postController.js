const Post = require("../models/Post");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");
const mongoose = require("mongoose");

exports.createPost = async (req, res) => {
  try {
    let mediaUrl = "";
    console.log("User ID from token:", req.user);

    if (req.file) {
      console.log("Uploading file:", req.file.path);
      const result = await cloudinary.uploader.upload(req.file.path, { resource_type: "auto" });
      mediaUrl = result.secure_url;
      fs.unlinkSync(req.file.path); // Delete file after upload
    }

    const newPost = new Post({
      userId: req.user, // Use userId from token
      description: req.body.description,
      media: mediaUrl,
      hashtags: req.body.hashtags || [],
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id); // Convert the ID from string to number

    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid Post ID" });
    }

    const post = await Post.findOne({ postId: postId }).populate("comments"); // Find by postId (number)
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.userId }); // Fetch posts of logged-in user
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ postId: req.params.id });
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Ensure userId is compared as numbers
    if (post.userId !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to delete this post" });
    }

    if (post.media) {
      const publicId = post.media.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    let mediaUrl = req.body.media || "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { resource_type: "auto" });
      mediaUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const post = await Post.findOne({ postId: req.params.id });
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Ensure userId is compared as numbers
    if (post.userId !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to update this post" });
    }

    const updatedPost = await Post.findOneAndUpdate(
      { postId: req.params.id },
      {
        description: req.body.description,
        media: mediaUrl,
        hashtags: req.body.hashtags || [],
      },
      { new: true }
    );

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
