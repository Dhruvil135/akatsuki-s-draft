const { GoogleGenAI } = require("@google/genai");
const path = require("path");
const fs = require("fs");
const Post = require("../models/Post");

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @desc    Improve content using AI and save as a new draft (with document/file processing support)
// @route   POST /ai/improve/:postId
// @access  Private
const improveContent = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.postId,
      createdBy: req.user._id,
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found or unauthorized" });
    }

    // Build the prompt for Gemini
    const userInstructions = req.body.instructions
      ? `\nAdditional User Instructions: ${req.body.instructions}`
      : "";

    const promptText = `You are a professional content editor and writer. 
Improve the following blog post content. Make it more engaging, well-structured, 
and polished while preserving the original meaning and intent. 
If an attached document or image is provided, incorporate insights, facts, or relevant details from it into the improved content.
Fix any grammar or spelling issues. Enhance the flow and readability.${userInstructions}
Return ONLY the improved content text, no extra commentary or markdown backticks wrapper.

Title: ${post.title}

Original Content:
${post.content}`;

    // Contents array for Gemini API (supports Multimodal Document & File Processing)
    const contents = [promptText];

    // Determine if there is a file: either uploaded in current request or from post.image
    let targetFilePath = null;
    let targetMimeType = null;

    if (req.file) {
      targetFilePath = req.file.path;
      targetMimeType = req.file.mimetype;
    } else if (post.image) {
      const resolvedPath = path.join(__dirname, "..", "..", post.image.replace(/^\//, ""));
      if (fs.existsSync(resolvedPath)) {
        targetFilePath = resolvedPath;
        const ext = path.extname(resolvedPath).toLowerCase();
        if (ext === ".pdf") targetMimeType = "application/pdf";
        else if (ext === ".png") targetMimeType = "image/png";
        else if (ext === ".webp") targetMimeType = "image/webp";
        else if (ext === ".gif") targetMimeType = "image/gif";
        else targetMimeType = "image/jpeg";
      }
    }

    // If an image or PDF document exists, read and pass as inlineData to Gemini
    if (targetFilePath && targetMimeType) {
      const fileBase64 = fs.readFileSync(targetFilePath).toString("base64");
      contents.push({
        inlineData: {
          mimeType: targetMimeType,
          data: fileBase64,
        },
      });
    }

    // Models to try in order of availability and speed
    const modelsToTry = [
      process.env.GEMINI_MODEL,
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ].filter(Boolean);
    let response = null;
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model,
          contents,
        });
        if (response && response.text) break;
      } catch (err) {
        lastError = err;
        console.warn(`Model ${model} failed, trying next fallback:`, err.message);
      }
    }

    const improvedContent = response?.text;

    if (!improvedContent) {
      throw lastError || new Error("AI did not return improved content");
    }

    // Save as a NEW draft under the same user, preserving the original draft
    const newDraft = await Post.create({
      title: post.title,
      description: post.description,
      content: improvedContent.trim(),
      image: req.file ? `/uploads/${req.file.filename}` : post.image,
      category: post.category,
      createdBy: req.user._id,
      status: "draft",
    });

    res.status(201).json({
      message: "Content improved and saved as a new draft",
      documentProcessed: !!(targetFilePath && targetMimeType),
      originalPost: {
        _id: post._id,
        title: post.title,
        content: post.content,
        status: post.status,
      },
      improvedDraft: newDraft,
    });
  } catch (error) {
    console.error("AI improvement error:", error);
    res.status(500).json({
      message: "Failed to improve content",
      error: error.message,
    });
  }
};

module.exports = { improveContent };

