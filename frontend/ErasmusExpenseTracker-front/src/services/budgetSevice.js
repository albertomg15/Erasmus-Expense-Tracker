// services/budgetService.js
import { API_BASE_URL, getAuthHeaders } from "./config";

export const getBudgets = async () => {
  const res = await fetch(`${API_BASE_URL}/api/budgets`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getBudgetById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/budgets/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const createBudget = async (budget) => {
  const res = await fetch(`${API_BASE_URL}/api/budgets`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(budget),
  });
  return res.json();
};

export const deleteBudget = async (id) => {
  return fetch(`${API_BASE_URL}/api/budgets/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
};
