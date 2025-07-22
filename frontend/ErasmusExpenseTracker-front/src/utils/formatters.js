// src/utils/formatters.js

export function formatCurrency(amount, currency = "EUR") {
  if (amount == null || isNaN(amount)) return "-";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
