import { API_BASE_URL, getAuthHeaders } from "./config";

/**
 * Convierte una cantidad de una moneda a otra usando la API backend.
 */
export const convertCurrency = async ({ amount, fromCurrency, toCurrency }) => {
  const res = await fetch(`${API_BASE_URL}/api/exchange-rates/convert`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      fromCurrency,
      toCurrency,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Currency conversion failed: ${res.status} - ${text}`);
  }

  return res.json();
};

/**
 * Obtiene la lista de monedas soportadas por la aplicación.
 */
export const getSupportedCurrencies = async () => {
  const res = await fetch(`${API_BASE_URL}/api/currencies`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch supported currencies: ${res.status} - ${text}`);
  }

  return res.json(); // Lista tipo ["EUR", "USD", "GBP", ...]
};
