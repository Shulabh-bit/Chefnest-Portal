const Recipe = require("../models/recipes.models");
const path = require("path");

// ── Helper to convert absolute multer path to relative URL path ──
const getRelativePath = (absolutePath) => {
  if (!absolutePath) return null;
  // Convert backslashes to forward slashes (Windows)
  const normalized = absolutePath.replace(/\\/g, "/");
  // Extract from "uploads/" onwards
  const idx = normalized.indexOf("uploads/");
  if (idx !== -1) return normalized.substring(idx);
  // fallback — just return filename
  return `uploads/recipe_images/${path.basename(normalized)}`;
};

// ═════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════
const createRecipe = async (recipeData, authorId, files = {}) => {
  if (files.thumbnail && files.thumbnail[0]) {
    recipeData.thumbnail = getRelativePath(files.thumbnail[0].path);
  }
  if (files.images && files.images.length > 0) {
    recipeData.images = files.images.map((file) => getRelativePath(file.path));
  }
  const recipe = await Recipe.create({ ...recipeData, author: authorId });
  return recipe;
};

// ═════════════════════════════════════════════
// READ — ALL / PAGINATED
// ═════════════════════════════════════════════
const getAllRecipes = async (queryParams = {}) => {
  const {
    page = 1, limit = 12, category, cuisine, difficulty,
    dietType, search, sort = "-createdAt", isFeatured,
  } = queryParams;

  const filter = { status: "published", isPublic: true };
  if (category) filter.category = category;
  if (cuisine) filter.cuisine = new RegExp(cuisine, "i");
  if (difficulty) filter.difficulty = difficulty;
  if (isFeatured === "true") filter.isFeatured = true;
  if (dietType) {
    const types = dietType.split(",").map((t) => t.trim());
    filter.dietType = { $all: types };
  }
  if (search) filter.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [recipes, totalCount] = await Promise.all([
    Recipe.find(filter).sort(sort).skip(skip).limit(Number(limit))
      .populate("author", "name avatar").select("-savedBy -__v"),
    Recipe.countDocuments(filter),
  ]);

  return {
    recipes, totalCount,
    totalPages: Math.ceil(totalCount / Number(limit)),
    currentPage: Number(page),
  };
};

// ═════════════════════════════════════════════
// READ — SINGLE
// ═════════════════════════════════════════════
const getRecipeById = async (recipeId) => {
  const recipe = await Recipe.findByIdAndUpdate(
    recipeId, { $inc: { viewCount: 1 } }, { new: true }
  ).populate("author", "name avatar bio").select("-savedBy -__v");

  if (!recipe) {
    const error = new Error("Recipe not found");
    error.statusCode = 404;
    throw error;
  }
  return recipe;
};

// ═════════════════════════════════════════════
// READ — BY AUTHOR
// ═════════════════════════════════════════════
const getRecipesByAuthor = async (authorId, queryParams = {}) => {
  const { page = 1, limit = 12, status } = queryParams;
  const filter = { author: authorId };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [recipes, totalCount] = await Promise.all([
    Recipe.find(filter)
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit))
      .populate("author", "name avatar specialty bio address phone")
      .select("-savedBy -__v"),
    Recipe.countDocuments(filter),
  ]);

  return {
    recipes, totalCount,
    totalPages: Math.ceil(totalCount / Number(limit)),
    currentPage: Number(page),
  };
};

// ═════════════════════════════════════════════
// UPDATE
// ═════════════════════════════════════════════
const updateRecipe = async (recipeId, authorId, updateData, files = {}) => {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    const error = new Error("Recipe not found");
    error.statusCode = 404;
    throw error;
  }
  if (recipe.author.toString() !== authorId.toString()) {
    const error = new Error("You are not authorized to update this recipe");
    error.statusCode = 403;
    throw error;
  }

  if (files.thumbnail && files.thumbnail[0]) {
    updateData.thumbnail = getRelativePath(files.thumbnail[0].path);
  }
  if (files.images && files.images.length > 0) {
    const newImagePaths = files.images.map((f) => getRelativePath(f.path));
    updateData.images = [...(recipe.images || []), ...newImagePaths];
  }

  const updatedRecipe = await Recipe.findByIdAndUpdate(
    recipeId, { $set: updateData }, { new: true, runValidators: true }
  ).select("-savedBy -__v");

  return updatedRecipe;
};

// ═════════════════════════════════════════════
// DELETE
// ═════════════════════════════════════════════
const deleteRecipe = async (recipeId, authorId, userRole) => {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    const error = new Error("Recipe not found");
    error.statusCode = 404;
    throw error;
  }
  const isOwner = recipe.author.toString() === authorId.toString();
  const isAdmin = userRole === "admin";
  if (!isOwner && !isAdmin) {
    const error = new Error("You are not authorized to delete this recipe");
    error.statusCode = 403;
    throw error;
  }
  await recipe.deleteOne();
};

// ═════════════════════════════════════════════
// SAVE / UNSAVE
// ═════════════════════════════════════════════
const toggleSaveRecipe = async (recipeId, userId) => {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    const error = new Error("Recipe not found");
    error.statusCode = 404;
    throw error;
  }
  const alreadySaved = recipe.savedBy.includes(userId);
  if (alreadySaved) {
    await Recipe.findByIdAndUpdate(recipeId, { $pull: { savedBy: userId }, $inc: { savedCount: -1 } });
    return { saved: false, savedCount: recipe.savedCount - 1 };
  } else {
    await Recipe.findByIdAndUpdate(recipeId, { $addToSet: { savedBy: userId }, $inc: { savedCount: 1 } });
    return { saved: true, savedCount: recipe.savedCount + 1 };
  }
};

const getSavedRecipes = async (userId) => {
  return Recipe.find({ savedBy: userId, isPublic: true })
    .sort("-createdAt").populate("author", "name avatar").select("-savedBy -__v");
};

// ═════════════════════════════════════════════
// FEATURED
// ═════════════════════════════════════════════
const getFeaturedRecipes = async (limit = 6) => {
  return Recipe.find({ isFeatured: true, status: "published", isPublic: true })
    .sort("-createdAt").limit(Number(limit))
    .populate("author", "name avatar").select("-savedBy -__v");
};

const toggleFeatured = async (recipeId) => {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    const error = new Error("Recipe not found");
    error.statusCode = 404;
    throw error;
  }
  recipe.isFeatured = !recipe.isFeatured;
  await recipe.save();
  return recipe;
};

const changeRecipeStatus = async (recipeId, authorId, status) => {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    const error = new Error("Recipe not found");
    error.statusCode = 404;
    throw error;
  }
  if (recipe.author.toString() !== authorId.toString()) {
    const error = new Error("Not authorized");
    error.statusCode = 403;
    throw error;
  }
  recipe.status = status;
  await recipe.save();
  return recipe;
};

module.exports = {
  createRecipe, getAllRecipes, getRecipeById, getRecipesByAuthor,
  updateRecipe, deleteRecipe, toggleSaveRecipe, getSavedRecipes,
  getFeaturedRecipes, toggleFeatured, changeRecipeStatus,
};