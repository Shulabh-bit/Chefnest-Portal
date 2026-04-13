const express = require("express");
const router = express.Router();

// import middlewares
const { protect, adminOnly } = require("../middlewares/auth.middleware");

// import controllers
const userController = require("../controllers/user.controller");

const { profilePicUpload } = require("../config/multer");


// public routes

// register a new user
router.post("/register", userController.register);

// login user
router.post("/login", userController.login);

// protected routes

// get the current user's profile
router.get("/profile", protect, userController.getProfile);

// update the current user's profile
router.put("/profile", protect, userController.updateProfile);

// logout user
router.post("/logout", protect, userController.logout);

// api/users/avatar
router.patch("/avatar",protect, profilePicUpload.single("avatar"), userController.updateAvatar);

// delete avatar
router.delete("/avatar", protect, userController.deleteAvatar);

// admin routes
router.get("/", protect, adminOnly, userController.getAllUsers);

// get user by id
router.get("/:id", protect, adminOnly, userController.getUserById);

// delete user by id
router.delete("/:id", protect, adminOnly, userController.deactivateUser);


module.exports = router;
