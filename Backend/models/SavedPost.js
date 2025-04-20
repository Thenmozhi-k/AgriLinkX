const mongoose = require("mongoose");

const SavedPostSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    postId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Post", 
      required: true 
    },
    savedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

// Create a compound index to ensure a user can only save a post once
SavedPostSchema.index({ userId: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model("SavedPost", SavedPostSchema);