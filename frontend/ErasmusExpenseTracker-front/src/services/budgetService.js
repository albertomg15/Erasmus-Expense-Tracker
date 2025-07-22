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

export const updateBudget = async (budget) => {
  const res = await fetch(`${API_BASE_URL}/api/budgets/${budget.budgetId}`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(budget),
  });

  if (!res.ok) {
    throw new Error("Failed to update budget");
  }

  return res.json();
};

export const getDefaultBudget = async () => {
  const res = await fetch(`${API_BASE_URL}/api/budgets/default`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch default budget");
  return res.json();
};

export const updateDefaultBudget = async (budget) => {
  const res = await fetch(`${API_BASE_URL}/api/budgets/default`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(budget),
  });
  if (!res.ok) throw new Error("Failed to update default budget");
  return res.json();
};

export const getMonthlyBudgets = async () => {
  const res = await fetch(`${API_BASE_URL}/api/budgets/monthly`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch monthly budgets");
  return res.json();
};

export const createOrUpdateMonthlyBudget = async (budget) => {
  const res = await fetch(`${API_BASE_URL}/api/budgets/monthly`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(budget),
  });
  if (!res.ok) throw new Error("Failed to save monthly budget");
  return res.json();
};

