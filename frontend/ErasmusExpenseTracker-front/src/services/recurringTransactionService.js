// services/recurringTransactionService.js
import { API_BASE_URL, getAuthHeaders } from "./config";

export const getRecurringTransactions = async () => {
  const res = await fetch(`${API_BASE_URL}/api/recurring-transactions`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getRecurringTransactionById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/recurring-transactions/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const createRecurringTransaction = async (transaction) => {
  const res = await fetch(`${API_BASE_URL}/api/recurring-transactions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(transaction),
  });
  return res.json();
};

export const deleteRecurringTransaction = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/recurring-transactions/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete recurring transaction: ${res.status} - ${text}`);
  }
};


export const updateRecurringTransaction = async (id, transaction) => {
  const res = await fetch(`${API_BASE_URL}/api/recurring-transactions/${id}`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transaction),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update recurring transaction: ${res.status} - ${text}`);
  }

  return res.json();
};
