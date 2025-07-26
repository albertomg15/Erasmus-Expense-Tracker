export default class CurrencyConversionResult {
  constructor({ originalAmount, fromCurrency, toCurrency, convertedAmount, exchangeRate }) {
    this.originalAmount = parseFloat(originalAmount);
    this.fromCurrency = fromCurrency;
    this.toCurrency = toCurrency;
    this.convertedAmount = parseFloat(convertedAmount);
    this.exchangeRate = parseFloat(exchangeRate);
  }

  formattedResult() {
    return `${this.originalAmount} ${this.fromCurrency} = ${this.convertedAmount.toFixed(2)} ${this.toCurrency} (Rate: ${this.exchangeRate.toFixed(4)})`;
  }

  getRateLabel() {
    return `1 ${this.fromCurrency} = ${this.exchangeRate.toFixed(4)} ${this.toCurrency}`;
  }
}
