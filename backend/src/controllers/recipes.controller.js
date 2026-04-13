/**
 * Recipe Controller
 *
 * Handles HTTP request/response cycle.
 * Delegates all business logic to recipeService.
 */

const recipeService = require("../services/recipes.services");

// ─────────────────────────────────────────────
// Helper — sends a consistent success response
// ─────────────────────────────────────────────
const sendSuccess = (res, statusCode, message, data = {}) => {
  res.status(statusCode).json({ success: true, message, ...data });
};

// ─────────────────────────────────────────────
// Helper — centralised error handler
// ─────────────────────────────────────────────
const handleError = (res, error) => {
  const status = error.statusCode || 500;
  const message = error.message || "Internal server error";
  res.status(status).json({ success: false, message });
};

// ═════════════════════════════════════════════
// @route   POST /api/recipes
// @desc    Create a new recipe
// @access  Private (authenticated users)
// ═════════════════════════════════════════════
const createRecipe = async (req, res) => {
  try {
    // Parse JSON fields that arrive as strings (multipart/form-data)
    const recipeData = { ...req.body };

    // Parse array / object fields that are sent as JSON strings
    const jsonFields = [
      "ingredients",
      "steps",
      "dietType",
      "tags",
      "tips",
      "equipment",
      "nutrition",
    ];
    jsonFields.forEach((field) => {
      if (recipeData[field] && typeof recipeData[field] === "string") {
        try {
          recipeData[field] = JSON.parse(recipeData[field]);
        } catch (_) {
          // leave as-is if it can't be parsed
        }
      }
    });

    const recipe = await recipeService.createRecipe(
      recipeData,
      req.user._id,
      req.files // { thumbnail: [...], images: [...] }
    );

    sendSuccess(res, 201, "Recipe created successfully", { recipe });
  } catch (error) {
    handleError(res, error);
  }
};

// ═════════════════════════════════════════════
// @route   GET /api/recipes
// @desc    Get all published recipes (filtered + paginated)
// @access  Public
// ═════════════════════════════════════════════
const getAllRecipes = async (req, res) => {
  try {
    const result = await recipeService.getAllRecipes(req.query);
    sendSuccess(res, 200, "Recipes fetched successfully", result);
  } catch (error) {
    handleError(res, error);
  }
};

// ═════════════════════════════════════════════
// @route   GET /api/recipes/featured
// @desc    Get featured recipes
// @access  Public
// ═════════════════════════════════════════════
const getFeaturedRecipes = async (req, res) => {
  try {
    const { limit } = req.query;
    const recipes = await recipeService.getFeaturedRecipes(limit);
    sendSuccess(res, 200, "Featured recipes fetched", { recipes });
  } catch (error) {
    handleError(res, error);
  }
};

// ═════════════════════════════════════════════
// @route   GET /api/recipes/saved
// @desc    Get current user's saved/bookmarked recipes
// @access  Private
// ═════════════════════════════════════════════
const getSavedRecipes = async (req, res) => {
  try {
    const recipes = await recipeService.getSavedRecipes(req.user._id);
    sendSuccess(res, 200, "Saved recipes fetched", { recipes });
  } catch (error) {
    handleError(res, error);
  }
};

// ═════════════════════════════════════════════
// @route   GET /api/recipes/my-recipes
// @desc    Get recipes created by the logged-in user
// @access  Private
// ═════════════════════════════════════════════
const getMyRecipes = async (req, res) => {
  try {
    const result = await recipeService.getRecipesByAuthor(
      req.user._id,
      req.query
    );
    sendSuccess(res, 200, "Your recipes fetched", result);
  } catch (error) {
    handleError(res, error);
  }
};

// ═════════════════════════════════════════════
// @route   GET /api/recipes/user/:userId
// @desc    Get all published recipes by any user (public profile)
// @access  Public
// ═════════════════════════════════════════════
const getRecipesByUser = async (req, res) => {
  try {
    const result = await recipeService.getRecipesByAuthor(
      req.params.userId,
      { ...req.query, status: "published" }
    );
    sendSuccess(res, 200, "User recipes fetched", result);
  } catch (error) {
    handleError(res, error);
  }
};

// ═════════════════════════════════════════════
// @route   GET /api/recipes/:id
// @desc    Get a single recipe by ID
// @access  Public
// ═════════════════════════════════════════════
const getRecipeById = async (req, res) => {
  try {
    const recipe = await recipeService.getRecipeById(req.params.id);
    sendSuccess(res, 200, "Recipe fetched successfully", { recipe });
  } catch (error) {
    handleError(res, error);
  }
};

// ═════════════════════════════════════════════
// @route   PUT /api/recipes/:id
// @desc    Update a recipe
// @access  Private (owner only)
// ═════════════════════════════════════════════
const updateRecipe = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Parse stringified JSON fields (multipart/form-data)
    const jsonFields = [
      "ingredients",
      "steps",
      "dietType",
      "tags",
      "tips",
      "equipment",
      "nutrition",
    ];
    jsonFields.forEach((field) => {
      if (updateData[field] && typeof updateData[field] === "string") {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (_) {}
      }
    });

    const recipe = await recipeService.updateRecipe(
      req.params.id,
      req.user._id,
      updateData,
      req.files
    );

    sendSuccess(res, 200, "Recipe updated successfully", { recipe });
  } catch (error) {
    handleError(res, error);
  }
};

// ═════════════════════════════════════════════
// @route   DELETE /api/recipes/:id
// @desc    Delete a recipe
// @access  Private (owner or admin)
// ═════════════════════════════════════════════
const deleteRecipe = async (req, res) => {
  try {
    await recipeService.deleteRecipe(
      req.params.id,
      req.user._id,
      req.user.role
    );
    sendSuccess(res, 200, "Recipe deleted successfully");
  } catch (error) {
    handleError(res, error);
  }
};

// ═════════════════════════════════════════════
// @route   POST /api/recipes/:id/save
// @desc    Toggle save/unsave a recipe
// @access  Private
// ═════════════════════════════════════════════
const toggleSaveRecipe = async (req, res) => {
  try {
    const result = await recipeService.toggleSaveRecipe(
      req.params.id,
      req.user._id
    );
    const message = result.saved ? "Recipe saved" : "Recipe unsaved";
    sendSuccess(res, 200, message, result);
  } catch (error) {
    handleError(res, error);
  }
};

// ═════════════════════════════════════════════
// @route   PATCH /api/recipes/:id/status
// @desc    Change recipe status (draft / published / archived)
// @access  Private (owner)
// ═════════════════════════════════════════════
const changeRecipeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const recipe = await recipeService.changeRecipeStatus(
      req.params.id,
      req.user._id,
      status
    );
    sendSuccess(res, 200, `Recipe status changed to "${status}"`, { recipe });
  } catch (error) {
    handleError(res, error);
  }
};

// ═════════════════════════════════════════════
// @route   PATCH /api/recipes/:id/feature   (Admin)
// @desc    Toggle featured flag
// @access  Private (admin)
// ═════════════════════════════════════════════
const toggleFeatured = async (req, res) => {
  try {
    const recipe = await recipeService.toggleFeatured(req.params.id);
    const message = recipe.isFeatured
      ? "Recipe marked as featured"
      : "Recipe removed from featured";
    sendSuccess(res, 200, message, { recipe });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createRecipe,
  getAllRecipes,
  getFeaturedRecipes,
  getSavedRecipes,
  getMyRecipes,
  getRecipesByUser,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  toggleSaveRecipe,
  changeRecipeStatus,
  toggleFeatured,
};