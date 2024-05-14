    const Category = require("./category.js");
const SubCategories = require("./subcategories.js");

const SubCategoriesFull = Object.freeze({
  [SubCategories.FOOD]: {
    name: "Alimentation",
    imagePath: "food.png",
    parent: [Category.FOOD, Category.PET],
  },
  [SubCategories.RESTAURANT]: {
    name: "Restaurant",
    imagePath: "restaurant.png",
    parent: [Category.FOOD],
  },
  [SubCategories.BAR]: {
    name: "Bar",
    imagePath: "bar.png",
    parent: [Category.FOOD],
  },
  [SubCategories.SHOPPING]: {
    name: "Courses",
    imagePath: "shopping.png",
    parent: [Category.SHOPPING],
  },
  [SubCategories.CLOTHES]: {
    name: "Vêtements",
    imagePath: "clothes.png ",
    parent: [Category.SHOPPING],
  },
  [SubCategories.SHOES]: {
    name: "Chaussure",
    imagePath: "shoes.png",
    parent: [Category.SHOPPING],
  },
  [SubCategories.TECHNOLOGY]: {
    name: "Technologie",
    imagePath: "techo.png",
    parent: [Category.SHOPPING],
  },
  [SubCategories.GIFT]: {
    name: "Cadeaux",
    imagePath: "gift.png",
    parent: [Category.SHOPPING],
  },
  [SubCategories.TRANSPORT]: {
    name: "Transport",
    imagePath: "transport.png",
    parent: [Category.TRANSPORT, Category.TRAVEL],
  },
  [SubCategories.CAR]: {
    name: "Voiture",
    imagePath: "car.png",
    parent: [Category.TRANSPORT],
  },
  [SubCategories.FUEL]: {
    name: "Carburant",
    imagePath: "fuel.png",
    parent: [Category.TRANSPORT],
  },
  [SubCategories.INSURANCE]: {
    name: "Assurance",
    imagePath: "insurance.png",
    parent: [Category.TRANSPORT],
  },
  [SubCategories.ENTERTAINMENT]: {
    name: "Divertissement",
    imagePath: "entertainment.png",
    parent: [Category.ENTERTAINMENT],
  },
  [SubCategories.BOOKS]: {
    name: "Livres/Revues",
    imagePath: "books.png",
    parent: [Category.ENTERTAINMENT],
  },
  [SubCategories.HOUSE]: {
    name: "Maison",
    imagePath: "home.png",
    parent: [Category.HOME],
  },
  [SubCategories.RENT]: {
    name: "Loyer",
    imagePath: "rent.png",
    parent: [Category.HOME],
  },
  [SubCategories.ENERGYBILL]: {
    name: "Facture d'énergie",
    imagePath: "energybill.png",
    parent: [Category.HOME],
  },
  [SubCategories.WATERBILL]: {
    name: "Facture d'eau",
    imagePath: "waterbill.png",
    parent: [Category.HOME],
  },
  [SubCategories.PHONEBILL]: {
    name: "Facture téléphonique",
    imagePath: "phonebill.png",
    parent: [Category.HOME],
  },
  [SubCategories.FAMILY]: {
    name: "Famille",
    imagePath: "family.png",
    parent: [Category.FAMILY],
  },
  [SubCategories.KIDS]: {
    name: "Enfants",
    imagePath: "kids.png",
    parent: [Category.FAMILY],
  },
  [SubCategories.EDUCATION]: {
    name: "Education",
    imagePath: "education.png",
    parent: [Category.FAMILY],
  },
  [SubCategories.HEALTH]: {
    name: "Santé",
    imagePath: "health.png",
    parent: [Category.HEALTH, Category.PET],
  },
  [SubCategories.SPORT]: {
    name: "Sport",
    imagePath: "sport.png",
    parent: [Category.HEALTH],
  },
  [SubCategories.TRAVEL]: {
    name: "Voyage",
    imagePath: "travel.png",
    parent: [Category.TRAVEL],
  },
  [SubCategories.HOUSING]: {
    name: "Logement",
    imagePath: "home.png",
    parent: [Category.TRAVEL],
  },
  [SubCategories.OTHERS]: {
    name: "Autres",
    imagePath: "others.png",
    parent: [Category.OTHER],
  },
  [SubCategories.TAX]: {
    name: "Impôts",
    imagePath: "tax.png",
    parent: [Category.OTHER],
  },
  [SubCategories.CIGARETTE]: {
    name: "Cigarettes",
    imagePath: "cigarettes.png",
    parent: [Category.OTHER],
  },
});

module.exports = SubCategoriesFull;
