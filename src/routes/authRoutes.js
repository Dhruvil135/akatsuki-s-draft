const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// POST /auth/register — Register a new user
router.post("/register", register);

// POST /auth/login — Log in and receive a JWT token
router.post("/login", login);

// GET /auth/me — Get the currently logged-in user's details
router.get("/me", protect, getMe);

module.exports = router;
