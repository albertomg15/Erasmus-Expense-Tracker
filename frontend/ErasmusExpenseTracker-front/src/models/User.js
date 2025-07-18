export default class User {
  constructor({
    userId,
    email,
    passwordHash,
    preferredCurrency,
    language,
    transactions = [],
    trips = [],
    budgets = []
  }) {
    this.userId = userId;
    this.email = email;
    this.passwordHash = passwordHash; // solo si se usa localmente, nunca guardar esto en el front
    this.preferredCurrency = preferredCurrency;
    this.language = language;

    this.transactions = transactions; // Array de objetos Transaction
    this.trips = trips;               // Array de objetos Trip
    this.budgets = budgets;           // Array de objetos Budget
  }

  displayName() {
    return this.email.split('@')[0];
  }
}
