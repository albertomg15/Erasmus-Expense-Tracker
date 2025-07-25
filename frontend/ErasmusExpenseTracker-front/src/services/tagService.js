import { API_BASE_URL, getAuthHeaders } from "./config";
import { parseJwt } from "../utils/tokenUtils"; // Asegúrate de que funciona bien con tu token guardado

// 🔹 Obtener todos los tags del usuario
export const getAllTags = async () => {
  const token = getAuthHeaders().Authorization?.split(" ")[1];
  const userId = parseJwt(token).userId;

  const res = await fetch(`${API_BASE_URL}/api/tags?userId=${userId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch tags");
  return res.json();
};

// 🔹 Crear un nuevo tag
export const createTag = async (name) => {
  const token = getAuthHeaders().Authorization?.split(" ")[1];
  const userId = parseJwt(token).userId;

  const res = await fetch(`${API_BASE_URL}/api/tags?userId=${userId}`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to create tag");
  return res.json();
};

// 🔹 Actualizar un tag existente
export const updateTag = async (tagId, name) => {
  const res = await fetch(`${API_BASE_URL}/api/tags/${tagId}`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) throw new Error("Failed to update tag");
  return res.json();
};

// 🔹 Eliminar un tag
export const deleteTag = async (tagId) => {
  const res = await fetch(`${API_BASE_URL}/api/tags/${tagId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to delete tag");
  }
};
