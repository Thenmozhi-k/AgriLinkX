const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    likes: [{ 
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }],
    replies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }],
    isReply: {
      type: Boolean,
      default: false
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null
    },
    media: { 
      url: { type: String },
      type: { type: String, enum: ['image', 'video', null], default: null }
    },
    hashtags: { type: [String], default: [] }
  },
  { timestamps: true }
);

// Virtual for like count
commentSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Middleware to extract hashtags from content
commentSchema.pre('save', function(next) {
  if (this.content) {
    const hashtagRegex = /#(\w+)/g;
    const matches = this.content.match(hashtagRegex);
    
    if (matches) {
      this.hashtags = matches.map(tag => tag.substring(1));
    }
  }
  next();
});

// Configure toJSON to include virtuals
commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;