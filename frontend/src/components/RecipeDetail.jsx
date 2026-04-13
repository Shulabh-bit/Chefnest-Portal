import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { getImageUrl } from "./api";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const res = await api.get(`/recipes/${id}`);
      setRecipe(res.data?.recipe || res.data?.data);
    } catch (err) {
      setError("Recipe not found.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="dash-loading">
      <div className="dash-spinner" />
      <p>Loading recipe...</p>
    </div>
  );

  if (error) return (
    <div className="dash-loading">
      <p>{error}</p>
      <button className="btn-dark" onClick={() => navigate(-1)}>Go Back</button>
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
          <span className="dash-navlink" onClick={() => navigate("/dashboard")}>Dashboard</span>
          <span className="dash-navlink" onClick={() => navigate("/my-recipes")}>My Recipes</span>
          <span className="dash-user-badge">
            <span className="dash-user-icon">👤</span>
            {user?.name}
          </span>
          <button className="dash-logout-btn" onClick={() => {
            localStorage.clear(); navigate("/login");
          }}>↪ Logout</button>
        </div>
      </nav>

      <div className="dash-body">
        {/* Back button */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        {/* Hero Image */}
        {recipe.thumbnail && (
          <div className="recipe-detail-hero">
            <img src={getImageUrl(recipe.thumbnail)} alt={recipe.title} />
          </div>
        )}

        {/* Title & Meta */}
        <div className="dash-white-card">
          <div className="recipe-detail-header">
            <div>
              <h1 className="recipe-detail-title">{recipe.title}</h1>
              <p className="recipe-detail-desc">{recipe.description}</p>
            </div>
            <span className={`recipe-status-badge status-${recipe.status}`}>
              {recipe.status}
            </span>
          </div>

          {/* Quick Stats */}
          <div className="recipe-detail-stats">
            <div className="recipe-stat">
              <span className="recipe-stat-icon">🕒</span>
              <span className="recipe-stat-label">Cook Time</span>
              <span className="recipe-stat-val">{recipe.cookTime} min</span>
            </div>
            <div className="recipe-stat">
              <span className="recipe-stat-icon">👥</span>
              <span className="recipe-stat-label">Servings</span>
              <span className="recipe-stat-val">{recipe.servings}</span>
            </div>
            <div className="recipe-stat">
              <span className="recipe-stat-icon">📊</span>
              <span className="recipe-stat-label">Difficulty</span>
              <span className="recipe-stat-val">{recipe.difficulty}</span>
            </div>
            <div className="recipe-stat">
              <span className="recipe-stat-icon">📂</span>
              <span className="recipe-stat-label">Category</span>
              <span className="recipe-stat-val">{recipe.category}</span>
            </div>
            {recipe.cuisine && (
              <div className="recipe-stat">
                <span className="recipe-stat-icon">🌍</span>
                <span className="recipe-stat-label">Cuisine</span>
                <span className="recipe-stat-val">{recipe.cuisine}</span>
              </div>
            )}
            <div className="recipe-stat">
              <span className="recipe-stat-icon">⭐</span>
              <span className="recipe-stat-label">Rating</span>
              <span className="recipe-stat-val">{recipe.averageRating || "N/A"}</span>
            </div>
          </div>

          {/* Tags */}
          {recipe.tags?.length > 0 && (
            <div className="recipe-tags">
              {recipe.tags.map((tag, i) => (
                <span key={i} className="recipe-tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        <div className="recipe-detail-cols">
          {/* Ingredients */}
          <div className="dash-white-card">
            <h2 className="dash-section-title">🥕 Ingredients</h2>
            <ul className="ingredients-list">
              {recipe.ingredients?.map((ing, i) => (
                <li key={i} className="ingredient-item">
                  <span className="ingredient-dot" />
                  <span className="ingredient-qty">{ing.quantity} {ing.unit}</span>
                  <span className="ingredient-name">{ing.name}</span>
                  {ing.isOptional && <span className="optional-badge">optional</span>}
                </li>
              ))}
            </ul>
          </div>

          {/* Nutrition */}
          {recipe.nutrition && Object.values(recipe.nutrition).some(v => v !== null) && (
            <div className="dash-white-card">
              <h2 className="dash-section-title">📊 Nutrition (per serving)</h2>
              <div className="nutrition-grid">
                {recipe.nutrition.calories && <div className="nutrition-item"><span>Calories</span><strong>{recipe.nutrition.calories}</strong></div>}
                {recipe.nutrition.protein && <div className="nutrition-item"><span>Protein</span><strong>{recipe.nutrition.protein}g</strong></div>}
                {recipe.nutrition.carbs && <div className="nutrition-item"><span>Carbs</span><strong>{recipe.nutrition.carbs}g</strong></div>}
                {recipe.nutrition.fat && <div className="nutrition-item"><span>Fat</span><strong>{recipe.nutrition.fat}g</strong></div>}
                {recipe.nutrition.fiber && <div className="nutrition-item"><span>Fiber</span><strong>{recipe.nutrition.fiber}g</strong></div>}
                {recipe.nutrition.sugar && <div className="nutrition-item"><span>Sugar</span><strong>{recipe.nutrition.sugar}g</strong></div>}
              </div>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="dash-white-card">
          <h2 className="dash-section-title">👨‍🍳 Cooking Steps</h2>
          <div className="steps-list">
            {recipe.steps?.map((step, i) => (
              <div key={i} className="step-item">
                <div className="step-number">{step.stepNumber || i + 1}</div>
                <div className="step-content">
                  <p>{step.instruction}</p>
                  {step.duration && (
                    <span className="step-duration">🕒 {step.duration} min</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        {recipe.tips?.length > 0 && (
          <div className="dash-white-card">
            <h2 className="dash-section-title">💡 Tips & Notes</h2>
            <ul className="tips-list">
              {recipe.tips.map((tip, i) => (
                <li key={i} className="tip-item">💡 {tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Equipment */}
        {recipe.equipment?.length > 0 && (
          <div className="dash-white-card">
            <h2 className="dash-section-title">🔧 Equipment Needed</h2>
            <div className="equipment-list">
              {recipe.equipment.map((eq, i) => (
                <span key={i} className="equipment-badge">{eq}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}