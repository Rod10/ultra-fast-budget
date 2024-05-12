const Category = require("./category.js");

const CategoryFull = Object.freeze({
  [Category.FOOD]: {
    name: "Alimentations",
    type: Category.FOOD,
    imagePath: "food.png",
  },
  [Category.SHOPPING]: {
    name: "Courses",
    type: Category.SHOPPING,
    imagePath: "shopping.png",
  },
  [Category.TRANSPORT]: {
    name: "Transport",
    type: Category.TRANSPORT,
    imagePath: "transport.png",
  },
  [Category.ENTERTAINMENT]: {
    name: "Divertissement",
    type: Category.ENTERTAINMENT,
    imagePath: "entertainment.png",
  },
  [Category.HOME]: {
    name: "Maison",
    type: Category.HOME,
    imagePath: "home.png",
  },
  [Category.FAMILY]: {
    name: "Famille",
    type: Category.FAMILY,
    imagePath: "family.png",
  },
  [Category.HEALTH]: {
    name: "Santé/Sport",
    type: Category.HEALTH,
    imagePath: "health.png",
  },
  [Category.TRAVEL]: {
    name: "Voyage",
    type: Category.TRAVEL,
    imagePath: "travel.png",
  },
  [Category.OTHER]: {
    name: "Autre",
    type: Category.OTHER,
    imagePath: "other.png",
  },
});

module.exports = CategoryFull;
