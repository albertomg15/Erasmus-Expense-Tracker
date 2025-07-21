// services/authService.js
import { API_BASE_URL } from "./config";

export const login = async (credentials) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error("Login failed");

  return res.json();
};

export const register = async (data) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text(); // intenta leer el cuerpo como texto
      console.error("Register failed response:", errorText); // 👈 añade esto
      throw new Error("Error al registrar");
    }

    return await res.json();
  } catch (err) {
    console.error("Registration error:", err);
    throw err;
  }
};


