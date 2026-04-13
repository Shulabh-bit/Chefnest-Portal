const express = require("express");
const cors = require("cors");
const path = require("path");

const { PORT, NODE_ENV, CLIENT_URL } = require("./config/config");
const connectDB = require("./config/db");
const userRoutes = require("./routes/user.routes");
const recipeRoutes = require("./routes/recipe.routes");
const commentRoutes = require("./routes/comment.routes");

const app = express();

// CORS middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploads folder as static files
// Images will be accessible at:
// http://localhost:3000/uploads/profile_pics/filename.jpg
// http://localhost:3000/uploads/recipe_images/filename.jpg
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Request logging (development only)
if (NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Database connection
connectDB();

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Recipe-Nest API",
    version: "1.0.0",
    status: "running",
  });
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/comments", commentRoutes);

// 404 handler
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    statusCode,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`API: http://localhost:${PORT}`);
  console.log(`Uploads: http://localhost:${PORT}/uploads`);
});

module.exports = app;