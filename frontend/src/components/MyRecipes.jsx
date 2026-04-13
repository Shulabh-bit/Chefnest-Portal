import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getImageUrl } from "./api";

export default function MyRecipes() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) { navigate("/login"); return; }
    fetchRecipes(JSON.parse(user)._id);
  }, []);

  const fetchRecipes = async (userId) => {
    try {
      const res = await api.get(`/recipes/my-recipes/${userId}`);
      const data = res.data;
      const list =
        data?.recipes ||
        data?.data?.recipes ||
        (Array.isArray(data?.data) ? data.data : null) ||
        (Array.isArray(data) ? data : []);
      setRecipes(list);
    } catch (err) {
      setError("Failed to load recipes.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this recipe?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/recipes/${id}`);
      setRecipes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert("Failed to delete recipe.");
    } finally {
      setDeletingId(null);
    }
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Get unique categories from recipes
  const categories = ["All", ...new Set(recipes.map((r) => r.category).filter(Boolean))];

  // Filter recipes by search and category
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.title?.toLowerCase().includes(search.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || recipe.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="dash-page">
      <nav className="dash-nav">
        <div className="dash-brand" onClick={() => navigate("/")}>
          <span className="dash-brand-icon">🍳</span>
          <span className="dash-brand-name">ChefNest</span>
        </div>
        <div className="dash-nav-right">
          <span className="dash-navlink" onClick={() => navigate("/chefs")}>Chef Directory</span>
          <span className="dash-navlink" onClick={() => navigate("/dashboard")}>Dashboard</span>
          <span className="dash-navlink active-link">My Recipes</span>
          <span className="dash-user-badge">
            <span className="dash-user-icon">👤</span>
            {user?.name}
          </span>
          <button className="dash-logout-btn" onClick={() => { localStorage.clear(); navigate("/login"); }}>
            ↪ Logout
          </button>
        </div>
      </nav>

      <div className="dash-body">
        <div className="myrecipes-header">
          <div>
            <h1 className="dash-welcome-title">My Recipes</h1>
            <p className="dash-welcome-sub">Manage and organize your recipe collection</p>
          </div>
          <button className="btn-dark" onClick={() => navigate("/recipes/create")}>
            + Add New Recipe
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="myrecipes-filter-bar">
          <input
            type="text"
            className="myrecipes-search"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="myrecipes-categories">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-btn ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading && <div className="dash-loading-inline"><div className="dash-spinner" /> Loading recipes...</div>}
        {error && <div className="error-box">{error}</div>}

        {!loading && filteredRecipes.length === 0 && (
          <div className="myrecipes-empty">
            <div className="empty-icon">🍽️</div>
            <h3>{recipes.length === 0 ? "No recipes yet" : "No recipes match your search"}</h3>
            <p>{recipes.length === 0 ? "Start sharing your culinary creations!" : "Try a different search or category"}</p>
            {recipes.length === 0 && (
              <button className="btn-dark" onClick={() => navigate("/recipes/create")}>
                + Create Your First Recipe
              </button>
            )}
          </div>
        )}

        <div className="myrecipes-grid">
          {filteredRecipes.map((recipe) => (
            <div key={recipe._id} className="myrecipe-card">
              <div className="myrecipe-img" onClick={() => navigate(`/recipes/${recipe._id}`)}>
                {recipe.thumbnail ? (
                  <img src={getImageUrl(recipe.thumbnail)} alt={recipe.title} />
                ) : (
                  <div className="myrecipe-img-placeholder">🍽️</div>
                )}
                <span className={`recipe-status-badge status-${recipe.status}`}>
                  {recipe.status}
                </span>
              </div>
              <div className="myrecipe-body">
                <h3 onClick={() => navigate(`/recipes/${recipe._id}`)}>{recipe.title}</h3>
                <p>{recipe.description?.slice(0, 80)}{recipe.description?.length > 80 ? "..." : ""}</p>
                <div className="myrecipe-meta">
                  <span>🕒 {recipe.cookTime} min</span>
                  <span>👥 {recipe.servings} servings</span>
                  <span>📂 {recipe.category}</span>
                </div>
                <div className="myrecipe-actions">
                  <button className="btn-view" onClick={() => navigate(`/recipes/${recipe._id}`)}>
                    View
                  </button>
                  <button className="btn-edit" onClick={() => navigate(`/recipes/edit/${recipe._id}`)}>
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(recipe._id)}
                    disabled={deletingId === recipe._id}
                  >
                    {deletingId === recipe._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}