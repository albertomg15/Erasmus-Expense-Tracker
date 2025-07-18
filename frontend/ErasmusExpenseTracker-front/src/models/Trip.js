export default class Trip {
  constructor({
    tripId,
    name,
    destination,
    startDate,
    endDate,
    user,
    transactions = []
  }) {
    this.tripId = tripId;
    this.name = name;
    this.destination = destination;
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
    this.user = user || null; // Puede ser un ID o un objeto User
    this.transactions = transactions; // Array de objetos Transaction
  }

  durationInDays() {
    const diff = this.endDate - this.startDate;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  isOngoing() {
    const today = new Date();
    return today >= this.startDate && today <= this.endDate;
  }
}
