// routes/hashtagRoutes.js
const express = require("express");
const router = express.Router();
const { getTrendingHashtags, getPostsByHashtag } = require("../controllers/hashtagController");

router.get("/trending", getTrendingHashtags);  // Fetch trending hashtags
router.get("/:tag", getPostsByHashtag);  // Fetch posts associated with a specific hashtag

module.exports = router;
