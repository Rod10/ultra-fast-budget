const AccountsTypes = require("./accountstype.js");

const AccounstTypesFull = {
  [AccountsTypes.WALLET]: {
    label: "Portefeuille",
    type: "WALLET",
    className: "is-danger is-light",
    maxAmount: 0,
  },
  [AccountsTypes.COURANT]: {
    label: "Compte courant",
    type: "COURANT",
    className: "is-white",
    maxAmount: 0,
  },
  [AccountsTypes.LIVRETA]: {
    label: "Livret A",
    type: "LIVRETA",
    className: "is-black",
    maxAmount: 22950,
  },
  [AccountsTypes.LDDS]: {
    label: "Livret de développement durable et solidaire",
    type: "LDDS",
    className: "is-light",
    maxAmount: 12000,
  },
  [AccountsTypes.LEP]: {
    label: "Livret dépargne populaire",
    type: "LEP",
    className: "is-warning",
    maxAmount: 10000,
  },
  [AccountsTypes.LIVRETJ]: {
    label: "Livret jeune",
    type: "LIVRETJ",
    className: "is-primary",
    maxAmount: 1600,
  },
  [AccountsTypes.CEL]: {
    label: "Compte épargne logement",
    type: "CEL",
    className: "is-link",
    maxAmount: 15300,
  },
  [AccountsTypes.PEL]: {
    label: "Plan épargne logement",
    type: "PEL",
    className: ".is-link.is-light",
    maxAmount: 61200,
  },
  [AccountsTypes.PERP]: {
    label: "Plan épargne retraite populaire",
    type: "PERP",
    className: "is-info",
    maxAmount: 0,
  },
  [AccountsTypes.CSL]: {
    label: "Compte sur livret",
    type: "CSL",
    className: "is-success",
    maxAmount: 0,
  },

};

module.exports = AccounstTypesFull;
