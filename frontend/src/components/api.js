import axios from "axios";

const BASE_URL = "http://localhost:3000";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

/**
 * Converts stored image path to full accessible URL
 * Stored as:  "uploads/profile_pics/photo.jpg"
 * Returns:    "http://localhost:3000/uploads/profile_pics/photo.jpg"
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // Already a full URL
  if (imagePath.startsWith("http")) return imagePath;
  // Fix Windows backslashes
  const cleanPath = imagePath.replace(/\\/g, "/");
  // Remove leading slash if present
  const normalized = cleanPath.startsWith("/") ? cleanPath.slice(1) : cleanPath;
  return `${BASE_URL}/${normalized}`;
};

export default api;