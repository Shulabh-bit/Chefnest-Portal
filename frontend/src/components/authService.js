import api from "./api";

/**
 * Register a new user
 * POST /api/users/register
 * Body: { name, email, password }
 */
export const registerUser = async ({ name, email, password }) => {
  const response = await api.post("/users/register", { name, email, password });
  return response.data; // { success, message, data: { user, token } }
};

/**
 * Login an existing user
 * POST /api/users/login
 * Body: { email, password }
 */
export const loginUser = async ({ email, password }) => {
  const response = await api.post("/users/login", { email, password });
  return response.data; // { success, message, data: { user, token } }
};

/**
 * Logout - clears token from localStorage
 */
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};