const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const postController = require("../controllers/post.controller");

router.post("/", protect, postController.createPost);
router.get("/feed", postController.getFeedPosts);
router.post("/:id/like", protect, postController.toggleLike);
router.post("/:id/comment", protect, postController.addComment);
router.post("/:id/vote", protect, postController.votePoll);
router.delete("/:id", protect, postController.deletePost);

module.exports = router;
