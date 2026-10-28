const Post = require("../models/Post");

// @desc    Create a new post or draft
// @route   POST /posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { title, description, content, category, status } = req.body;

    const postData = {
      title,
      description,
      content,
      category,
      createdBy: req.user._id,
      // Only allow "draft" or "pending" on creation
      status: status === "pending" ? "pending" : "draft",
    };

    // If an image was uploaded, store its path
    if (req.file) {
      postData.image = `/uploads/${req.file.filename}`;
    }

    const post = await Post.create(postData);
    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    res.status(500).json({ message: "Failed to create post", error: error.message });
  }
};

// @desc    View all approved posts
// @route   GET /posts
// @access  Public
const getApprovedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: "approved" })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch posts", error: error.message });
  }
};

// @desc    View an approved post by ID
// @route   GET /posts/:id
// @access  Public
const getApprovedPostById = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      status: "approved",
    }).populate("createdBy", "name email");

    if (!post) {
      return res.status(404).json({ message: "Post not found or not approved" });
    }

    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch post", error: error.message });
  }
};

// @desc    View your own posts and drafts
// @route   GET /posts/my-posts
// @access  Private
const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your posts", error: error.message });
  }
};

// @desc    Update your own post
// @route   PATCH /posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found or unauthorized" });
    }

    const { title, description, content, category, status } = req.body;

    if (title !== undefined) post.title = title;
    if (description !== undefined) post.description = description;
    if (content !== undefined) post.content = content;
    if (category !== undefined) post.category = category;

    // Users can change status to "draft" or "pending" only
    if (status === "draft" || status === "pending") {
      post.status = status;
    }

    // If a new image was uploaded, update the path
    if (req.file) {
      post.image = `/uploads/${req.file.filename}`;
    }

    await post.save();
    res.json({ message: "Post updated successfully", post });
  } catch (error) {
    res.status(500).json({ message: "Failed to update post", error: error.message });
  }
};

// @desc    Delete your own post
// @route   DELETE /posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found or unauthorized" });
    }

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete post", error: error.message });
  }
};

module.exports = {
  createPost,
  getApprovedPosts,
  getApprovedPostById,
  getMyPosts,
  updatePost,
  deletePost,
};
