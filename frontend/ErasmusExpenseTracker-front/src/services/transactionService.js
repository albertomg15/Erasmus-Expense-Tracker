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
  headers: {
    ...getAuthHeaders(),
    "Content-Type": "application/json",
  },
  body: JSON.stringify(transaction),
});

if (!res.ok) {
  const text = await res.text();
  throw new Error(`Failed to create transaction: ${res.status} - ${text}`);
}

return res.json(); // solo si hay body

};

export const deleteTransaction = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete transaction: ${res.status} - ${text}`);
  }
};


// Nuevo endpoint unificado
export const getDashboardData = async () => {
  const res = await fetch(`${API_BASE_URL}/api/transactions/dashboard`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch dashboard data: ${res.status} - ${errorText}`);
  }

  return res.json();
};

export const createRecurringTransaction = async (transaction) => {
  const res = await fetch(`${API_BASE_URL}/api/recurring-transactions`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transaction),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create recurring transaction: ${res.status} - ${text}`);
  }

  return res.json();
};

export const updateTransaction = async (id, transaction) => {
  const res = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transaction),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update transaction: ${res.status} - ${text}`);
  }

  return res.json();
};



