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
  return fetch(`${API_BASE_URL}/api/recurring-transactions/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
};
