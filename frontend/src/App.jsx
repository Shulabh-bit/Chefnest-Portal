import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LandingPage from "./components/LandingPage";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import MyRecipes from "./components/MyRecipes";
import EditProfile from "./components/EditProfile";
import ViewProfile from "./components/ViewProfile";
import RecipeDetail from "./components/RecipeDetail";
import CreateRecipe from "./components/CreateRecipe";
import EditRecipe from "./components/EditRecipe";
import ChefDirectory from "./components/ChefDirectory";
import ChefProfile from "./components/ChefProfile";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-recipes" element={<MyRecipes />} />
        <Route path="/profile" element={<EditProfile />} />
        <Route path="/view-profile" element={<ViewProfile />} />
        <Route path="/chefs" element={<ChefDirectory />} />
        <Route path="/chefs/:id" element={<ChefProfile />} />
        <Route path="/recipes/create" element={<CreateRecipe />} />
        <Route path="/recipes/edit/:id" element={<EditRecipe />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}