// services/config.js
export const API_BASE_URL = "http://localhost:8080"; // o el que uses

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};
