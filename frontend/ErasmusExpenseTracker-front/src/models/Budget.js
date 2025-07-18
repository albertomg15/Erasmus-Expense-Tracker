export default class Budget {
  constructor({ budgetId, month, year, maxSpending, warningThreshold, user }) {
    this.budgetId = budgetId;
    this.month = month;
    this.year = year;
    this.maxSpending = parseFloat(maxSpending);
    this.warningThreshold = warningThreshold ? parseFloat(warningThreshold) : null;
    this.user = user || null; // Aquí podrías convertirlo en instancia de User si lo necesitas
  }

  isThresholdSet() {
    return this.warningThreshold !== null;
  }

  formattedPeriod() {
    return `${this.month}/${this.year}`;
  }
}
