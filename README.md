ChefNest - Full Stack Recipe Sharing Platform

Assignment Title
Build a full-stack web application where professional chefs can register, share recipes, and connect with the culinary community.

Brief Description
ChefNest is a full-stack recipe sharing platform built with React (frontend) and Node.js + Express + MongoDB (backend).
Chefs can register, create and manage recipes, upload profile pictures and recipe images, browse other chefs, and interact through a clean dashboard.
Includes JWT authentication, file uploads with Multer, and an Admin panel for managing users and recipes.

Pages

* Landing Page - Home page with hero section and features
* Register - Chef registration form
* Login - Login page (redirects admin to Admin Panel)
* Dashboard - Chef dashboard with stats and recent recipes
* My Recipes - View, edit, delete and filter own recipes
* Create Recipe - 4-step recipe creation form
* Edit Recipe - Update existing recipe details
* Recipe Detail - Full recipe view with ingredients and steps
* Edit Profile - Update profile info and upload avatar
* View Profile - Read-only profile view with stats
* Chef Directory - Browse all registered chefs
* Chef Profile - Individual chef profile with their recipes
* Admin Panel - Manage all chefs and recipes (admin only)

Folder Structure

Frontend (src/components/)
* api.js
* authService.js
* LandingPage.jsx
* Register.jsx
* Login.jsx
* Dashboard.jsx
* MyRecipes.jsx
* CreateRecipe.jsx
* EditRecipe.jsx
* RecipeDetail.jsx
* EditProfile.jsx
* ViewProfile.jsx
* ChefDirectory.jsx
* ChefProfile.jsx
* AdminPanel.jsx
* App.jsx
* App.css

Backend (src/)
* server.js
* createAdmin.js
* config/ (config.js, db.js, multer.js)
* controllers/ (user.controller.js, recipes.controller.js)
* middlewares/ (auth.middleware.js)
* models/ (users.models.js, recipes.models.js)
* routes/ (user.routes.js, recipe.routes.js, comment.routes.js)
* services/ (users.services.js, recipes.services.js)

Uploads
* uploads/profile_pics/ (chef avatar images)
* uploads/recipe_images/ (recipe thumbnail images)

Tech Stack

Frontend: React 18, React Router v6, Axios, Vite, CSS
Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Multer

How to Run

1. cd backend
   npm install
   npm run dev

2. cd frontend
   npm install
   npm run dev

3. Create admin account:
   cd backend
   node createAdmin.js


Environment Variables (.env in backend folder)
PORT=3000
DB_URI=mongodb://localhost:27017/Recipe_Nest
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
NODE_ENV=development

Screenshots

1. Landing Page:! [Home](frontend/ScreenShots/Landingpage.png)
2. Register Page:! [Home](frontend/ScreenShots/RegisterPage.png)
3. Login Page:! [Home](frontend/ScreenShots/LoginPage.png)
4. Profile:! [Home](frontend/ScreenShots/ChefProfile.png)
5. Dashboard:! [Home](frontend/ScreenShots/ChefDashboard.png)
6. My Recipes: [Home](frontend/ScreenShots/ChefRecipes.png)
7. Chef Directory:! [Home](frontend/ScreenShots/ChefDirectory.png)
8. Admin Panel:! [Home](frontend/ScreenShots/AdminPanel.png)

Submitted by: Shulabh
Kathmandu
April 2026