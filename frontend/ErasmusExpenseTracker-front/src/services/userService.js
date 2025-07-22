import { API_BASE_URL, getAuthHeaders } from "./config";

export const changePassword = async ({ currentPassword, newPassword }) => {
  const res = await fetch(`${API_BASE_URL}/api/users/password`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to change password");
  }
};

export const getUserInfo = async () => {
  const res = await fetch(`${API_BASE_URL}/api/users/me`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user info");
  }

  return res.json();
};

export const updateUser = async (userData) => {
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Backend error:", error);
    throw new Error("Failed to update user");
  }

  return res.json();
};

