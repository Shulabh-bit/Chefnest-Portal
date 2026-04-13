import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getImageUrl } from "./api";

export default function ChefDirectory() {
  const navigate = useNavigate();
  const [chefs, setChefs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    fetchChefs();
  }, []);

  const fetchChefs = async () => {
    try {
      // Fetch all published recipes and extract unique authors
      const res = await api.get("/recipes?limit=100");
      const recipes = res.data?.recipes || res.data?.data?.recipes || [];

      // Build chef map from recipe authors
      const chefMap = {};
      recipes.forEach((recipe) => {
        if (recipe.author && recipe.author._id) {
          const a = recipe.author;
          if (!chefMap[a._id]) {
            chefMap[a._id] = {
              _id: a._id,
              name: a.name || "Chef",
              avatar: a.avatar || null,
              specialty: a.specialty || "Culinary Arts",
              rating: 4.5,
              recipes: 0,
              bio: a.bio || `Passionate chef sharing amazing recipes on ChefNest.`,
              address: a.address || "",
            };
          }
          chefMap[a._id].recipes += 1;
        }
      });

      const chefList = Object.values(chefMap);

      // If no chefs found from recipes, try fetching users directly
      if (chefList.length === 0) {
        try {
          const usersRes = await api.get("/users?limit=20");
          const users = usersRes.data?.data?.users || usersRes.data?.data || [];
          if (Array.isArray(users) && users.length > 0) {
            setChefs(users.map(u => ({ ...u, recipes: 0 })));
            return;
          }
        } catch (_) {}
      }

      setChefs(chefList);
    } catch (err) {
      console.error("Failed to fetch chefs:", err.message);
      setChefs([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = chefs.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.specialty?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="dash-page">
      {/* Navbar */}
      <nav className="dash-nav">
        <div className="dash-brand" onClick={() => navigate("/")}>
          <span className="dash-brand-icon">🍳</span>
          <span className="dash-brand-name">ChefNest</span>
        </div>
        <div className="dash-nav-right">
          <span className="dash-navlink active-link">Chef Directory</span>
          {isLoggedIn ? (
            <>
              <span className="dash-navlink" onClick={() => navigate("/dashboard")}>Dashboard</span>
              <span className="dash-navlink" onClick={() => navigate("/my-recipes")}>My Recipes</span>
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
        <div className="cd-header">
          <div>
            <h1 className="cd-title">Chef Directory</h1>
            <p className="cd-subtitle">Discover talented chefs and their amazing recipes</p>
          </div>
        </div>

        {/* Search */}
        <div className="cd-search-wrap">
          <span className="cd-search-icon">🔍</span>
          <input
            className="cd-search-input"
            type="text"
            placeholder="Search by name, specialty, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && (
          <div className="dash-loading-inline">
            <div className="dash-spinner" /> Loading chefs...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="myrecipes-empty">
            <div className="empty-icon">👨‍🍳</div>
            <h3>No chefs found</h3>
            <p>
              {search ? "Try a different search term" : "No chefs have published recipes yet. Be the first!"}
            </p>
            {!isLoggedIn && (
              <button className="btn-dark" onClick={() => navigate("/register")}>
                Join as a Chef
              </button>
            )}
          </div>
        )}

        <div className="cd-grid">
          {filtered.map((chef) => (
            <div key={chef._id} className="cd-card">
              {/* Avatar */}
              <div className="cd-avatar-wrap">
                {chef.avatar ? (
                  <img
                    src={getImageUrl(chef.avatar)}
                    alt={chef.name}
                    className="cd-avatar-img"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="cd-avatar-placeholder"
                  style={{ display: chef.avatar ? "none" : "flex" }}
                >
                  {chef.name?.charAt(0).toUpperCase()}
                </div>
              </div>

              <h3 className="cd-chef-name">{chef.name}</h3>
              <p className="cd-chef-specialty">{chef.specialty || "Chef"}</p>

              <div className="cd-rating">
                <span className="cd-stars">★★★★★</span>
                <span className="cd-rating-num">{chef.rating || "4.5"} rating</span>
              </div>

              <p className="cd-bio">
                {(chef.bio || `Passionate chef sharing amazing recipes on ChefNest.`).slice(0, 80)}...
              </p>

              <div className="cd-meta">
                {chef.address && (
                  <span className="cd-meta-item">📍 {chef.address.slice(0, 20)}</span>
                )}
                <span className="cd-meta-item">📖 {chef.recipes || 0} recipes</span>
              </div>

              <button className="cd-view-btn" onClick={() => navigate(`/chefs/${chef._id}`)}>
                View Profile
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}