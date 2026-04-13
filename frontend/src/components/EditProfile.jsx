import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getImageUrl } from "./api";

export default function EditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/profile");
      const u = res.data?.data;
      setForm({ name: u?.name || "", phone: u?.phone || "", address: u?.address || "" });
      setUser(u);
    } catch (err) {
      setError("Failed to load profile.");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); setSuccess("");
  };

  // ── Avatar change ──
  const handleAvatarClick = () => fileInputRef.current.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview instantly
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload to backend PATCH /api/users/avatar
    setAvatarLoading(true);
    setError(""); setSuccess("");
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      await api.patch("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Fetch fresh profile to get correct avatar path
      const profileRes = await api.get("/users/profile");
      const freshUser = profileRes.data?.data?.user || profileRes.data?.data;
      localStorage.setItem("user", JSON.stringify(freshUser));
      setUser(freshUser);
      setSuccess("Profile picture updated!");
    } catch (err) {
      setError("Failed to upload picture. Try again.");
      setAvatarPreview(null);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm("Remove profile picture?")) return;
    setAvatarLoading(true);
    try {
      await api.delete("/users/avatar");
      const updatedUser = { ...user, avatar: null };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setAvatarPreview(null);
      setSuccess("Profile picture removed.");
    } catch (err) {
      setError("Failed to remove picture.");
    } finally {
      setAvatarLoading(false);
    }
  };

  // ── Profile save ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Name is required.");
    setLoading(true);
    try {
      const res = await api.put("/users/profile", {
        name: form.name, phone: form.phone, address: form.address,
      });
      // res.data.data is { user: {...} } so extract the user object
      const returnedUser = res.data?.data?.user || res.data?.data;
      const updatedUser = { ...user, ...returnedUser };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // avatarPreview is a base64 blob URL (no conversion needed)
  // user?.avatar is a stored path that needs getImageUrl
  const currentAvatar = avatarPreview || getImageUrl(user?.avatar);

  return (
    <div className="dash-page">
      {/* Navbar */}
      <nav className="dash-nav">
        <div className="dash-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <span className="dash-brand-icon">🍳</span>
          <span className="dash-brand-name">ChefNest</span>
        </div>
        <div className="dash-nav-right">
          <span className="dash-navlink" onClick={() => navigate("/dashboard")}>Dashboard</span>
          <span className="dash-navlink" onClick={() => navigate("/my-recipes")}>My Recipes</span>
          <span className="dash-navlink active-link">Edit Profile</span>
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
        <div className="dash-welcome">
          <h1>Edit Profile</h1>
          <p>Update your personal information and profile picture</p>
        </div>

        {fetching ? (
          <div className="dash-loading-inline"><div className="dash-spinner" /> Loading profile...</div>
        ) : (
          <div className="editprofile-layout">

            {/* Avatar Card */}
            <div className="dash-white-card editprofile-avatar-card">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />

              {/* Avatar with overlay */}
              <div className="avatar-upload-wrapper" onClick={handleAvatarClick}>
                {currentAvatar ? (
                  <img src={currentAvatar} alt="avatar" className="avatar-img-large" />
                ) : (
                  <div className="avatar-placeholder-large">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Hover overlay */}
                <div className="avatar-overlay">
                  {avatarLoading ? (
                    <div className="dash-spinner small-spinner" />
                  ) : (
                    <span>📷<br/>Change</span>
                  )}
                </div>
              </div>

              <h3 style={{ marginTop: "12px", fontWeight: 700, color: "#1a1a1a" }}>{user?.name}</h3>
              <p className="dash-specialty">{user?.email}</p>
              <p className="dash-experience">
                Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : "2024"}
              </p>

              {/* Upload & Remove buttons */}
              <div className="avatar-action-btns">
                <button className="btn-dark" onClick={handleAvatarClick} disabled={avatarLoading}>
                  {avatarLoading ? "Uploading..." : "📷 Change Photo"}
                </button>
                {currentAvatar && (
                  <button className="btn-delete-avatar" onClick={handleDeleteAvatar} disabled={avatarLoading}>
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Form Card */}
            <div className="dash-white-card editprofile-form-card">
              <h2 className="dash-section-title">Personal Information</h2>

              {error && <div className="error-box">{error}</div>}
              {success && <div className="success-box">{success}</div>}

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text" name="name" value={form.name}
                  onChange={handleChange} placeholder="Your full name" disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={user?.email || ""} disabled className="input-disabled" />
                <span className="input-hint">Email cannot be changed</span>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text" name="phone" value={form.phone}
                  onChange={handleChange} placeholder="Your phone number" disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text" name="address" value={form.address}
                  onChange={handleChange} placeholder="Your address" disabled={loading}
                />
              </div>

              <div className="editprofile-btns">
                <button className="btn-outline" onClick={() => navigate("/dashboard")} disabled={loading}>
                  Cancel
                </button>
                <button className="btn-dark" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}