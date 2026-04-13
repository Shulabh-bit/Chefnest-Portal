import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getImageUrl } from "./api";

export default function ViewProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, recipesRes] = await Promise.all([
        api.get("/users/profile"),
        api.get(`/recipes/my-recipes/${user._id}`),
      ]);
      setProfile(profileRes.data?.data?.user || profileRes.data?.data);
      setRecipes(recipesRes.data?.data?.recipes || recipesRes.data?.data || recipesRes.data?.recipes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="dash-loading">
      <div className="dash-spinner" />
      <p>Loading profile...</p>
    </div>
  );

  const skillsList = (profile?.skills || "Recipe Development, Food Styling, Menu Planning")
    .split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="dash-page">
      {/* Navbar */}
      <nav className="dash-nav">
        <div className="dash-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <span className="dash-brand-icon">🍳</span>
          <span className="dash-brand-name">ChefNest</span>
        </div>
        <div className="dash-nav-right">
          <span className="dash-navlink" onClick={() => navigate("/chefs")}>Chef Directory</span>
          <span className="dash-navlink" onClick={() => navigate("/dashboard")}>Dashboard</span>
          <span className="dash-navlink" onClick={() => navigate("/my-recipes")}>My Recipes</span>
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

        {/* Profile Hero Card */}
        <div className="dash-white-card vp-hero-card">
          <div className="vp-hero-left">
            {/* Avatar */}
            <div className="vp-avatar-wrap">
              {profile?.avatar ? (
                <img src={getImageUrl(profile.avatar)} alt="avatar" className="vp-avatar-img" />
              ) : (
                <div className="vp-avatar-placeholder">
                  {profile?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="vp-hero-info">
              <h1 className="vp-name">{profile?.name}</h1>
              <p className="vp-specialty">{profile?.specialty || "Italian Cuisine"}</p>
              <div className="vp-meta-row">
                <span className="vp-meta-item">✉ {profile?.email}</span>
                <span className="vp-meta-item">🕒 {profile?.experience || "10 years"} experience</span>
                <span className="vp-meta-item">⭐ 4.8 Rating</span>
                <span className="vp-meta-item">📍 {profile?.address || "Location not set"}</span>
              </div>
            </div>
          </div>

          {/* Edit button */}
          <button className="btn-dark" onClick={() => navigate("/profile")}>
            Edit Profile
          </button>
        </div>

        {/* Stats Row */}
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

        {/* Profile Details */}
        <div className="dash-white-card vp-details-card">
          <h2 className="dash-section-title">Profile Details</h2>

          {/* About */}
          <div className="vp-section">
            <h3 className="vp-section-label">About Me</h3>
            <p className="vp-section-text">
              {profile?.aboutMe || `Passionate chef with ${profile?.experience || "10 years"} of experience in ${profile?.specialty || "culinary arts"}.`}
            </p>
          </div>

          {/* Specialty & Experience */}
          <div className="vp-two-col">
            <div className="vp-section">
              <h3 className="vp-section-label">Specialty</h3>
              <p className="vp-section-text">{profile?.specialty || "Italian Cuisine"}</p>
            </div>
            <div className="vp-section">
              <h3 className="vp-section-label">Experience</h3>
              <p className="vp-section-text">{profile?.experience || "10 years"}</p>
            </div>
          </div>

          {/* Skills */}
          <div className="vp-section">
            <h3 className="vp-section-label">Skills & Expertise</h3>
            <div className="vp-skills">
              {skillsList.map((skill, i) => (
                <span key={i} className="profile-skill-tag">{skill}</span>
              ))}
            </div>
          </div>

          {/* Member since */}
          <div className="vp-section">
            <h3 className="vp-section-label">Member Since</h3>
            <p className="vp-section-text">
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
                : "2024"}
            </p>
          </div>
        </div>

        {/* My Recipes */}
        <div className="dash-white-card">
          <div className="dash-recipes-header">
            <h2 className="dash-section-title">My Recipes ({recipes.length})</h2>
            {recipes.length > 0 && (
              <span className="dash-view-all" onClick={() => navigate("/my-recipes")}>
                Manage All →
              </span>
            )}
          </div>

          {recipes.length === 0 ? (
            <div className="dash-no-recipes">
              <div className="dash-no-recipes-icon">🍽️</div>
              <h3>No recipes yet</h3>
              <p>Start sharing your culinary creations!</p>
              <button className="btn-dark" onClick={() => navigate("/recipes/create")}>
                + Create First Recipe
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
                      <img src={recipe.thumbnail} alt={recipe.title} />
                    ) : (
                      <div className="dash-recipe-placeholder">🍽️</div>
                    )}
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