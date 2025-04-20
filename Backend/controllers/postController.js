const Post = require("../models/Post");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");
const mongoose = require("mongoose");

exports.createPost = async (req, res) => {
  try {
    console.log("Creating post with user:", req.user);
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    
    let mediaFiles = [];

    // Handle multiple files
    if (req.files && req.files.length > 0) {
      console.log(`Processing ${req.files.length} files for upload`);
      
      // Process each file
      for (const file of req.files) {
        try {
          console.log("Uploading file:", file.path, "Size:", file.size, "Type:", file.mimetype);
          
          let mediaItem;
          
          try {
            // Try uploading to Cloudinary first
            const result = await cloudinary.uploader.upload(file.path, { 
              resource_type: "auto",
              folder: "agrilinkx_posts",
              use_filename: true
            });
            
            console.log("Cloudinary upload result:", result);
            
            // Determine media type based on file mimetype
            let mediaType = 'document';
            if (file.mimetype.startsWith('image/')) {
              mediaType = 'image';
            } else if (file.mimetype.startsWith('video/')) {
              mediaType = 'video';
            }
            
            // Create media object with Cloudinary data
            mediaItem = {
              url: result.secure_url,
              type: mediaType,
              filename: file.originalname,
              size: file.size,
              width: result.width || null,
              height: result.height || null,
              thumbnailUrl: mediaType === 'video' ? result.thumbnail_url : null
            };
          } catch (cloudinaryError) {
            console.error("Error uploading to cloudinary:", cloudinaryError);
            
            // FALLBACK: Create a local reference if Cloudinary fails
            // Determine media type based on file mimetype
            let mediaType = 'document';
            if (file.mimetype.startsWith('image/')) {
              mediaType = 'image';
            } else if (file.mimetype.startsWith('video/')) {
              mediaType = 'video';
            }
            
            // Read file as base64
            const fileBuffer = fs.readFileSync(file.path);
            const base64Data = fileBuffer.toString('base64');
            
            // Create media object with base64 data
            mediaItem = {
              url: `/uploads/${file.filename}`, // Keep URL for backward compatibility
              type: mediaType,
              filename: file.originalname,
              size: file.size,
              width: null,
              height: null,
              thumbnailUrl: null,
              isLocal: true, // Flag to indicate it's stored locally
              data: `data:${file.mimetype};base64,${base64Data}` // Store as data URL
            };
            
            console.log("Created local media reference:", mediaItem);
            
            // Don't delete the local file in this case
            mediaFiles.push(mediaItem); // Add the media item to the array
            continue;
          }
          
          mediaFiles.push(mediaItem);
          
          // Delete local file after successful Cloudinary upload
          fs.unlinkSync(file.path);
          console.log("Local file deleted after upload");
        } catch (uploadError) {
          console.error("Error handling file:", uploadError);
          // Continue with other files even if one fails
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }
    } else if (req.file) {
      // Handle single file for backward compatibility
      try {
        console.log("Uploading single file:", req.file.path, "Size:", req.file.size, "Type:", req.file.mimetype);
        
        let mediaItem;
        
        try {
          // Try uploading to Cloudinary first
          const result = await cloudinary.uploader.upload(req.file.path, { 
            resource_type: "auto",
            folder: "agrilinkx_posts",
            use_filename: true
          });
          
          console.log("Cloudinary upload result:", result);
          
          // Determine media type based on file mimetype
          let mediaType = 'document';
          if (req.file.mimetype.startsWith('image/')) {
            mediaType = 'image';
          } else if (req.file.mimetype.startsWith('video/')) {
            mediaType = 'video';
          }
          
          // Create media object with Cloudinary data
          mediaItem = {
            url: result.secure_url,
            type: mediaType,
            filename: req.file.originalname,
            size: req.file.size,
            width: result.width || null,
            height: result.height || null,
            thumbnailUrl: mediaType === 'video' ? result.thumbnail_url : null
          };
        } catch (cloudinaryError) {
          console.error("Error uploading to cloudinary:", cloudinaryError);
          
          // FALLBACK: Create a local reference if Cloudinary fails
          // Determine media type based on file mimetype
          let mediaType = 'document';
          if (req.file.mimetype.startsWith('image/')) {
            mediaType = 'image';
          } else if (req.file.mimetype.startsWith('video/')) {
            mediaType = 'video';
          }
          
          // Read file as base64
          const fileBuffer = fs.readFileSync(req.file.path);
          const base64Data = fileBuffer.toString('base64');
          
          // Create media object with base64 data
          mediaItem = {
            url: `/uploads/${req.file.filename}`, // Keep URL for backward compatibility
            type: mediaType,
            filename: req.file.originalname,
            size: req.file.size,
            width: null,
            height: null,
            thumbnailUrl: null,
            isLocal: true, // Flag to indicate it's stored locally
            data: `data:${req.file.mimetype};base64,${base64Data}` // Store as data URL
          };
          
          console.log("Created local media reference:", mediaItem);
          
          // Don't delete the local file in this case
          mediaFiles.push(mediaItem); // Add the media item to the array
          return; // Skip the push below since we already added it
        }
        
        mediaFiles.push(mediaItem);
      } catch (uploadError) {
        console.error("Error handling file:", uploadError);
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ 
          message: "Error uploading media. Please try again.",
          error: uploadError.message 
        });
      }
    }

    // Extract hashtags from description
    let hashtags = [];
    const description = req.body.description || '';
    
    // First check if hashtags were explicitly provided
    if (req.body.hashtags) {
      try {
        hashtags = JSON.parse(req.body.hashtags);
      } catch (e) {
        // If it's not valid JSON, treat it as a comma-separated string
        hashtags = req.body.hashtags.split(',').map(tag => tag.trim());
      }
    } else {
      // Extract hashtags from description using regex
      const hashtagRegex = /#(\w+)/g;
      const matches = description.match(hashtagRegex);
      
      if (matches) {
        hashtags = matches.map(tag => tag.substring(1));
      }
    }

    console.log("Creating post with userId:", req.user.id);
    console.log("Extracted hashtags:", hashtags);
    console.log("Media files:", mediaFiles.length);
    console.log("Media items:", JSON.stringify(mediaFiles, null, 2));
    
    const newPost = new Post({
      userId: req.user.id,
      description: description,
      media: mediaFiles,
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
    const post = await Post.findById(req.params.id)
      .populate("userId", "name avatar role")
      .populate({
        path: "comments",
        populate: {
          path: "userId",
          select: "name avatar role"
        }
      });
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const posts = await Post.find({ userId })
      .sort({ createdAt: -1 })
      .populate("userId", "name avatar role");
    
    res.json(posts);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Check if user is authorized to delete the post
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this post" });
    }
    
    // Delete media from cloudinary if exists
    if (post.media && post.media.length > 0) {
      for (const mediaItem of post.media) {
        try {
          if (mediaItem.url) {
            const publicId = mediaItem.url.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
            console.log(`Deleted media ${publicId} from cloudinary`);
          }
        } catch (error) {
          console.error("Error deleting media from cloudinary:", error);
          // Continue with deletion even if cloudinary delete fails
        }
      }
    }
    
    await Post.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Check if user is authorized to update the post
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to update this post" });
    }

    let mediaFiles = [...post.media]; // Start with existing media

    // Handle new file uploads
    if (req.files && req.files.length > 0) {
      console.log(`Processing ${req.files.length} new files for upload`);
      
      // Process each file
      for (const file of req.files) {
        try {
          console.log("Uploading file:", file.path, "Size:", file.size, "Type:", file.mimetype);
          
          let mediaItem;
          
          try {
            // Try uploading to Cloudinary first
            const result = await cloudinary.uploader.upload(file.path, { 
              resource_type: "auto",
              folder: "agrilinkx_posts",
              use_filename: true
            });
            
            console.log("Cloudinary upload result:", result);
            
            // Determine media type based on file mimetype
            let mediaType = 'document';
            if (file.mimetype.startsWith('image/')) {
              mediaType = 'image';
            } else if (file.mimetype.startsWith('video/')) {
              mediaType = 'video';
            }
            
            // Create media object with Cloudinary data
            mediaItem = {
              url: result.secure_url,
              type: mediaType,
              filename: file.originalname,
              size: file.size,
              width: result.width || null,
              height: result.height || null,
              thumbnailUrl: mediaType === 'video' ? result.thumbnail_url : null
            };
          } catch (cloudinaryError) {
            console.error("Error uploading to cloudinary:", cloudinaryError);
            
            // FALLBACK: Create a local reference if Cloudinary fails
            // Determine media type based on file mimetype
            let mediaType = 'document';
            if (file.mimetype.startsWith('image/')) {
              mediaType = 'image';
            } else if (file.mimetype.startsWith('video/')) {
              mediaType = 'video';
            }
            
            // Read file as base64
            const fileBuffer = fs.readFileSync(file.path);
            const base64Data = fileBuffer.toString('base64');
            
            // Create media object with base64 data
            mediaItem = {
              url: `/uploads/${file.filename}`, // Keep URL for backward compatibility
              type: mediaType,
              filename: file.originalname,
              size: file.size,
              width: null,
              height: null,
              thumbnailUrl: null,
              isLocal: true, // Flag to indicate it's stored locally
              data: `data:${file.mimetype};base64,${base64Data}` // Store as data URL
            };
            
            console.log("Created local media reference:", mediaItem);
            
            // Don't delete the local file in this case
            mediaFiles.push(mediaItem); // Add the media item to the array
            continue;
          }
          
          mediaFiles.push(mediaItem);
          
          // Delete local file after successful Cloudinary upload
          fs.unlinkSync(file.path);
          console.log("Local file deleted after upload");
        } catch (uploadError) {
          console.error("Error handling file:", uploadError);
          // Continue with other files even if one fails
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }
    } else if (req.file) {
      // Handle single file for backward compatibility
      try {
        console.log("Uploading single file:", req.file.path, "Size:", req.file.size, "Type:", req.file.mimetype);
        
        let mediaItem;
        
        try {
          // Try uploading to Cloudinary first
          const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "auto",
            folder: "agrilinkx_posts",
            use_filename: true
          });
          
          console.log("Cloudinary upload result:", result);
          
          // Determine media type based on file mimetype
          let mediaType = 'document';
          if (req.file.mimetype.startsWith('image/')) {
            mediaType = 'image';
          } else if (req.file.mimetype.startsWith('video/')) {
            mediaType = 'video';
          }
          
          // Create media object with Cloudinary data
          mediaItem = {
            url: result.secure_url,
            type: mediaType,
            filename: req.file.originalname,
            size: req.file.size,
            width: result.width || null,
            height: result.height || null,
            thumbnailUrl: mediaType === 'video' ? result.thumbnail_url : null
          };
          
          // Delete local file after successful Cloudinary upload
          fs.unlinkSync(req.file.path);
          console.log("Local file deleted after upload");
        } catch (cloudinaryError) {
          console.error("Error uploading to cloudinary:", cloudinaryError);
          
          // FALLBACK: Create a local reference if Cloudinary fails
          // Determine media type based on file mimetype
          let mediaType = 'document';
          if (req.file.mimetype.startsWith('image/')) {
            mediaType = 'image';
          } else if (req.file.mimetype.startsWith('video/')) {
            mediaType = 'video';
          }
          
          // Read file as base64
          const fileBuffer = fs.readFileSync(req.file.path);
          const base64Data = fileBuffer.toString('base64');
          
          // Create media object with base64 data
          mediaItem = {
            url: `/uploads/${req.file.filename}`, // Keep URL for backward compatibility
            type: mediaType,
            filename: req.file.originalname,
            size: req.file.size,
            width: null,
            height: null,
            thumbnailUrl: null,
            isLocal: true, // Flag to indicate it's stored locally
            data: `data:${req.file.mimetype};base64,${base64Data}` // Store as data URL
          };
          
          console.log("Created local media reference:", mediaItem);
          
          // Don't delete the local file in this case
          mediaFiles.push(mediaItem); // Add the media item to the array
          return; // Skip the push below since we already added it
        }
        
        mediaFiles.push(mediaItem);
      } catch (error) {
        console.error("Error uploading to cloudinary:", error);
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }
    }

    // Handle media removals if specified
    if (req.body.removeMedia && req.body.removeMedia.length > 0) {
      let mediaToRemove;
      try {
        mediaToRemove = JSON.parse(req.body.removeMedia);
      } catch (e) {
        mediaToRemove = req.body.removeMedia.split(',').map(id => id.trim());
      }
      
      // Delete media from cloudinary
      for (const mediaId of mediaToRemove) {
        const mediaItem = post.media.id(mediaId);
        if (mediaItem && mediaItem.url) {
          try {
            const publicId = mediaItem.url.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
            console.log(`Deleted media ${publicId} from cloudinary`);
          } catch (error) {
            console.error("Error deleting media from cloudinary:", error);
          }
        }
      }
      
      // Filter out removed media
      mediaFiles = mediaFiles.filter(item => !mediaToRemove.includes(item._id.toString()));
    }

    // Extract hashtags
    let hashtags = post.hashtags;
    if (req.body.hashtags) {
      try {
        hashtags = JSON.parse(req.body.hashtags);
      } catch (e) {
        hashtags = req.body.hashtags.split(',').map(tag => tag.trim());
      }
    } else if (req.body.description) {
      // Extract hashtags from description
      const hashtagRegex = /#(\w+)/g;
      const matches = req.body.description.match(hashtagRegex);
      
      if (matches) {
        hashtags = matches.map(tag => tag.substring(1));
      }
    }

    post.description = req.body.description || post.description;
    post.media = mediaFiles;
    post.hashtags = hashtags;
    post.location = req.body.location || post.location;

    const updatedPost = await post.save();
    await updatedPost.populate('userId', 'name avatar role');
    
    res.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Server error" });
  }
};