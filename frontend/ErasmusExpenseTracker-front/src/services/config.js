// services/config.js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};
