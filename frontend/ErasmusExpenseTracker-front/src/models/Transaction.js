export default class Transaction {
  constructor({
    transactionId,
    type,
    amount,
    currency,
    category,
    date,
    description,
    user,
    trip
  }) {
    this.transactionId = transactionId;
    this.type = type; // 'INCOME' o 'EXPENSE'
    this.amount = parseFloat(amount);
    this.currency = currency;
    this.category = category;
    this.date = new Date(date);
    this.description = description || '';
    this.user = user || null; // Puede ser un ID o un objeto User
    this.trip = trip || null; // Puede ser un ID o un objeto Trip
  }

  isIncome() {
    return this.type === 'INCOME';
  }

  isExpense() {
    return this.type === 'EXPENSE';
  }

  formattedAmount() {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }
}
