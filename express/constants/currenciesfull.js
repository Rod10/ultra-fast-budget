const Currencies = require("./currencies.js");

const Currenciesfull = {
  [Currencies.EUR]: {
    name: "Euro",
    sign: "€",
    countries: [],
  },
  [Currencies.USD]: {
    name: "United States dollar",
    sign: "$",
    countries: [],
  },
  [Currencies.CNY]: {
    name: "Renminbi",
    sign: "CN¥",
    countries: [],
  },
  [Currencies.JPY]: {
    name: "Japanese yen",
    sign: "JP¥",
    countries: [],
  },
};

module.exports = Currenciesfull;
