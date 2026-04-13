const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define upload directories
const UPLOAD_DIRS = {
    profilePics: path.join(__dirname, "../../uploads/profile_pics"),
    postImages: path.join(__dirname, "../../uploads/recipe_images"),
};

// Create upload directories if they don't exist
Object.values(UPLOAD_DIRS).forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Storage configuration
const createStorage = (uploadDir) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const originalName = path.parse(file.originalname).name;
      const cleanName = originalName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "");
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extension = path.extname(file.originalname);
      const finalName = `${cleanName}-${uniqueSuffix}${extension}`;
      cb(null, finalName);
    },
  });
};

// File filter - images only
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    const error = new Error("Only image files (jpg, png, gif, webp) are allowed");
    error.code = "LIMIT_FILE_TYPE";
    cb(error, false);
  }
};

// Multer instances
const profilePicUpload = multer({
  storage: createStorage(UPLOAD_DIRS.profilePics),
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

const postImageUpload = multer({
  storage: createStorage(UPLOAD_DIRS.postImages),
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

const recipeImagesUpload = multer({
  storage: createStorage(UPLOAD_DIRS.postImages),
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 11 },
});

// ✅ FIXED: folder names now match actual directory names
const getFileUrl = (filename, type) => {
  if (!filename) return null;
  const folder = type === "profilePic" ? "profile_pics" : "recipe_images";
  return `uploads/${folder}/${filename}`;
};

// Delete old file
const deleteOldFile = (filename, type) => {
  if (!filename) return;
  const dir = type === "profilePic" ? UPLOAD_DIRS.profilePics : UPLOAD_DIRS.postImages;
  const filePath = path.join(dir, filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    } catch (err) {
      console.error(`Error deleting file: ${err.message}`);
    }
  }
};

module.exports = {
  profilePicUpload,
  postImageUpload,
  recipeImagesUpload,
  deleteOldFile,
  getFileUrl,
  UPLOAD_DIRS,
};