import { API_BASE_URL, getAuthHeaders } from "./config";

// 🔹 Obtener todos los viajes de un usuario
export const getTripsByUserId = async (userId) => {
  const res = await fetch(`${API_BASE_URL}/api/trips/user/${userId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch trips");
  return res.json();
};

// 🔹 Obtener viaje por ID
export const getTripById = async (tripId) => {
  const res = await fetch(`${API_BASE_URL}/api/trips/${tripId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch trip");
  return res.json();
};

// 🔹 Crear viaje
export const createTrip = async (trip) => {
  const res = await fetch(`${API_BASE_URL}/api/trips`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(trip),
  });
  if (!res.ok) throw new Error("Failed to create trip");
  return res.json();
};

// 🔹 Actualizar viaje
export const updateTrip = async (tripId, trip) => {
  const res = await fetch(`${API_BASE_URL}/api/trips/${tripId}`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(trip),
  });
  if (!res.ok) throw new Error("Failed to update trip");
  return res.json();
};

// 🔹 Eliminar viaje
export const deleteTrip = async (tripId) => {
  const res = await fetch(`${API_BASE_URL}/api/trips/${tripId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete trip: ${res.status} - ${text}`);
  }
};

// 🔹 Obtener transacciones del viaje
export const getTripTransactions = async (tripId) => {
  const res = await fetch(`${API_BASE_URL}/api/trips/${tripId}/transactions`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch trip transactions");
  return res.json();
};
