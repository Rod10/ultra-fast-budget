const Category = require("./category.js");
const CategoryGenre = require("./categorygenre.js");

const CategoryFull = Object.freeze({
  [Category.FOOD]: {
    name: "Alimentations",
    type: Category.FOOD,
    imagePath: "food.png",
    genre: CategoryGenre.OUTCOME,
  },
  [Category.SHOPPING]: {
    name: "Courses",
    type: Category.SHOPPING,
    imagePath: "shopping.png",
    genre: CategoryGenre.OUTCOME,
  },
  [Category.TRANSPORT]: {
    name: "Transport",
    type: Category.TRANSPORT,
    imagePath: "transport.png",
    genre: CategoryGenre.OUTCOME,
  },
  [Category.ENTERTAINMENT]: {
    name: "Divertissement",
    type: Category.ENTERTAINMENT,
    imagePath: "entertainment.png",
    genre: CategoryGenre.OUTCOME,
  },
  [Category.HOME]: {
    name: "Maison",
    type: Category.HOME,
    imagePath: "home.png",
    genre: CategoryGenre.OUTCOME,
  },
  [Category.FAMILY]: {
    name: "Famille",
    type: Category.FAMILY,
    imagePath: "family.png",
    genre: CategoryGenre.OUTCOME,
  },
  [Category.HEALTH]: {
    name: "Santé/Sport",
    type: Category.HEALTH,
    imagePath: "health.png",
    genre: CategoryGenre.OUTCOME,
  },
  [Category.TRAVEL]: {
    name: "Voyage",
    type: Category.TRAVEL,
    imagePath: "travel.png",
    genre: CategoryGenre.OUTCOME,
  },
  [Category.OTHER]: {
    name: "Autre (Dépenses)",
    type: Category.OTHER,
    imagePath: "other.png",
    genre: CategoryGenre.OUTCOME,
  },
  [Category.OTHER_INCOME]: {
    name: "Autre (Revenus)",
    type: Category.OTHER_INCOME,
    imagePath: "other_income.png",
    genre: CategoryGenre.INCOME,
  },
  [Category.FINANCIAL]: {
    name: "Revenus financier",
    type: Category.FINANCIAL,
    imagePath: "financial.png",
    genre: CategoryGenre.INCOME,
  },
  [Category.INCOME]: {
    name: "Revenus",
    type: Category.INCOME,
    imagePath: "income.png",
    genre: CategoryGenre.INCOME,
  },
});

module.exports = CategoryFull;
