export default class Category {
  constructor({ categoryId = null, name = "", isDefault = false }) {
    this.categoryId = categoryId;
    this.name = name;
    this.isDefault = isDefault;
  }
}
