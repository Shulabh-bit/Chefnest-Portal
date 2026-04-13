import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "./authService";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim()) return setError("Email is required.");
    if (!form.password) return setError("Password is required.");

    setLoading(true);
    try {
      const result = await loginUser({
        email: form.email,
        password: form.password,
      });

      if (result.data?.token) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
      }

      // Redirect admin to admin panel, others to dashboard
      if (result.data?.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
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
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Login to your chef account</p>

          {error && <div className="error-box">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="chef@example.com"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="off"
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
              autoComplete="new-password"
            />
          </div>

          <button className="btn-dark btn-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="auth-redirect">
            Don't have an account?{" "}
            <span className="link-orange" onClick={() => navigate("/register")}>Register here</span>
          </p>
        </div>
      </div>
    </div>
  );
}