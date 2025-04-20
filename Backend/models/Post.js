const mongoose = require("mongoose");
const UserPostCounter = require("./UserPostCounter");

const PostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true },
    media: { type: String }, // URL of image or video
    hashtags: { type: [String], default: [] },
    reactions: { type: Array, default: [] }, // Changed to Array type for simpler handling
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: [] }],
    shares: { type: Number, default: 0 },
    postId: { type: Number, unique: true }, // Not required, will be generated
    location: { type: String }
  },
  { timestamps: true }
);

// Middleware to generate a unique postId before saving
PostSchema.pre("save", async function (next) {
  try {
    // Only generate postId if it doesn't exist
    if (!this.postId) {
      console.log("Generating postId for post with userId:", this.userId);
      
      // Use the static method to get the next sequence
      const nextCount = await UserPostCounter.getNextSequence(this.userId);
      
      // Create a unique global postId using timestamp + userId + counter
      // This ensures uniqueness even if multiple users create posts at the same time
      const timestamp = Math.floor(Date.now() / 1000).toString(16); // Unix timestamp in hex
      const userIdStr = this.userId.toString().slice(-4); // Last 4 chars of userId
      const uniqueId = parseInt(`${timestamp}${userIdStr}${nextCount}`.slice(-9));
      
      console.log("Generated unique postId:", uniqueId);
      this.postId = uniqueId;
    }
    next();
  } catch (error) {
    console.error("Error in PostSchema pre-save middleware:", error);
    next(error);
  }
});

module.exports = mongoose.model("Post", PostSchema);