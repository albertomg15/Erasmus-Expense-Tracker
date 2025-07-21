// services/tripService.js
import { API_BASE_URL, getAuthHeaders } from "./config";

export const getTripsByUserId = async (userId) => {
  const res = await fetch(`${API_BASE_URL}/api/trips/user/${userId}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getTripById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/trips/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const createTrip = async (trip) => {
  const res = await fetch(`${API_BASE_URL}/api/trips`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(trip),
  });
  return res.json();
};

export const deleteTrip = async (id) => {
  return fetch(`${API_BASE_URL}/api/trips/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
};
