const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/profiles');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

// Filter for image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer upload instance
const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Update profile information - simplified version without file handling
exports.updateProfile = async (req, res) => {
  try {
    console.log('Update profile request body:', req.body);
    console.log('User in request:', req.user);
    
    // Get user ID from request (handle both formats)
    const userId = req.user.id || req.user._id;
    console.log('Using user ID:', userId);
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in request' });
    }
    
    // Extract fields from request body
    const { name, title, location, company, website, bio } = req.body;
    
    // Create update object with only provided fields
    const updateFields = {};
    if (name) updateFields.name = name;
    if (title) updateFields.title = title;
    if (location) updateFields.location = location;
    if (company) updateFields.company = company;
    if (website) updateFields.website = website;
    if (bio) updateFields.bio = bio;
    
    console.log('Update fields:', updateFields);
    
    // Find and update the user in one operation
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Profile update successful');
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Update about section
exports.updateAbout = async (req, res) => {
  try {
    console.log('Update about request body:', req.body);
    console.log('User in request:', req.user);
    
    const { about } = req.body;
    
    if (!about) {
      return res.status(400).json({ message: 'About content is required' });
    }
    
    // Get user ID from request (handle both formats)
    const userId = req.user.id || req.user._id;
    console.log('Using user ID:', userId);
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in request' });
    }
    
    // Find and update the user
    const user = await User.findByIdAndUpdate(
      userId,
      { about },
      { new: true }
    ).select('-password');
    
    console.log('Updated user about section:', user ? 'Success' : 'Failed');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'About section updated successfully', user });
  } catch (error) {
    console.error('Error updating about section:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Update skills
exports.updateSkills = async (req, res) => {
  try {
    console.log('Update skills request body:', req.body);
    console.log('User in request:', req.user);
    
    const { skills } = req.body;
    
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ message: 'Skills must be provided as an array' });
    }
    
    // Get user ID from request (handle both formats)
    const userId = req.user.id || req.user._id;
    console.log('Using user ID:', userId);
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in request' });
    }
    
    // Find and update the user
    const user = await User.findByIdAndUpdate(
      userId,
      { skills },
      { new: true }
    ).select('-password');
    
    console.log('Updated user skills:', user ? 'Success' : 'Failed');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'Skills updated successfully', user });
  } catch (error) {
    console.error('Error updating skills:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Upload cover photo
exports.uploadCoverPhoto = async (req, res) => {
  try {
    console.log('Upload cover photo request file:', req.file);
    console.log('User in request:', req.user);
    
    // Get user ID from request (handle both formats)
    const userId = req.user.id || req.user._id;
    console.log('Using user ID:', userId);
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in request' });
    }
    
    // Find the user
    let user = await User.findById(userId);
    console.log('Found user:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Handle cover photo upload
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Delete old cover photo if exists
    if (user.coverPhoto && user.coverPhoto.startsWith('/uploads/')) {
      try {
        const oldCoverPath = path.join(__dirname, '..', user.coverPhoto);
        console.log('Checking for old cover photo at:', oldCoverPath);
        if (fs.existsSync(oldCoverPath)) {
          fs.unlinkSync(oldCoverPath);
          console.log('Deleted old cover photo file');
        }
      } catch (fileError) {
        console.error('Error handling old cover photo file:', fileError);
        // Continue even if file deletion fails
      }
    }
    
    // Set new cover photo path
    user.coverPhoto = `/uploads/profiles/${req.file.filename}`;
    console.log('Set new cover photo path:', user.coverPhoto);
    
    // Save updated user
    console.log('Saving updated user data');
    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(userId).select('-password');
    
    console.log('Cover photo update successful');
    res.json({ message: 'Cover photo updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error uploading cover photo:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Upload profile photo
exports.uploadProfilePhoto = async (req, res) => {
  try {
    console.log('Upload profile photo request file:', req.file);
    console.log('User in request:', req.user);
    
    // Get user ID from request (handle both formats)
    const userId = req.user.id || req.user._id;
    console.log('Using user ID:', userId);
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in request' });
    }
    
    // Find the user
    let user = await User.findById(userId);
    console.log('Found user:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Handle profile photo upload
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Delete old avatar file if exists
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      try {
        const oldAvatarPath = path.join(__dirname, '..', user.avatar);
        console.log('Checking for old avatar at:', oldAvatarPath);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
          console.log('Deleted old avatar file');
        }
      } catch (fileError) {
        console.error('Error handling old avatar file:', fileError);
        // Continue even if file deletion fails
      }
    }
    
    // Set new avatar path
    user.avatar = `/uploads/profiles/${req.file.filename}`;
    console.log('Set new avatar path:', user.avatar);
    
    // Save updated user
    console.log('Saving updated user data');
    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(userId).select('-password');
    
    console.log('Profile photo update successful');
    res.json({ message: 'Profile photo updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Export multer middleware for route usage
exports.uploadMiddleware = {
  single: (fieldName) => {
    return (req, res, next) => {
      console.log(`Processing ${fieldName} upload`);
      upload.single(fieldName)(req, res, (err) => {
        if (err) {
          console.error(`Error in ${fieldName} upload:`, err);
          return res.status(400).json({ message: err.message });
        }
        console.log(`${fieldName} upload processed successfully`);
        next();
      });
    };
  }
};