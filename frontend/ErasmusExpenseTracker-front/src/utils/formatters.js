// src/utils/formatters.js

export function formatCurrency(amount, currencyCode = "EUR") {
  const symbol = getCurrencySymbol(currencyCode.toUpperCase());
  const formatted = Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${formatted}${symbol}`;
}

export function formatAmountOnly(amount) {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}



export function getCurrencySymbol(code) {
  if (!code || typeof code !== "string") return ""; // fallback seguro

  switch (code.toUpperCase()) {
    case "EUR":
      return "€";
    case "USD":
      return "$";
    case "GBP":
      return "£";
    case "JPY":
      return "¥";
    case "CHF":
      return "CHF";
    case "CAD":
      return "$";
    case "MXN":
      return "$";
    case "PLN":
      return "zł";
    default:
      return code.toUpperCase(); // fallback: mostrar el código
  }
}
