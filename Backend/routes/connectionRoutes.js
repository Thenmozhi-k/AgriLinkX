const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// Get suggestions for a user
router.get("/suggestions", authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user.id;
    console.log(`Fetching suggestions for user: ${currentUser}`);
    
    // Get users that the current user is not following
    const user = await User.findById(currentUser).select("following");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Find users that the current user is not following
    const suggestions = await User.find({
      _id: { $ne: currentUser, $nin: user.following }
    }).select("name email role avatar").limit(10);
    
    console.log(`Found ${suggestions.length} suggestions for user ${currentUser}`);
    
    res.json({
      message: "Suggestions retrieved successfully",
      suggestions
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Follow a user
router.post("/follow/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user.id;
    
    // Check if users exist
    const [currentUserDoc, userToFollow] = await Promise.all([
      User.findById(currentUser),
      User.findById(userId)
    ]);
    
    if (!currentUserDoc || !userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if already following
    if (currentUserDoc.following.includes(userId)) {
      return res.status(400).json({ message: "Already following this user" });
    }
    
    // Add to following
    currentUserDoc.following.push(userId);
    
    // Add to followers
    userToFollow.followers.push(currentUser);
    
    // Add to connections with status "following"
    const connectionExists = currentUserDoc.connections.find(
      conn => conn.user.toString() === userId
    );
    
    if (!connectionExists) {
      currentUserDoc.connections.push({
        user: userId,
        status: "following"
      });
    } else {
      connectionExists.status = "following";
    }
    
    await Promise.all([currentUserDoc.save(), userToFollow.save()]);
    
    res.json({
      message: "User followed successfully",
      followedUser: {
        id: userToFollow._id,
        name: userToFollow.name,
        email: userToFollow.email
      }
    });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Unfollow a user
router.delete("/unfollow/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user.id;
    
    // Check if users exist
    const [currentUserDoc, userToUnfollow] = await Promise.all([
      User.findById(currentUser),
      User.findById(userId)
    ]);
    
    if (!currentUserDoc || !userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Remove from following
    currentUserDoc.following = currentUserDoc.following.filter(
      id => id.toString() !== userId
    );
    
    // Remove from followers
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUser
    );
    
    // Update connection status
    const connectionIndex = currentUserDoc.connections.findIndex(
      conn => conn.user.toString() === userId
    );
    
    if (connectionIndex !== -1) {
      currentUserDoc.connections.splice(connectionIndex, 1);
    }
    
    await Promise.all([currentUserDoc.save(), userToUnfollow.save()]);
    
    res.json({
      message: "User unfollowed successfully",
      unfollowedUser: {
        id: userToUnfollow._id,
        name: userToUnfollow.name,
        email: userToUnfollow.email
      }
    });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Check if user is following another user
router.get("/check-following/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user.id;

    console.log(`Checking if user ${currentUser} is following user ${userId}`);

    // Get both users to check the relationship from both sides
    const [currentUserDoc, targetUserDoc] = await Promise.all([
      User.findById(currentUser).select("following followRequests connections"),
      User.findById(userId).select("followers")
    ]);

    if (!currentUserDoc) {
      console.log(`Current user ${currentUser} not found`);
      return res.status(404).json({ message: "User not found" });
    }

    if (!targetUserDoc) {
      console.log(`Target user ${userId} not found`);
      return res.status(404).json({ message: "Target user not found" });
    }

    // Check if current user is following target user
    const isFollowing = currentUserDoc.following.some(id => id.toString() === userId);
    
    // Double-check if target user has current user in their followers
    const isInFollowers = targetUserDoc.followers.some(id => id.toString() === currentUser);
    
    // Log any inconsistencies
    if (isFollowing !== isInFollowers) {
      console.log(`Inconsistency detected: isFollowing=${isFollowing}, isInFollowers=${isInFollowers}`);
    }
    
    // Check connection status
    const connection = currentUserDoc.connections.find(conn => conn.user.toString() === userId);
    const connectionStatus = connection ? connection.status : null;
    
    // Determine if there's a pending request
    const hasRequestedToFollow = connectionStatus === 'requested' || 
      currentUserDoc.followRequests.some(id => id.toString() === userId);

    console.log(`Follow status: isFollowing=${isFollowing}, hasRequestedToFollow=${hasRequestedToFollow}, connectionStatus=${connectionStatus}`);

    res.json({
      isFollowing: isFollowing || isInFollowers, // Consider either direction as valid
      hasRequestedToFollow,
      connectionStatus
    });
  } catch (error) {
    console.error("Error checking follow status:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get followers of a user
router.get("/followers/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(`Fetching followers for user: ${userId}`);
      
      const user = await User.findById(userId)
        .select("name followers")
        .populate("followers", "name email avatar role");
  
      if (!user) {
        console.log(`User ${userId} not found`);
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log(`Found ${user.followers.length} followers for user ${userId}`);
  
      res.json({
        message: "Followers retrieved successfully",
        currentUser: {
          id: user._id,
          name: user.name,
        },
        followers: user.followers,
      });
    } catch (error) {
      console.error("Error fetching followers:", error);
      res.status(500).json({ message: "Server Error" });
    }
  });
  
// Get users that a user is following
router.get("/following/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Fetching following for user: ${userId}`);
    
    const user = await User.findById(userId)
      .select("name following")
      .populate("following", "name email avatar role");

    if (!user) {
      console.log(`User ${userId} not found`);
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log(`Found ${user.following.length} following for user ${userId}`);

    res.json({
      message: "Following users retrieved successfully",
      currentUser: {
        id: user._id,
        name: user.name,
      },
      following: user.following,
    });
  } catch (error) {
    console.error("Error fetching following users:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get follow requests
router.get("/follow-requests", authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user.id;
    
    const user = await User.findById(currentUser)
      .populate("followRequests", "name email avatar role");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      message: "Follow requests retrieved successfully",
      followRequests: user.followRequests
    });
  } catch (error) {
    console.error("Error fetching follow requests:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Accept follow request
router.post("/accept-follow/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user.id;
    
    const [currentUserDoc, follower] = await Promise.all([
      User.findById(currentUser),
      User.findById(userId)
    ]);
    
    if (!currentUserDoc || !follower) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if there's a follow request
    if (!currentUserDoc.followRequests.includes(userId)) {
      return res.status(400).json({ message: "No follow request from this user" });
    }
    
    // Remove from follow requests
    currentUserDoc.followRequests = currentUserDoc.followRequests.filter(
      id => id.toString() !== userId
    );
    
    // Add to followers
    currentUserDoc.followers.push(userId);
    
    // Add current user to follower's following list
    follower.following.push(currentUser);
    
    await Promise.all([currentUserDoc.save(), follower.save()]);
    
    res.json({
      message: "Follow request accepted",
      follower: {
        id: follower._id,
        name: follower.name,
        email: follower.email
      }
    });
  } catch (error) {
    console.error("Error accepting follow request:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Reject follow request
router.delete("/reject-follow/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user.id;
    
    const currentUserDoc = await User.findById(currentUser);
    
    if (!currentUserDoc) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if there's a follow request
    if (!currentUserDoc.followRequests.includes(userId)) {
      return res.status(400).json({ message: "No follow request from this user" });
    }
    
    // Remove from follow requests
    currentUserDoc.followRequests = currentUserDoc.followRequests.filter(
      id => id.toString() !== userId
    );
    
    await currentUserDoc.save();
    
    res.json({
      message: "Follow request rejected",
      userId
    });
  } catch (error) {
    console.error("Error rejecting follow request:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get mutual connections between two users
router.get("/mutual/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user.id;
    
    console.log(`Finding mutual connections between ${currentUser} and ${userId}`);
    
    // Get both users with their following lists
    const [currentUserDoc, otherUserDoc] = await Promise.all([
      User.findById(currentUser).select("following"),
      User.findById(userId).select("following")
    ]);
    
    if (!currentUserDoc || !otherUserDoc) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Convert ObjectId to strings for easier comparison
    const currentUserFollowing = currentUserDoc.following.map(id => id.toString());
    const otherUserFollowing = otherUserDoc.following.map(id => id.toString());
    
    // Find mutual connections (users that both are following)
    const mutualConnectionIds = currentUserFollowing.filter(id => 
      otherUserFollowing.includes(id)
    );
    
    console.log(`Found ${mutualConnectionIds.length} mutual connections`);
    
    // Get details of mutual connections
    const mutualConnections = await User.find({
      _id: { $in: mutualConnectionIds }
    }).select("name email avatar role");
    
    res.json({
      message: "Mutual connections retrieved successfully",
      mutualConnections
    });
  } catch (error) {
    console.error("Error finding mutual connections:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;