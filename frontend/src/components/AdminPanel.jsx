import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getImageUrl } from "./api";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [chefs, setChefs] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chefs");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    if (user?.role !== "admin") { navigate("/dashboard"); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [usersRes, recipesRes] = await Promise.all([
        api.get("/users"),
        api.get("/recipes?limit=100"),
      ]);
      const userList = usersRes.data?.data?.users || usersRes.data?.data || [];
      setChefs(Array.isArray(userList) ? userList : []);
      const recipeList =
        recipesRes.data?.recipes ||
        recipesRes.data?.data?.recipes ||
        (Array.isArray(recipesRes.data?.data) ? recipesRes.data.data : []);
      setRecipes(recipeList || []);
    } catch (err) {
      setError("Failed to load data. Make sure you are logged in as admin.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChef = async (id, name) => {
    if (!window.confirm(`Permanently delete chef "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${id}`);
      setChefs((prev) => prev.filter((c) => c._id !== id));
      setSuccess(`Chef "${name}" deleted successfully.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete chef.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDeleteRecipe = async (id, title) => {
    if (!window.confirm(`Delete recipe "${title}"?`)) return;
    try {
      await api.delete(`/recipes/${id}`);
      setRecipes((prev) => prev.filter((r) => r._id !== id));
      setSuccess(`Recipe "${title}" deleted successfully.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete recipe.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const filteredChefs = chefs.filter((c) =>
    c.role !== "admin" &&
    (c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredRecipes = recipes.filter((r) =>
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="dash-loading">
      <div className="dash-spinner" />
      <p>Loading admin panel...</p>
    </div>
  );

  return (
    <div className="dash-page">
      {/* Navbar */}
      <nav className="dash-nav">
        <div className="dash-brand" onClick={() => navigate("/")}>
          <span className="dash-brand-icon">🍳</span>
          <span className="dash-brand-name">ChefNest</span>
        </div>
        <div className="dash-nav-right">
          <span className="dash-navlink" onClick={() => navigate("/dashboard")}>Dashboard</span>
          <span className="dash-navlink active-link">Admin Panel</span>
          <span className="dash-user-badge">
            <span className="dash-user-icon">👑</span>
            {user?.name}
          </span>
          <button className="dash-logout-btn" onClick={() => { localStorage.clear(); navigate("/login"); }}>
            ↪ Logout
          </button>
        </div>
      </nav>

      <div className="dash-body">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1 className="dash-welcome-title">👑 Admin Panel</h1>
            <p className="dash-welcome-sub">Manage chefs and recipes across the platform</p>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        {/* Stats */}
        <div className="dash-stats">
          <div className="dash-stat-card">
            <div className="dash-stat-text">
              <span className="dash-stat-label">Total Chefs</span>
              <span className="dash-stat-num">{chefs.filter(c => c.role !== "admin").length}</span>
            </div>
            <div className="dash-stat-ico blue-ico">👨‍🍳</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-text">
              <span className="dash-stat-label">Total Recipes</span>
              <span className="dash-stat-num">{recipes.length}</span>
            </div>
            <div className="dash-stat-ico orange-ico">📖</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-text">
              <span className="dash-stat-label">Active Chefs</span>
              <span className="dash-stat-num">{chefs.filter(c => c.isActive !== false && c.role !== "admin").length}</span>
            </div>
            <div className="dash-stat-ico green-ico">✅</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-text">
              <span className="dash-stat-label">Published</span>
              <span className="dash-stat-num">{recipes.filter(r => r.status === "published").length}</span>
            </div>
            <div className="dash-stat-ico yellow-ico">🌍</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === "chefs" ? "admin-tab-active" : ""}`}
            onClick={() => { setActiveTab("chefs"); setSearch(""); }}
          >
            👨‍🍳 Chefs ({chefs.filter(c => c.role !== "admin").length})
          </button>
          <button
            className={`admin-tab ${activeTab === "recipes" ? "admin-tab-active" : ""}`}
            onClick={() => { setActiveTab("recipes"); setSearch(""); }}
          >
            📖 Recipes ({recipes.length})
          </button>
        </div>

        {/* Search */}
        <div className="cd-search-wrap">
          <span className="cd-search-icon">🔍</span>
          <input
            className="cd-search-input"
            type="text"
            placeholder={activeTab === "chefs" ? "Search chefs by name or email..." : "Search recipes by title or category..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Chefs Table */}
        {activeTab === "chefs" && (
          <div className="dash-white-card admin-table-card">
            <h2 className="dash-section-title">All Chefs</h2>
            {filteredChefs.length === 0 ? (
              <div className="dash-no-recipes">
                <div className="dash-no-recipes-icon">👨‍🍳</div>
                <p>No chefs found</p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Chef</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredChefs.map((chef) => (
                      <tr key={chef._id}>
                        <td>
                          <div className="admin-chef-cell">
                            {chef.avatar ? (
                              <img src={getImageUrl(chef.avatar)} alt={chef.name} className="admin-avatar" />
                            ) : (
                              <div className="admin-avatar-placeholder">
                                {chef.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="admin-chef-name">{chef.name}</span>
                          </div>
                        </td>
                        <td className="admin-td-muted">{chef.email}</td>
                        <td>
                          <span className={`admin-role-badge ${chef.role === "admin" ? "role-admin" : "role-user"}`}>
                            {chef.role}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-status-badge ${chef.isActive !== false ? "status-active" : "status-inactive"}`}>
                            {chef.isActive !== false ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="admin-td-muted">
                          {chef.createdAt ? new Date(chef.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td>
                          <div className="admin-action-btns">
                            <button
                              className="admin-btn-view"
                              onClick={() => navigate(`/chefs/${chef._id}`)}
                            >
                              View
                            </button>
                            {chef.role !== "admin" && (
                              <button
                                className="admin-btn-delete"
                                onClick={() => handleDeleteChef(chef._id, chef.name)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Recipes Table */}
        {activeTab === "recipes" && (
          <div className="dash-white-card admin-table-card">
            <h2 className="dash-section-title">All Recipes</h2>
            {filteredRecipes.length === 0 ? (
              <div className="dash-no-recipes">
                <div className="dash-no-recipes-icon">🍽️</div>
                <p>No recipes found</p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Recipe</th>
                      <th>Category</th>
                      <th>Author</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecipes.map((recipe) => (
                      <tr key={recipe._id}>
                        <td>
                          <div className="admin-chef-cell">
                            {recipe.thumbnail ? (
                              <img src={getImageUrl(recipe.thumbnail)} alt={recipe.title} className="admin-recipe-thumb" />
                            ) : (
                              <div className="admin-recipe-thumb-placeholder">🍽️</div>
                            )}
                            <span className="admin-chef-name">{recipe.title}</span>
                          </div>
                        </td>
                        <td className="admin-td-muted" style={{ textTransform: "capitalize" }}>{recipe.category}</td>
                        <td className="admin-td-muted">{recipe.author?.name || "—"}</td>
                        <td>
                          <span className={`recipe-status-badge status-${recipe.status}`} style={{ position: "static" }}>
                            {recipe.status}
                          </span>
                        </td>
                        <td className="admin-td-muted">
                          {recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td>
                          <div className="admin-action-btns">
                            <button
                              className="admin-btn-view"
                              onClick={() => navigate(`/recipes/${recipe._id}`)}
                            >
                              View
                            </button>
                            <button
                              className="admin-btn-delete"
                              onClick={() => handleDeleteRecipe(recipe._id, recipe.title)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}