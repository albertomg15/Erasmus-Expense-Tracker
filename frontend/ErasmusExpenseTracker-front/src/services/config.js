// services/config.js
export const API_BASE_URL = "http://localhost:8080";

export const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};
