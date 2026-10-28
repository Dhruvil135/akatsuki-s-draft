const express = require("express");
const router = express.Router();
const {
  createPost,
  getApprovedPosts,
  getApprovedPostById,
  getMyPosts,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const { protect } = require("../middleware/auth");
const upload = require("../config/multer");

// GET /posts — View all approved posts (public)
router.get("/", getApprovedPosts);

// GET /posts/my-posts — View your own posts and drafts (private)
// NOTE: This must come BEFORE /:id to avoid "my-posts" being treated as an ID
router.get("/my-posts", protect, getMyPosts);

// GET /posts/:id — View an approved post by ID (public)
router.get("/:id", getApprovedPostById);

// POST /posts — Create a new post or draft (private, with optional image upload)
router.post("/", protect, upload.single("image"), createPost);

// PATCH /posts/:id — Update your own post (private, with optional image upload)
router.patch("/:id", protect, upload.single("image"), updatePost);

// DELETE /posts/:id — Delete your own post (private)
router.delete("/:id", protect, deletePost);

module.exports = router;
