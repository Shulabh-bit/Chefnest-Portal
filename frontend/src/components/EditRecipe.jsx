import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { getImageUrl } from "./api";

const CATEGORIES = ["breakfast","lunch","dinner","appetizer","snack","dessert","beverage","soup","salad","side-dish","sauce","other"];
const DIFFICULTIES = ["easy","medium","hard"];

export default function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  const [form, setForm] = useState({
    title: "", description: "", category: "", cuisine: "",
    difficulty: "easy", cookTime: "", servings: "", status: "draft",
    tags: "", tips: "", equipment: "",
  });

  const [ingredients, setIngredients] = useState([
    { name: "", quantity: "", unit: "", isOptional: false },
  ]);

  const [steps, setSteps] = useState([
    { stepNumber: 1, instruction: "", duration: "" },
  ]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const res = await api.get(`/recipes/${id}`);
      const r = res.data?.recipe || res.data?.data;
      setForm({
        title: r.title || "",
        description: r.description || "",
        category: r.category || "",
        cuisine: r.cuisine || "",
        difficulty: r.difficulty || "easy",
        cookTime: r.cookTime || "",
        servings: r.servings || "",
        status: r.status || "draft",
        tags: (r.tags || []).join(", "),
        tips: (r.tips || []).join("\n"),
        equipment: (r.equipment || []).join(", "),
      });
      setIngredients(r.ingredients?.length > 0 ? r.ingredients : [{ name: "", quantity: "", unit: "", isOptional: false }]);
      setSteps(r.steps?.length > 0 ? r.steps.map(s => ({ ...s, duration: s.duration || "" })) : [{ stepNumber: 1, instruction: "", duration: "" }]);
      if (r.thumbnail) setThumbnailPreview(getImageUrl(r.thumbnail));
    } catch (err) {
      setError("Failed to load recipe.");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); setSuccess("");
  };

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnail(file);
    const reader = new FileReader();
    reader.onload = (ev) => setThumbnailPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  // Ingredient helpers
  const addIngredient = () => setIngredients([...ingredients, { name: "", quantity: "", unit: "", isOptional: false }]);
  const removeIngredient = (i) => setIngredients(ingredients.filter((_, idx) => idx !== i));
  const updateIngredient = (i, field, value) => {
    const updated = [...ingredients]; updated[i][field] = value; setIngredients(updated);
  };

  // Step helpers
  const addStep = () => setSteps([...steps, { stepNumber: steps.length + 1, instruction: "", duration: "" }]);
  const removeStep = (i) => setSteps(steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stepNumber: idx + 1 })));
  const updateStep = (i, field, value) => {
    const updated = [...steps]; updated[i][field] = value; setSteps(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required.");
    if (!form.category) return setError("Category is required.");

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === "tags") formData.append("tags", JSON.stringify(val.split(",").map(t => t.trim()).filter(Boolean)));
        else if (key === "tips") formData.append("tips", JSON.stringify(val.split("\n").map(t => t.trim()).filter(Boolean)));
        else if (key === "equipment") formData.append("equipment", JSON.stringify(val.split(",").map(e => e.trim()).filter(Boolean)));
        else formData.append(key, val);
      });
      formData.append("ingredients", JSON.stringify(ingredients));
      formData.append("steps", JSON.stringify(steps.map(s => ({ ...s, duration: s.duration ? Number(s.duration) : null }))));
      if (thumbnail) formData.append("thumbnail", thumbnail);

      await api.put(`/recipes/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Recipe updated successfully!");
      setTimeout(() => navigate("/my-recipes"), 1500);
    } catch (err) {
      setError(err.message || "Failed to update recipe.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="dash-loading">
      <div className="dash-spinner" />
      <p>Loading recipe...</p>
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
          <span className="dash-navlink" onClick={() => navigate("/dashboard")}>Dashboard</span>
          <span className="dash-navlink" onClick={() => navigate("/my-recipes")}>My Recipes</span>
          <span className="dash-user-badge"><span className="dash-user-icon">👤</span>{user?.name}</span>
          <button className="dash-logout-btn" onClick={() => { localStorage.clear(); navigate("/login"); }}>↪ Logout</button>
        </div>
      </nav>

      <div className="dash-body">
        <div className="cr-header">
          <div>
            <h1 className="cr-title">Edit Recipe</h1>
            <p className="cr-subtitle">Update your recipe details</p>
          </div>
          <button className="cr-cancel-btn" onClick={() => navigate("/my-recipes")}>✕ Cancel</button>
        </div>

        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        <div className="cr-card">
          {/* Basic Info */}
          <div className="cr-form-section">
            <div className="cr-section-header">
              <span className="cr-section-emoji">📋</span>
              <div>
                <h2 className="cr-section-title">Basic Information</h2>
                <p className="cr-section-hint">Update the essentials</p>
              </div>
            </div>

            <div className="cr-field cr-full">
              <label className="cr-label">Recipe Title <span className="cr-req">*</span></label>
              <input className="cr-input" type="text" name="title" value={form.title} onChange={handleChange} placeholder="Recipe title" />
            </div>

            <div className="cr-field cr-full">
              <label className="cr-label">Description <span className="cr-req">*</span></label>
              <textarea className="cr-textarea" name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe your recipe..." />
            </div>

            <div className="cr-grid-2">
              <div className="cr-field">
                <label className="cr-label">Category <span className="cr-req">*</span></label>
                <select className="cr-select" name="category" value={form.category} onChange={handleChange}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace("-", " ")}</option>)}
                </select>
              </div>
              <div className="cr-field">
                <label className="cr-label">Cuisine</label>
                <input className="cr-input" type="text" name="cuisine" value={form.cuisine} onChange={handleChange} placeholder="e.g. Italian" />
              </div>
              <div className="cr-field">
                <label className="cr-label">Difficulty</label>
                <div className="cr-difficulty-row">
                  {DIFFICULTIES.map(d => (
                    <button key={d} type="button"
                      className={`cr-diff-btn ${form.difficulty === d ? `cr-diff-${d}` : ""}`}
                      onClick={() => setForm({ ...form, difficulty: d })}>
                      {d === "easy" ? "🟢" : d === "medium" ? "🟡" : "🔴"} {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="cr-field">
                <label className="cr-label">Status</label>
                <div className="cr-difficulty-row">
                  {["draft", "published"].map(s => (
                    <button key={s} type="button"
                      className={`cr-diff-btn ${form.status === s ? "cr-diff-active" : ""}`}
                      onClick={() => setForm({ ...form, status: s })}>
                      {s === "draft" ? "📝" : "🌍"} {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="cr-field">
                <label className="cr-label">Cook Time (minutes)</label>
                <input className="cr-input" type="number" name="cookTime" value={form.cookTime} onChange={handleChange} placeholder="30" min="1" />
              </div>
              <div className="cr-field">
                <label className="cr-label">Servings</label>
                <input className="cr-input" type="number" name="servings" value={form.servings} onChange={handleChange} placeholder="4" min="1" />
              </div>
              <div className="cr-field">
                <label className="cr-label">Tags (comma separated)</label>
                <input className="cr-input" type="text" name="tags" value={form.tags} onChange={handleChange} placeholder="pizza, italian..." />
              </div>
              <div className="cr-field">
                <label className="cr-label">Equipment (comma separated)</label>
                <input className="cr-input" type="text" name="equipment" value={form.equipment} onChange={handleChange} placeholder="Oven, Blender..." />
              </div>
            </div>

            {/* Thumbnail */}
            <div className="cr-field cr-full">
              <label className="cr-label">📸 Thumbnail Image</label>
              <div className="cr-thumbnail-upload" onClick={() => document.getElementById("edit-thumb").click()}>
                {thumbnailPreview ? (
                  <div className="cr-thumb-preview">
                    <img src={thumbnailPreview} alt="preview" />
                    <div className="cr-thumb-overlay">Change Image</div>
                  </div>
                ) : (
                  <div className="cr-thumb-placeholder">
                    <span className="cr-thumb-icon">🖼️</span>
                    <p>Click to upload new thumbnail</p>
                  </div>
                )}
                <input id="edit-thumb" type="file" accept="image/*" style={{ display: "none" }} onChange={handleThumbnail} />
              </div>
            </div>

            {/* Tips */}
            <div className="cr-field cr-full">
              <label className="cr-label">💡 Tips & Notes (one per line)</label>
              <textarea className="cr-textarea" name="tips" value={form.tips} onChange={handleChange} rows={3} placeholder="Add tips..." />
            </div>
          </div>

          {/* Ingredients */}
          <div className="cr-form-section">
            <div className="cr-section-header">
              <span className="cr-section-emoji">🥕</span>
              <div>
                <h2 className="cr-section-title">Ingredients</h2>
                <p className="cr-section-hint">Update what goes into your recipe</p>
              </div>
            </div>
            <div className="cr-ing-list">
              {ingredients.map((ing, i) => (
                <div key={i} className="cr-ing-row">
                  <div className="cr-ing-num">{i + 1}</div>
                  <div className="cr-ing-fields">
                    <div className="cr-field">
                      <label className="cr-label">Name</label>
                      <input className="cr-input" type="text" value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)} placeholder="e.g. Flour" />
                    </div>
                    <div className="cr-ing-qty-row">
                      <div className="cr-field">
                        <label className="cr-label">Quantity</label>
                        <input className="cr-input" type="text" value={ing.quantity} onChange={(e) => updateIngredient(i, "quantity", e.target.value)} placeholder="2" />
                      </div>
                      <div className="cr-field">
                        <label className="cr-label">Unit</label>
                        <input className="cr-input" type="text" value={ing.unit} onChange={(e) => updateIngredient(i, "unit", e.target.value)} placeholder="cups" />
                      </div>
                    </div>
                  </div>
                  {ingredients.length > 1 && (
                    <button className="cr-remove-btn" onClick={() => removeIngredient(i)}>✕</button>
                  )}
                </div>
              ))}
            </div>
            <button className="cr-add-btn" onClick={addIngredient}><span>+</span> Add Ingredient</button>
          </div>

          {/* Steps */}
          <div className="cr-form-section">
            <div className="cr-section-header">
              <span className="cr-section-emoji">👨‍🍳</span>
              <div>
                <h2 className="cr-section-title">Cooking Steps</h2>
                <p className="cr-section-hint">Update the instructions</p>
              </div>
            </div>
            <div className="cr-steps-list">
              {steps.map((s, i) => (
                <div key={i} className="cr-step-row">
                  <div className="cr-step-row-num">{i + 1}</div>
                  <div className="cr-step-row-fields">
                    <div className="cr-field cr-full">
                      <label className="cr-label">Instruction</label>
                      <textarea className="cr-textarea" value={s.instruction} onChange={(e) => updateStep(i, "instruction", e.target.value)} rows={2} placeholder="Describe this step..." />
                    </div>
                    <div className="cr-field" style={{ maxWidth: "200px" }}>
                      <label className="cr-label">⏱ Duration (min)</label>
                      <input className="cr-input" type="number" value={s.duration} onChange={(e) => updateStep(i, "duration", e.target.value)} placeholder="Optional" min="0" />
                    </div>
                  </div>
                  {steps.length > 1 && (
                    <button className="cr-remove-btn" onClick={() => removeStep(i)}>✕</button>
                  )}
                </div>
              ))}
            </div>
            <button className="cr-add-btn" onClick={addStep}><span>+</span> Add Step</button>
          </div>

          {/* Save buttons */}
          <div className="cr-nav-row">
            <button className="cr-back-btn" onClick={() => navigate("/my-recipes")}>← Cancel</button>
            <div className="cr-nav-right-btns">
              <button className="cr-publish-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving..." : "💾 Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}