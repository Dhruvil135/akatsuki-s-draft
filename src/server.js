const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/posts", require("./routes/postRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/ai", require("./routes/aiRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Akatsuki's Draft API is running",
    version: "1.0.0",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  if (err.name === "MulterError") {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
