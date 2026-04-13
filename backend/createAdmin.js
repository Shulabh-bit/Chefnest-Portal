require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/users.models");

const DB_URI = process.env.DB_URI || "mongodb://localhost:27017/Recipe_Nest";

async function createAdmin() {
  try {
    await mongoose.connect(DB_URI);
    console.log("Connected to MongoDB:", DB_URI);

    // Delete existing admin if any
    await User.deleteOne({ email: "admin@chefnest.com" });

    // Create using Mongoose model so pre-save hook hashes password
    const admin = new User({
      name: "Admin",
      email: "admin@chefnest.com",
      password: "Admin@123",
      role: "admin",
      isActive: true,
    });

    await admin.save();
    console.log("✅ Admin created successfully!");
    console.log("📧 Email: admin@chefnest.com");
    console.log("🔑 Password: Admin@123");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createAdmin();