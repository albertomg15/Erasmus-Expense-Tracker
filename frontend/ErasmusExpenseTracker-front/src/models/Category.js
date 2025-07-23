export default class Category {
  constructor({ categoryId = null, name = "", isDefault = false, emoji = "" }) {
    this.categoryId = categoryId;
    this.name = name;
    this.isDefault = isDefault;
    this.emoji = emoji;
  }
}
