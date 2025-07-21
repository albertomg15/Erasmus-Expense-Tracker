// services/exchangeRateService.js
import { API_BASE_URL, getAuthHeaders } from "./config";

export const getExchangeRates = async () => {
  const res = await fetch(`${API_BASE_URL}/api/exchange-rates`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getExchangeRateById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/exchange-rates/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const createExchangeRate = async (rate) => {
  const res = await fetch(`${API_BASE_URL}/api/exchange-rates`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(rate),
  });
  return res.json();
};

export const deleteExchangeRate = async (id) => {
  return fetch(`${API_BASE_URL}/api/exchange-rates/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
};
