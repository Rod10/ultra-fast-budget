const homepage = {
  label: "Vue d'ensemble",
  logo: "/images/svg/home_operation.svg",
  routes: "/",
};

const summary = {
  label: "Sommaire",
  logo: "/images/icons/worker.svg",
  routes: "/summary",
};

const transactions = {
  label: "Transactions",
  logo: "/images/svg/home_suivi.svg",
  routes: "/transaction",
};

const transactionsPlanified = {
  label: "Transactions Planifiées",
  logo: "/images/svg/home_suivi.svg",
  routes: "/transaction-planified",
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
  routes: "/debt",
};

const chart = {
  label: "Graphiques",
  logo: "/images/svg/home_suivi.svg",
  routes: [
    {
      label: "Catégories",
      href: "/category",
    },
    {
      label: "Temps",
      href: "/time",
    },
    {
      label: "Futur",
      href: "/future",
    },
    {
      label: "Prévisions",
      href: "/forecasts",
    },
  ],
};

module.exports = {
  homepage,
  summary,
  transactions,
  transactionsPlanified,
  account,
  budget,
  debt,
  chart,
};
