// services/transactionService.js
import { API_BASE_URL, getAuthHeaders } from "./config";

export const getTransactions = async () => {
  const res = await fetch(`${API_BASE_URL}/api/transactions`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getTransactionById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const createTransaction = async (transaction) => {
  const res = await fetch(`${API_BASE_URL}/api/transactions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(transaction),
  });
  return res.json();
};

export const deleteTransaction = async (id) => {
  return fetch(`${API_BASE_URL}/api/transactions/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
};
