import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { getImageUrl } from "./api";

export default function ChefProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chef, setChef] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchChefData();
  }, [id]);

  const fetchChefData = async () => {
    try {
      // Fetch chef's published recipes (public route)
      const recipesRes = await api.get(`/recipes/user/${id}`);
      const recipeList =
        recipesRes.data?.recipes ||
        recipesRes.data?.data?.recipes ||
        (Array.isArray(recipesRes.data?.data) ? recipesRes.data.data : []);
      setRecipes(recipeList);

      // Get chef info from first recipe's populated author field
      if (recipeList.length > 0 && recipeList[0].author) {
        const author = recipeList[0].author;
        setChef({
          _id: author._id || id,
          name: author.name,
          avatar: author.avatar || null,
          specialty: author.specialty || "Culinary Arts",
          bio: author.bio || `Passionate chef sharing amazing recipes on ChefNest.`,
          address: author.address || "",
          email: author.email || "",
          skills: author.skills || author.specialty || "Culinary Arts",
          rating: 4.5,
        });
      } else {
        // No recipes yet — try fetching user directly if logged in
        try {
          const userRes = await api.get(`/users/${id}`);
          const chefData = userRes.data?.data?.user || userRes.data?.data;
          if (chefData) { setChef(chefData); return; }
        } catch (_) {}
        // Final fallback
        setChef({ _id: id, name: "Chef", specialty: "Culinary Arts", rating: 4.5 });
      }
    } catch (err) {
      console.error(err);
      setChef({ _id: id, name: "Chef", specialty: "Culinary Arts", rating: 4.5 });
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const skillsList = (chef?.skills || chef?.specialty || "Culinary Arts")
    .split(",").map((s) => s.trim()).filter(Boolean);

  if (loading) return (
    <div className="dash-loading">
      <div className="dash-spinner" />
      <p>Loading chef profile...</p>
    </div>
  );

  return (
    <div className="dash-page">
      <nav className="dash-nav">
        <div className="dash-brand" onClick={() => navigate("/")}>
          <span className="dash-brand-icon">🍳</span>
          <span className="dash-brand-name">ChefNest</span>
        </div>
        <div className="dash-nav-right">
          <span className="dash-navlink" onClick={() => navigate("/chefs")}>Chef Directory</span>
          {isLoggedIn ? (
            <>
              <span className="dash-navlink" onClick={() => navigate("/dashboard")}>Dashboard</span>
              <span className="dash-user-badge">
                <span className="dash-user-icon">👤</span>{user?.name}
              </span>
              <button className="dash-logout-btn" onClick={() => { localStorage.clear(); navigate("/login"); }}>
                ↪ Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn-outline" onClick={() => navigate("/login")}>Login</button>
              <button className="btn-dark" onClick={() => navigate("/register")}>Register</button>
            </>
          )}
        </div>
      </nav>

      <div className="dash-body">
        <button className="back-btn" onClick={() => navigate("/chefs")}>← Back to Directory</button>

        {/* Profile Card */}
        <div className="dash-white-card vp-hero-card">
          <div className="vp-hero-left">
            <div className="vp-avatar-wrap">
              {chef?.avatar ? (
                <img
                  src={getImageUrl(chef.avatar)}
                  alt={chef.name}
                  className="vp-avatar-img"
                  onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                />
              ) : null}
              <div className="vp-avatar-placeholder" style={{ display: chef?.avatar ? "none" : "flex" }}>
                {chef?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="vp-hero-info">
              <h1 className="vp-name">{chef?.name}</h1>
              <p className="vp-specialty">{chef?.specialty || "Chef"}</p>
              <div className="vp-meta-row">
                <span className="vp-meta-item">⭐ {chef?.rating || "4.5"} Rating</span>
                <span className="vp-meta-item">📖 {recipes.length} recipes</span>
                {chef?.address && <span className="vp-meta-item">📍 {chef.address}</span>}
              </div>
            </div>
          </div>
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
              <span className="dash-stat-label">Specialty</span>
              <span className="dash-stat-num" style={{ fontSize: "14px" }}>{chef?.specialty || "Chef"}</span>
            </div>
            <div className="dash-stat-ico green-ico">👨‍🍳</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-text">
              <span className="dash-stat-label">Rating</span>
              <span className="dash-stat-num">{chef?.rating || "4.5"}</span>
            </div>
            <div className="dash-stat-ico yellow-ico">⭐</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-text">
              <span className="dash-stat-label">Location</span>
              <span className="dash-stat-num" style={{ fontSize: "13px" }}>{chef?.address || "Global"}</span>
            </div>
            <div className="dash-stat-ico blue-ico">📍</div>
          </div>
        </div>

        {/* About */}
        <div className="dash-white-card vp-details-card">
          <h2 className="dash-section-title">About</h2>
          <div className="vp-section">
            <h3 className="vp-section-label">Bio</h3>
            <p className="vp-section-text">
              {chef?.bio || `Passionate chef specializing in ${chef?.specialty || "culinary arts"}.`}
            </p>
          </div>
          <div className="vp-section">
            <h3 className="vp-section-label">Skills & Expertise</h3>
            <div className="vp-skills">
              {skillsList.map((skill, i) => (
                <span key={i} className="profile-skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Recipes */}
        <div className="dash-white-card">
          <div className="dash-recipes-header">
            <h2 className="dash-section-title">
              Recipes by {chef?.name} ({recipes.length})
            </h2>
          </div>

          {recipes.length === 0 ? (
            <div className="dash-no-recipes">
              <div className="dash-no-recipes-icon">🍽️</div>
              <h3>No published recipes yet</h3>
              <p>This chef hasn't published any recipes yet.</p>
            </div>
          ) : (
            <div className="dash-recipes-grid">
              {recipes.map((recipe) => (
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
                    <p>{recipe.description?.slice(0, 60)}{recipe.description?.length > 60 ? "..." : ""}</p>
                    <div className="myrecipe-meta" style={{ marginTop: "6px" }}>
                      <span>🕒 {recipe.cookTime} min</span>
                      <span>👥 {recipe.servings} servings</span>
                    </div>
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