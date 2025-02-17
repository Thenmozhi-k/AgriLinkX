const mongoose = require("mongoose");
const UserPostCounter = require("./UserPostCounter");

const PostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: { type: String, required: true },
    media: { type: String }, // URL of image or video
    hashtags: { type: [String], default: [] },
    reactions: [{ type: Map, of: Number, default: {} }], // like, love, etc.
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    shares: { type: Number, default: 0 },
    postId: { type: Number, required: true, unique: true },
  },
  { timestamps: true }
);

// Middleware to generate a unique postId before saving
PostSchema.pre("save", async function (next) {
  if (!this.postId) {
    const counter = await UserPostCounter.findOneAndUpdate(
      { userId: this.userId },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );

    // Create a postId using userId and the current counter
    this.postId = counter.count;
  }
  next();
});

module.exports = mongoose.model("Post", PostSchema);
