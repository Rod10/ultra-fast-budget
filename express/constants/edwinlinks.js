const operations = {
  label: "OPÉRATIONS",
  logo: "/images/svg/home_operation.svg",
  routes: [
    {
      label: "Nouvelle opération",
      href: "/society/operation/new",
    },
    {
      label: "Historique",
      href: "/society/dashboard",
    },
  ],
};

const operators = {
  label: "LISTE D'OPÉRATEURS",
  logo: "/images/icons/worker.svg",
  routes: [
    {
      label: "Liste des opérateurs / Ajout",
      href: "/society/operator/",
      query: new URLSearchParams({hasLeaved: false}).toString(),
    },
    {
      label: "Archive",
      href: "/society/operator/",
      query: new URLSearchParams({hasLeaved: true}).toString(),
    },
    {
      label: "Transfert",
      href: "/society/operator/transfer",
    },
  ],
};

const monitoring = {
  label: "SUIVI",
  logo: "/images/svg/home_suivi.svg",
  routes: [
    {
      label: "Tableau de bord",
      href: "/society/dashboard",
    },
    {
      label: "Travaux en cours",
      href: "/society/dashboard",
    },
  ],
};

const statistic = {
  label: "Statistique",
  logo: "/images/svg/home_suivi.svg",
  routes: [
    {
      label: "Consultation",
      href: "/society/stats",
    },
  ],
};

module.exports = {
  operations,
  operators,
  monitoring,
  statistic,
};
