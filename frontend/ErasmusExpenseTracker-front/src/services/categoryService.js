import { API_BASE_URL, getAuthHeaders } from "./config";

export const getAllCategoriesByUserId = async (userId) => {
  const res = await fetch(`${API_BASE_URL}/api/categories?userId=${userId}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const createCategory = async ({ name, emoji }, userId) => {
  const res = await fetch(`${API_BASE_URL}/api/categories?userId=${userId}`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, emoji }),  // 👈 Incluimos el emoji
  });

  if (!res.ok) {
    throw new Error("Error creating category");
  }

  return res.json();
};

export const updateCategory = async (categoryId, category, userId) => {
  const res = await fetch(`${API_BASE_URL}/api/categories/${categoryId}?userId=${userId}`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(category),
  });

  if (!res.ok) {
    throw new Error("Error updating category");
  }

  return res.json();
};
// services/categoryService.js


export const deleteCategory = async (categoryId) => {
  const res = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorMsg = await res.text(); // 👈 importante para mostrar el texto enviado por el backend
    throw new Error(errorMsg || "Error deleting category");
  }
};




