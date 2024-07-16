const homepage = {
  label: "Vue d'ensemble",
  logo: "/images/svg/home_operation.svg",
  routes: "/",
};

const transactions = {
  label: "Transactions",
  logo: "/images/svg/home_suivi.svg",
  routes: "/transaction",
};

const transactionsPlanified = {
  label: "Transactions Planifiées",
  logo: "/images/svg/home_suivi.svg",
  routes: "/planned-transaction",
};

const account = {
  label: "Comptes",
  logo: "/images/svg/home_suivi.svg",
  routes: "/account",
};

const budget = {
  label: "Budgets",
  logo: "/images/svg/home_suivi.svg",
  routes: "/budget",
};

const debt = {
  label: "Dettes",
  logo: "/images/svg/home_suivi.svg",
  routes: "/#",
};

const chart = {
  label: "Graphiques",
  logo: "/images/svg/home_suivi.svg",
  routes: [
    {
      label: "Catégories",
      href: "/graphics/category",
    },
    {
      label: "Temps",
      href: "/graphics/time",
    },
    {
      label: "Futur",
      href: "/graphics/future",
    },
    {
      label: "Prévisions",
      href: "/graphics/forecasts",
    },
  ],
};

module.exports = {
  homepage,
  transactions,
  transactionsPlanified,
  account,
  budget,
  debt,
  chart,
};
