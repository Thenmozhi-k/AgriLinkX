// controllers/hashtagController.js
const Hashtag = require('../models/Hashtag');
const Post = require('../models/Post');

exports.getTrendingHashtags = async (req, res) => {
  try {
    const trendingHashtags = await Hashtag.find().sort({ count: -1 }).limit(10);
    res.json(trendingHashtags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPostsByHashtag = async (req, res) => {
  try {
    const tag = req.params.tag;  // Extract hashtag from URL parameter
    const hashtag = await Hashtag.findOne({ tag: tag }).populate('posts');
    if (!hashtag) return res.status(404).json({ message: 'Hashtag not found' });

    res.json(hashtag.posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
