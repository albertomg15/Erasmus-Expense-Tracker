import { API_BASE_URL, getAuthHeaders } from "./config";

export const getAllCategoriesByUserId = async (userId) => {
  const res = await fetch(`${API_BASE_URL}/api/categories?userId=${userId}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const createCategory = async (name, userId) => {
  const res = await fetch(`${API_BASE_URL}/api/categories?userId=${userId}`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    throw new Error("Error creating category");
  }

  return res.json();
};
