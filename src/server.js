const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
const uploadsDir = process.env.VERCEL
  ? path.join("/tmp", "uploads")
  : path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsDir));

// Health check (does not require DB)
app.get("/", (req, res) => {
  res.json({
    message: "Akatsuki's Draft API is running",
    version: "1.0.0",
    platform: process.env.VERCEL ? "vercel-serverless" : "standalone",
  });
});

// Ensure MongoDB is connected before handling any API routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection error in request:", err.message);
    return res.status(500).json({
      message: "Database connection failed",
      error: err.message,
    });
  }
});

// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/posts", require("./routes/postRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/ai", require("./routes/aiRoutes"));

// Global error handler
app.use((err, req, res, next) => {
  if (err.name === "MulterError") {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// Only start the HTTP listener if not running in a serverless environment (like Vercel)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
