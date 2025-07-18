export default class ExchangeRate {
  constructor({ rateId, fromCurrency, toCurrency, rate, timestamp }) {
    this.rateId = rateId;
    this.fromCurrency = fromCurrency;
    this.toCurrency = toCurrency;
    this.rate = parseFloat(rate);
    this.timestamp = new Date(timestamp);
  }

  isExpired(minutes = 60) {
    const now = new Date();
    const diffMs = now - this.timestamp;
    return diffMs > minutes * 60 * 1000;
  }

  formattedRate() {
    return `${this.fromCurrency} → ${this.toCurrency}: ${this.rate.toFixed(4)}`;
  }
}
