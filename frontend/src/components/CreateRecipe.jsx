import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

const CATEGORIES = ["breakfast","lunch","dinner","appetizer","snack","dessert","beverage","soup","salad","side-dish","sauce","other"];
const DIFFICULTIES = ["easy","medium","hard"];
const DIET_TYPES = ["vegetarian","vegan","gluten-free","dairy-free","nut-free","keto","paleo","low-carb","sugar-free","halal","kosher"];

const STEP_ICONS = ["1️⃣","2️⃣","3️⃣","4️⃣"];
const STEP_LABELS = ["Basic Info","Ingredients","Instructions","Extra Details"];
const STEP_DESCS = ["Tell us about your dish","What goes into it?","How do you make it?","Final touches"];

export default function CreateRecipe() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [status, setStatus] = useState("draft");
  const [dietType, setDietType] = useState([]);
  const [tags, setTags] = useState("");
  const [thumbnail, setThumbnail] = useState(null);

  const [ingredients, setIngredients] = useState([
    { name: "", quantity: "", unit: "", isOptional: false },
  ]);

  const [steps, setSteps] = useState([
    { stepNumber: 1, instruction: "", duration: "" },
  ]);

  const [tips, setTips] = useState("");
  const [equipment, setEquipment] = useState("");
  const [nutrition, setNutrition] = useState({
    calories: "", protein: "", carbs: "", fat: "", fiber: "", sugar: "", sodium: "",
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const addIngredient = () => setIngredients([...ingredients, { name: "", quantity: "", unit: "", isOptional: false }]);
  const removeIngredient = (i) => setIngredients(ingredients.filter((_, idx) => idx !== i));
  const updateIngredient = (i, field, value) => {
    const updated = [...ingredients]; updated[i][field] = value; setIngredients(updated);
  };

  const addStep = () => setSteps([...steps, { stepNumber: steps.length + 1, instruction: "", duration: "" }]);
  const removeStep = (i) => {
    setSteps(steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stepNumber: idx + 1 })));
  };
  const updateStep = (i, field, value) => {
    const updated = [...steps]; updated[i][field] = value; setSteps(updated);
  };

  const toggleDiet = (d) => setDietType((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnail(file);
    const reader = new FileReader();
    reader.onload = (ev) => setThumbnailPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const validateStep = () => {
    setError("");
    if (currentStep === 1) {
      if (!title.trim()) return setError("Recipe title is required."), false;
      if (!description.trim()) return setError("Description is required."), false;
      if (!category) return setError("Please select a category."), false;
      if (!cookTime || isNaN(cookTime)) return setError("Valid cook time is required."), false;
      if (!servings || isNaN(servings)) return setError("Valid servings count is required."), false;
    }
    if (currentStep === 2) {
      for (let ing of ingredients) {
        if (!ing.name.trim()) return setError("All ingredient names are required."), false;
        if (!ing.quantity.trim()) return setError("All ingredient quantities are required."), false;
      }
    }
    if (currentStep === 3) {
      for (let s of steps) {
        if (!s.instruction.trim()) return setError("All step instructions are required."), false;
      }
    }
    return true;
  };

  const nextStep = () => { if (validateStep()) setCurrentStep((s) => s + 1); };
  const prevStep = () => { setError(""); setCurrentStep((s) => s - 1); };

  const handleSubmit = async (publishStatus) => {
    setError(""); setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("cuisine", cuisine);
      formData.append("difficulty", difficulty);
      formData.append("cookTime", cookTime);
      formData.append("servings", servings);
      formData.append("status", publishStatus);
      formData.append("ingredients", JSON.stringify(ingredients));
      formData.append("steps", JSON.stringify(steps.map((s) => ({ ...s, duration: s.duration ? Number(s.duration) : null }))));
      formData.append("dietType", JSON.stringify(dietType));
      formData.append("tags", JSON.stringify(tags.split(",").map((t) => t.trim()).filter(Boolean)));
      formData.append("tips", JSON.stringify(tips.split("\n").map((t) => t.trim()).filter(Boolean)));
      formData.append("equipment", JSON.stringify(equipment.split(",").map((e) => e.trim()).filter(Boolean)));
      const nutritionData = {};
      Object.entries(nutrition).forEach(([k, v]) => { if (v) nutritionData[k] = Number(v); });
      if (Object.keys(nutritionData).length > 0) formData.append("nutrition", JSON.stringify(nutritionData));
      if (thumbnail) formData.append("thumbnail", thumbnail);
      await api.post("/recipes", formData, { headers: { "Content-Type": "multipart/form-data" } });
      navigate("/my-recipes");
    } catch (err) {
      setError(err.message || "Failed to create recipe.");
    } finally {
      setLoading(false);
    }
  };

  const progressPct = ((currentStep - 1) / 3) * 100;

  return (
    <div className="cr-page">
      {/* Navbar */}
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

      <div className="cr-body">
        {/* Header */}
        <div className="cr-header">
          <div className="cr-header-left">
            <h1 className="cr-title">Create New Recipe</h1>
            <p className="cr-subtitle">Share your culinary masterpiece with the world</p>
          </div>
          <button className="cr-cancel-btn" onClick={() => navigate("/my-recipes")}>✕ Cancel</button>
        </div>

        {/* Progress */}
        <div className="cr-progress-wrap">
          <div className="cr-progress-bar-bg">
            <div className="cr-progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="cr-steps-row">
            {STEP_LABELS.map((label, i) => {
              const num = i + 1;
              const done = currentStep > num;
              const active = currentStep === num;
              return (
                <div key={i} className={`cr-step ${active ? "cr-step-active" : ""} ${done ? "cr-step-done" : ""}`}>
                  <div className="cr-step-bubble">
                    {done ? "✓" : num}
                  </div>
                  <div className="cr-step-text">
                    <span className="cr-step-label">{label}</span>
                    <span className="cr-step-desc">{STEP_DESCS[i]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && <div className="error-box cr-error">{error}</div>}

        {/* Form Card */}
        <div className="cr-card">

          {/* ── STEP 1 ── */}
          {currentStep === 1 && (
            <div className="cr-form-section">
              <div className="cr-section-header">
                <span className="cr-section-emoji">📋</span>
                <div>
                  <h2 className="cr-section-title">Basic Information</h2>
                  <p className="cr-section-hint">The essentials that describe your recipe</p>
                </div>
              </div>

              <div className="cr-field cr-full">
                <label className="cr-label">Recipe Title <span className="cr-req">*</span></label>
                <input className="cr-input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Classic Margherita Pizza" />
              </div>

              <div className="cr-field cr-full">
                <label className="cr-label">Description <span className="cr-req">*</span></label>
                <textarea className="cr-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What makes this recipe special? Describe the flavors, texture, occasion..." rows={4} />
              </div>

              <div className="cr-grid-2">
                <div className="cr-field">
                  <label className="cr-label">Category <span className="cr-req">*</span></label>
                  <select className="cr-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace("-", " ")}</option>)}
                  </select>
                </div>
                <div className="cr-field">
                  <label className="cr-label">Cuisine</label>
                  <input className="cr-input" type="text" value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder="e.g., Italian, Indian, Mexican" />
                </div>
                <div className="cr-field">
                  <label className="cr-label">Difficulty <span className="cr-req">*</span></label>
                  <div className="cr-difficulty-row">
                    {DIFFICULTIES.map((d) => (
                      <button key={d} type="button"
                        className={`cr-diff-btn ${difficulty === d ? `cr-diff-${d}` : ""}`}
                        onClick={() => setDifficulty(d)}>
                        {d === "easy" ? "🟢" : d === "medium" ? "🟡" : "🔴"} {d.charAt(0).toUpperCase() + d.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="cr-field">
                  <label className="cr-label">Status</label>
                  <div className="cr-difficulty-row">
                    {["draft","published"].map((s) => (
                      <button key={s} type="button"
                        className={`cr-diff-btn ${status === s ? "cr-diff-active" : ""}`}
                        onClick={() => setStatus(s)}>
                        {s === "draft" ? "📝" : "🌍"} {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="cr-field">
                  <label className="cr-label">Cook Time <span className="cr-req">*</span></label>
                  <div className="cr-input-icon-wrap">
                    <span className="cr-input-icon">🕒</span>
                    <input className="cr-input cr-input-padded" type="number" value={cookTime} onChange={(e) => setCookTime(e.target.value)} placeholder="30" min="1" />
                    <span className="cr-input-suffix">min</span>
                  </div>
                </div>
                <div className="cr-field">
                  <label className="cr-label">Servings <span className="cr-req">*</span></label>
                  <div className="cr-input-icon-wrap">
                    <span className="cr-input-icon">👥</span>
                    <input className="cr-input cr-input-padded" type="number" value={servings} onChange={(e) => setServings(e.target.value)} placeholder="4" min="1" />
                    <span className="cr-input-suffix">people</span>
                  </div>
                </div>
              </div>

              {/* Thumbnail */}
              <div className="cr-field cr-full">
                <label className="cr-label">📸 Thumbnail Image</label>
                <div className="cr-thumbnail-upload" onClick={() => document.getElementById("thumb-input").click()}>
                  {thumbnailPreview ? (
                    <div className="cr-thumb-preview">
                      <img src={thumbnailPreview} alt="preview" />
                      <div className="cr-thumb-overlay">Change Image</div>
                    </div>
                  ) : (
                    <div className="cr-thumb-placeholder">
                      <span className="cr-thumb-icon">🖼️</span>
                      <p>Click to upload thumbnail</p>
                      <span>JPG, PNG, WEBP up to 10MB</span>
                    </div>
                  )}
                  <input id="thumb-input" type="file" accept="image/*" style={{ display: "none" }} onChange={handleThumbnail} />
                </div>
              </div>

              {/* Tags */}
              <div className="cr-field cr-full">
                <label className="cr-label">🏷️ Tags</label>
                <input className="cr-input" type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="pizza, italian, vegetarian, quick (comma separated)" />
              </div>

              {/* Diet */}
              <div className="cr-field cr-full">
                <label className="cr-label">🥗 Diet Type</label>
                <div className="cr-diet-grid">
                  {DIET_TYPES.map((d) => (
                    <button key={d} type="button"
                      className={`cr-diet-chip ${dietType.includes(d) ? "cr-diet-chip-active" : ""}`}
                      onClick={() => toggleDiet(d)}>
                      {dietType.includes(d) ? "✓ " : ""}{d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {currentStep === 2 && (
            <div className="cr-form-section">
              <div className="cr-section-header">
                <span className="cr-section-emoji">🥕</span>
                <div>
                  <h2 className="cr-section-title">Ingredients</h2>
                  <p className="cr-section-hint">List everything needed for your recipe</p>
                </div>
              </div>

              <div className="cr-ing-list">
                {ingredients.map((ing, i) => (
                  <div key={i} className="cr-ing-row">
                    <div className="cr-ing-num">{i + 1}</div>
                    <div className="cr-ing-fields">
                      <div className="cr-field">
                        <label className="cr-label">Ingredient Name <span className="cr-req">*</span></label>
                        <input className="cr-input" type="text" value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)} placeholder="e.g., All-purpose flour" />
                      </div>
                      <div className="cr-ing-qty-row">
                        <div className="cr-field">
                          <label className="cr-label">Quantity <span className="cr-req">*</span></label>
                          <input className="cr-input" type="text" value={ing.quantity} onChange={(e) => updateIngredient(i, "quantity", e.target.value)} placeholder="2" />
                        </div>
                        <div className="cr-field">
                          <label className="cr-label">Unit</label>
                          <input className="cr-input" type="text" value={ing.unit} onChange={(e) => updateIngredient(i, "unit", e.target.value)} placeholder="cups" />
                        </div>
                        <div className="cr-field cr-optional-field">
                          <label className="cr-label">Optional?</label>
                          <label className="cr-toggle">
                            <input type="checkbox" checked={ing.isOptional} onChange={(e) => updateIngredient(i, "isOptional", e.target.checked)} />
                            <span className="cr-toggle-slider" />
                          </label>
                        </div>
                      </div>
                    </div>
                    {ingredients.length > 1 && (
                      <button className="cr-remove-btn" onClick={() => removeIngredient(i)} title="Remove">✕</button>
                    )}
                  </div>
                ))}
              </div>
              <button className="cr-add-btn" onClick={addIngredient}>
                <span>+</span> Add Another Ingredient
              </button>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {currentStep === 3 && (
            <div className="cr-form-section">
              <div className="cr-section-header">
                <span className="cr-section-emoji">👨‍🍳</span>
                <div>
                  <h2 className="cr-section-title">Cooking Instructions</h2>
                  <p className="cr-section-hint">Walk your readers through each step clearly</p>
                </div>
              </div>

              <div className="cr-steps-list">
                {steps.map((s, i) => (
                  <div key={i} className="cr-step-row">
                    <div className="cr-step-row-num">{i + 1}</div>
                    <div className="cr-step-row-fields">
                      <div className="cr-field cr-full">
                        <label className="cr-label">Step {i + 1} Instruction <span className="cr-req">*</span></label>
                        <textarea className="cr-textarea" value={s.instruction} onChange={(e) => updateStep(i, "instruction", e.target.value)} placeholder="Describe exactly what to do in this step..." rows={3} />
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
              <button className="cr-add-btn" onClick={addStep}>
                <span>+</span> Add Another Step
              </button>
            </div>
          )}

          {/* ── STEP 4 ── */}
          {currentStep === 4 && (
            <div className="cr-form-section">
              <div className="cr-section-header">
                <span className="cr-section-emoji">✨</span>
                <div>
                  <h2 className="cr-section-title">Extra Details</h2>
                  <p className="cr-section-hint">Optional but makes your recipe shine</p>
                </div>
              </div>

              <div className="cr-field cr-full">
                <label className="cr-label">💡 Tips & Notes</label>
                <textarea className="cr-textarea" value={tips} onChange={(e) => setTips(e.target.value)} placeholder="Add pro tips, substitutions, or storage instructions (one per line)..." rows={4} />
                <span className="cr-field-hint">One tip per line</span>
              </div>

              <div className="cr-field cr-full">
                <label className="cr-label">🔧 Equipment Needed</label>
                <input className="cr-input" type="text" value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="Oven, Stand mixer, Baking pan (comma separated)" />
              </div>

              <div className="cr-nutrition-heading">
                <span>📊</span> Nutrition Information <span className="cr-optional-tag">per serving · optional</span>
              </div>
              <div className="cr-nutrition-grid">
                {[
                  { key: "calories", label: "Calories", unit: "kcal", emoji: "🔥" },
                  { key: "protein", label: "Protein", unit: "g", emoji: "💪" },
                  { key: "carbs", label: "Carbs", unit: "g", emoji: "🌾" },
                  { key: "fat", label: "Fat", unit: "g", emoji: "🫒" },
                  { key: "fiber", label: "Fiber", unit: "g", emoji: "🥦" },
                  { key: "sugar", label: "Sugar", unit: "g", emoji: "🍬" },
                  { key: "sodium", label: "Sodium", unit: "mg", emoji: "🧂" },
                ].map(({ key, label, unit, emoji }) => (
                  <div key={key} className="cr-nutrition-card">
                    <span className="cr-nutrition-emoji">{emoji}</span>
                    <label className="cr-label">{label}</label>
                    <div className="cr-input-icon-wrap">
                      <input className="cr-input" type="number" value={nutrition[key]} onChange={(e) => setNutrition({ ...nutrition, [key]: e.target.value })} placeholder="0" min="0" />
                      <span className="cr-input-suffix">{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="cr-nav-row">
            <div>
              {currentStep > 1 && (
                <button className="cr-back-btn" onClick={prevStep} disabled={loading}>
                  ← Previous
                </button>
              )}
            </div>
            <div className="cr-nav-right-btns">
              {currentStep < 4 ? (
                <button className="cr-next-btn" onClick={nextStep}>
                  Next Step →
                </button>
              ) : (
                <>
                  <button className="cr-draft-btn" onClick={() => handleSubmit("draft")} disabled={loading}>
                    📝 Save as Draft
                  </button>
                  <button className="cr-publish-btn" onClick={() => handleSubmit("published")} disabled={loading}>
                    {loading ? "Publishing..." : "🌍 Publish Recipe"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}