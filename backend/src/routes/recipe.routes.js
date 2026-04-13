/**
 * Recipe Routes
 *
 * All routes are prefixed with /api/recipes (set in app.js).
 * Multer is imported from the shared config so storage settings
 * (disk vs cloud, file-size limits, allowed types) stay in one place.
 */

const express = require("express");
const router = express.Router();

// ── Multer config (src/config/multer.js) ──────────────────────────────────
const { recipeImagesUpload } = require("../config/multer");

// ── Controller ───────────────────────────────────────────────────────────
const recipeController = require("../controllers/recipes.controller");

// ── Auth & role middleware (adjust paths to your project) ─────────────────
// Assumes:  protect   → verifies JWT, attaches req.user
//           adminOnly → allows only users with role === "admin"
const { protect, adminOnly } = require("../middlewares/auth.middleware");

// ─────────────────────────────────────────────
// Multer field config
//   • thumbnail  → single image shown in cards
//   • images     → gallery (up to 5 images)
// ─────────────────────────────────────────────
const recipeUpload = recipeImagesUpload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);
// ═════════════════════════════════════════════
// PUBLIC ROUTES  (no auth required)
// ═════════════════════════════════════════════

// GET  /api/recipes            → paginated list with filters
router.get("/", recipeController.getAllRecipes);

// GET  /api/recipes/featured   → featured recipes (must come before /:id)
router.get("/featured", recipeController.getFeaturedRecipes);

// GET  /api/recipes/user/:userId → public recipes by any user
router.get("/user/:userId", recipeController.getRecipesByUser);

// GET  /api/recipes/:id        → single recipe detail
router.get("/:id", recipeController.getRecipeById);

// ═════════════════════════════════════════════
// PRIVATE ROUTES  (JWT required)
// ═════════════════════════════════════════════

// POST   /api/recipes          → create recipe (with image upload)
router.post("/", protect, recipeUpload, recipeController.createRecipe);

// GET    /api/recipes/my-recipes → logged-in user's own recipes
router.get("/my-recipes/:id", protect, recipeController.getMyRecipes);

// GET    /api/recipes/saved    → recipes bookmarked by current user
router.get("/saved", protect, recipeController.getSavedRecipes);

// PUT    /api/recipes/:id      → update recipe (with optional image upload)
router.put("/:id", protect, recipeUpload, recipeController.updateRecipe);

// DELETE /api/recipes/:id      → delete recipe (owner or admin)
router.delete("/:id", protect, recipeController.deleteRecipe);

// POST   /api/recipes/:id/save → toggle save / unsave
router.post("/:id/save", protect, recipeController.toggleSaveRecipe);

// PATCH  /api/recipes/:id/status → change status (draft/published/archived)
router.patch("/:id/status", protect, recipeController.changeRecipeStatus);

// ═════════════════════════════════════════════
// ADMIN ROUTES  (admin role required)
// ═════════════════════════════════════════════

// PATCH  /api/recipes/:id/feature → toggle isFeatured flag
router.patch("/:id/feature", protect, adminOnly, recipeController.toggleFeatured);

module.exports = router;