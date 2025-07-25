export default class Trip {
  constructor({
    tripId = null,
    name = "",
    destination = "",
    startDate = "",
    endDate = "",
    estimatedBudget = null,
    notes = "",
    tags = [],
  }) {
    this.tripId = tripId;
    this.name = name;
    this.destination = destination;
    this.startDate = startDate;
    this.endDate = endDate;
    this.estimatedBudget = estimatedBudget;
    this.notes = notes;
    this.tags = tags; // array de strings (ej: ["Playa", "Erasmus", "Italia"])
  }
}
