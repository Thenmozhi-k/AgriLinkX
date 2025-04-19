const mongoose = require('mongoose');

const hashtagSchema = new mongoose.Schema({
  tag: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }] // Assuming posts are linked here
});

const Hashtag = mongoose.model('Hashtag', hashtagSchema);

module.exports = Hashtag;
