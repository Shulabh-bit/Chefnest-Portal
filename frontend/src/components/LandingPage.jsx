import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand" onClick={() => navigate("/")}>
          <span className="brand-icon">🍳</span>
          <span className="brand-name">ChefNest</span>
        </div>
        <div className="navbar-links">
          <a className="nav-link" onClick={() => navigate("/chefs")} style={{ cursor: "pointer" }}>Chef Directory</a>
          <button className="btn-outline" onClick={() => navigate("/login")}>Login</button>
          <button className="btn-dark" onClick={() => navigate("/register")}>Register</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-icon">🍳</div>
        <h1 className="hero-title">Welcome to ChefNest</h1>
        <p className="hero-subtitle">
          Connect with professional chefs, discover amazing recipes, and share your<br />
          culinary expertise with the world.
        </p>
        <div className="hero-buttons">
          <button className="btn-dark" onClick={() => navigate("/register")}>Join as a Chef</button>
          <button className="btn-outline" onClick={() => navigate("/chefs")}>Explore Chefs</button>
        </div>
      </section>

      {/* Why Join */}
      <section className="why-section">
        <h2 className="why-title">Why Join ChefNest?</h2>
        <div className="cards-grid">
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Connect with Chefs</h3>
            <p>Network with professional chefs from around the world and learn from the best.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📖</div>
            <h3>Share Recipes</h3>
            <p>Create and manage your recipe portfolio to showcase your culinary skills.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Build Your Brand</h3>
            <p>Establish your reputation and grow your following in the culinary community.</p>
          </div>
        </div>
      </section>
    </div>
  );
}