import { API_BASE_URL, getAuthHeaders } from "./config";

// 1. Monthly Summary
export const getMonthlySummary = async (userId, month, year) => {
  const url = new URL(`${API_BASE_URL}/api/stats/monthly-summary`);
  url.searchParams.set("userId", userId);
  if (month) url.searchParams.set("month", month);
  if (year) url.searchParams.set("year", year);

  const res = await fetch(url.toString(), {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch monthly summary");
  return await res.json();
};

// 2. Monthly Evolution (últimos N meses)
export const getMonthlyEvolution = async (userId, monthsBack = 6) => {
  const url = new URL(`${API_BASE_URL}/api/stats/monthly-evolution`);
  url.searchParams.set("userId", userId);
  url.searchParams.set("monthsBack", monthsBack);

  const res = await fetch(url.toString(), {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch monthly evolution");
  return await res.json();
};

// 3. Income vs Expense (por mes/año)
export const getIncomeVsExpense = async (userId, month, year) => {
  const url = new URL(`${API_BASE_URL}/api/stats/income-vs-expense`);
  url.searchParams.set("userId", userId);
  if (month) url.searchParams.set("month", month);
  if (year) url.searchParams.set("year", year);

  const res = await fetch(url.toString(), {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch income vs expense");
  return await res.json();
};

// 4. Monthly Comparison (últimos N meses, incluye categorías)
export const getMonthlyComparison = async (userId, months) => {
  const url = new URL(`${API_BASE_URL}/api/stats/monthly-comparison`);
  url.searchParams.set("userId", userId);
  url.searchParams.set("months", months);

  const res = await fetch(url.toString(), {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch monthly comparison");
  return await res.json();
};

// 5. Trip Spending (con categoría opcional)
export const getTripSpending = async (userId, category) => {
  const url = new URL(`${API_BASE_URL}/api/stats/trip-spending`);
  url.searchParams.set("userId", userId);
  if (category) url.searchParams.set("category", category);

  const res = await fetch(url.toString(), {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch trip spending");
  return await res.json();
};

// 6. Annual Summary (con desglose por categoría)
export const getAnnualSummary = async (userId, year) => {
  const url = new URL(`${API_BASE_URL}/api/stats/annual-summary`);
  url.searchParams.set("userId", userId);
  if (year) url.searchParams.set("year", year);

  const res = await fetch(url.toString(), {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch annual summary");
  return await res.json();
};
