import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getImageUrl } from "./api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !storedUser) { navigate("/login"); return; }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchFreshProfile();
    fetchMyRecipes(parsedUser._id);
  }, []);

  const fetchFreshProfile = async () => {
    try {
      const res = await api.get("/users/profile");
      const freshUser = res.data?.data?.user || res.data?.data;
      if (freshUser) {
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
      }
    } catch (err) {
      console.error("Could not refresh profile:", err.message);
    }
  };

  const fetchMyRecipes = async (userId) => {
    try {
      const res = await api.get(`/recipes/my-recipes/${userId}`);
      const data = res.data;
      const list =
        data?.recipes ||
        data?.data?.recipes ||
        (Array.isArray(data?.data) ? data.data : null) ||
        (Array.isArray(data) ? data : []);
      setRecipes(list || []);
    } catch (err) {
      console.error("Failed to fetch recipes:", err.message);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) return (
    <div className="dash-loading">
      <div className="dash-spinner" />
      <p>Loading dashboard...</p>
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
          <span className="dash-navlink" onClick={() => navigate("/chefs")}>Chef Directory</span>
          <span className="dash-navlink active-link">Dashboard</span>
          <span className="dash-navlink" onClick={() => navigate("/my-recipes")}>My Recipes</span>
          {user?.role === "admin" && (
            <span className="dash-navlink" onClick={() => navigate("/admin")} style={{ color: "#e07b2a", fontWeight: 700 }}>
              👑 Admin
            </span>
          )}
          <span className="dash-user-badge">
            <span className="dash-user-icon">👤</span>
            {user?.name}
          </span>
          <button className="dash-logout-btn" onClick={handleLogout}>↪ Logout</button>
        </div>
      </nav>

      <div className="dash-body">
        {/* Welcome */}
        <div className="dash-welcome">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Manage your recipes and profile from your dashboard</p>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          <div className="dash-stat-card">
            <div className="dash-stat-text">
              <span className="dash-stat-label">Total Recipes</span>
              <span className="dash-stat-num">{recipes.length}</span>
            </div>
            <div className="dash-stat-ico orange-ico">📖</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-text">
              <span className="dash-stat-label">Profile Views</span>
              <span className="dash-stat-num">1,234</span>
            </div>
            <div className="dash-stat-ico blue-ico">👤</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-text">
              <span className="dash-stat-label">Followers</span>
              <span className="dash-stat-num">567</span>
            </div>
            <div className="dash-stat-ico green-ico">👥</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-text">
              <span className="dash-stat-label">Rating</span>
              <span className="dash-stat-num">4.8</span>
            </div>
            <div className="dash-stat-ico yellow-ico">🏆</div>
          </div>
        </div>

        {/* Middle */}
        <div className="dash-mid-row">
          {/* Quick Actions */}
          <div className="dash-white-card">
            <h2 className="dash-section-title">Quick Actions</h2>
            <div className="dash-actions">
              <div className="dash-action-item dash-action-active" onClick={() => navigate("/my-recipes")}>
                <span>📖</span> Manage My Recipes
              </div>
              <div className="dash-action-item" onClick={() => navigate("/profile")}>
                <span>👤</span> Edit Profile
              </div>
              <div className="dash-action-item" onClick={() => navigate("/chefs")}>
                <span>👥</span> Browse Chefs
              </div>
              {user?.role === "admin" && (
                <div className="dash-action-item" onClick={() => navigate("/admin")} style={{ borderColor: "#e07b2a", color: "#e07b2a" }}>
                  <span>👑</span> Admin Panel
                </div>
              )}
            </div>
          </div>

          {/* Profile Summary */}
          <div className="dash-white-card">
            <h2 className="dash-section-title">Profile Summary</h2>
            <div className="dash-profile-row">
              <div className="dash-profile-avatar">
                {user?.avatar ? (
                  <img
                    src={getImageUrl(user.avatar)}
                    alt="avatar"
                    style={{ width: "58px", height: "58px", borderRadius: "50%", objectFit: "cover" }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div className="dash-avatar-circle">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="dash-profile-details">
                <h3>{user?.name}</h3>
                <p className="dash-specialty">{user?.specialty || "Chef"}</p>
                <p className="dash-experience">
                  {user?.createdAt
                    ? `${new Date().getFullYear() - new Date(user.createdAt).getFullYear()} years experience`
                    : "0 years experience"}
                </p>
              </div>
            </div>
            <span className="dash-profile-link" onClick={() => navigate("/view-profile")}>
              View Full Profile →
            </span>
          </div>
        </div>

        {/* Recent Recipes */}
        <div className="dash-white-card">
          <div className="dash-recipes-header">
            <h2 className="dash-section-title">Recent Recipes</h2>
            {recipes.length > 0 && (
              <span className="dash-view-all" onClick={() => navigate("/my-recipes")}>View All →</span>
            )}
          </div>

          {recipes.length === 0 ? (
            <div className="dash-no-recipes">
              <div className="dash-no-recipes-icon">🍽️</div>
              <h3>No recipes yet</h3>
              <p>Start sharing your culinary creations with the world!</p>
              <button className="btn-dark" onClick={() => navigate("/recipes/create")}>
                + Create Your First Recipe
              </button>
            </div>
          ) : (
            <div className="dash-recipes-grid">
              {recipes.slice(0, 3).map((recipe) => (
                <div
                  key={recipe._id}
                  className="dash-recipe-card"
                  onClick={() => navigate(`/recipes/${recipe._id}`)}
                >
                  <div className="dash-recipe-img">
                    {recipe.thumbnail ? (
                      <img
                        src={getImageUrl(recipe.thumbnail)}
                        alt={recipe.title}
                        onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                      />
                    ) : null}
                    <div className="dash-recipe-placeholder" style={{ display: recipe.thumbnail ? "none" : "flex" }}>🍽️</div>
                  </div>
                  <div className="dash-recipe-info">
                    <h4>{recipe.title}</h4>
                    <p>{recipe.description?.slice(0, 55)}{recipe.description?.length > 55 ? "..." : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}