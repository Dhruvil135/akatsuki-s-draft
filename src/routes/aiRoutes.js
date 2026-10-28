const express = require("express");
const router = express.Router();
const { improveContent, listModels } = require("../controllers/aiController");
const { protect } = require("../middleware/auth");

const upload = require("../config/multer");

// GET /ai/models — Diagnostic endpoint to view available Gemini models for this API key
router.get("/models", listModels);

// POST /ai/improve/:postId — Improve content using AI (supports optional new file/document upload)
router.post("/improve/:postId", protect, upload.single("image"), improveContent);

module.exports = router;
