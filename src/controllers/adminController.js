const Post = require("../models/Post");

// @desc    View posts awaiting approval
// @route   GET /admin/posts/pending
// @access  Private/Admin
const getPendingPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: "pending" })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending posts", error: error.message });
  }
};

// @desc    Approve a post
// @route   PATCH /admin/posts/approve/:id
// @access  Private/Admin
const approvePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.status = "approved";
    await post.save();

    res.json({ message: "Post approved successfully", post });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve post", error: error.message });
  }
};

// @desc    Reject a post
// @route   PATCH /admin/posts/reject/:id
// @access  Private/Admin
const rejectPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.status = "rejected";
    await post.save();

    res.json({ message: "Post rejected", post });
  } catch (error) {
    res.status(500).json({ message: "Failed to reject post", error: error.message });
  }
};

module.exports = { getPendingPosts, approvePost, rejectPost };
