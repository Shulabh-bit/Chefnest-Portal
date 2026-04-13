import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "./authService";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    specialty: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.fullName.trim()) return setError("Full name is required.");
    if (!form.email.trim()) return setError("Email is required.");
    if (!form.password || form.password.length < 6)
      return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      const result = await registerUser({
        name: form.fullName,
        email: form.email,
        password: form.password,
      });

      if (result.data?.token) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
      }

      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <nav className="navbar">
        <div className="navbar-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <span className="brand-icon">🍳</span>
          <span className="brand-name">ChefNest</span>
        </div>
        <div className="navbar-links">
          <a href="#" className="nav-link">Chef Directory</a>
          <button className="btn-outline" onClick={() => navigate("/login")}>Login</button>
          <button className="btn-dark" onClick={() => navigate("/register")}>Register</button>
        </div>
      </nav>

      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-icon">🍳</div>
          <h2 className="auth-title">Join ChefNest</h2>
          <p className="auth-subtitle">Create your chef profile and start sharing recipes</p>

          {error && <div className="error-box">{error}</div>}

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="John Doe"
              value={form.fullName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="chef@example.com"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Specialty</label>
            <input
              type="text"
              name="specialty"
              placeholder="e.g., Italian Cuisine, Pastry, etc."
              value={form.specialty}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button className="btn-dark btn-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="auth-redirect">
            Already have an account?{" "}
            <span className="link-orange" onClick={() => navigate("/login")}>Login here</span>
          </p>
        </div>
      </div>
    </div>
  );
}