const mongoose = require("mongoose");
const UserPostCounter = require("./UserPostCounter");

const MediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video', 'document'], required: true },
  filename: { type: String },
  size: { type: Number },
  width: { type: Number },
  height: { type: Number },
  thumbnailUrl: { type: String },
  isLocal: { type: Boolean, default: false },
  data: { type: String } // For storing base64 encoded data
});

const PostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true },
    media: [MediaSchema], // Array of media files
    hashtags: { type: [String], default: [] },
    reactions: [{ 
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      type: { type: String, enum: ['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry'], default: 'like' },
      createdAt: { type: Date, default: Date.now }
    }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: [] }],
    shares: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now }
    }],
    postId: { type: Number }, // User-specific post ID
    globalPostId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() }, // Global unique ID
    location: { type: String },
    viewCount: { type: Number, default: 0 }
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
      this.postId = nextCount;
    }
    
    // Extract hashtags from description if not already provided
    if (this.description && (!this.hashtags || this.hashtags.length === 0)) {
      const hashtagRegex = /#(\w+)/g;
      const matches = this.description.match(hashtagRegex);
      
      if (matches) {
        this.hashtags = matches.map(tag => tag.substring(1));
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Virtual for reaction counts
PostSchema.virtual('reactionCounts').get(function() {
  const counts = {};
  this.reactions.forEach(reaction => {
    counts[reaction.type] = (counts[reaction.type] || 0) + 1;
  });
  return counts;
});

// Virtual for total reaction count
PostSchema.virtual('totalReactions').get(function() {
  return this.reactions.length;
});

// Virtual for comment count
PostSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for share count
PostSchema.virtual('shareCount').get(function() {
  return this.shares.length;
});

// Virtual for media count
PostSchema.virtual('mediaCount').get(function() {
  return this.media.length;
});

// Configure toJSON to include virtuals
PostSchema.set('toJSON', { virtuals: true });
PostSchema.set('toObject', { virtuals: true });

// Create a composite unique index on userId and postId
PostSchema.index({ userId: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model("Post", PostSchema);