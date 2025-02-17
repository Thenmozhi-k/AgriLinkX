const express = require("express");
const router = express.Router();
const { createPost, getPost, getUserPosts, deletePost, updatePost } = require("../controllers/postController");
const upload = require("../middleware/upload");

router.post("/create", upload.single("media"), createPost);
router.get("/:id", getPost);
router.get("/user/:userId", getUserPosts);
router.delete("/:id", deletePost);
router.put("/:id", upload.single("media"), updatePost);

module.exports = router;
