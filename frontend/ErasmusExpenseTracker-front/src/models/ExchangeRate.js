export default class ExchangeRate {
  constructor({ rateId, fromCurrency, toCurrency, rate, date }) {
    this.rateId = rateId;
    this.fromCurrency = fromCurrency;
    this.toCurrency = toCurrency;
    this.rate = parseFloat(rate);
    this.date = new Date(date); // LocalDate desde backend (yyyy-MM-dd)
  }

  isExpired(days = 1) {
    const now = new Date();
    const diffMs = now - this.date;
    return diffMs > days * 24 * 60 * 60 * 1000;
  }

  formattedRate() {
    return `${this.fromCurrency} → ${this.toCurrency}: ${this.rate.toFixed(4)}`;
  }
}
