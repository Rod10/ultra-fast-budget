const AccountsTypes = require("./accountstype.js");

const AccounstTypesFull = {
  [AccountsTypes.WALLET]: {
    label: "Portefeuille",
    type: "WALLET",
    className: "is-danger is-light",
    color: "#cc0f35",
    interest: 0,
    maxAmount: 0,
  },
  [AccountsTypes.COURANT]: {
    label: "Compte courant",
    type: "COURANT",
    className: "is-white",
    color: "#638d5c",
    interest: 0,
    maxAmount: 0,
  },
  [AccountsTypes.LIVRETA]: {
    label: "Livret A",
    type: "LIVRETA",
    className: "is-black",
    color: "#000000",
    interest: 3,
    maxAmount: 22950,
  },
  [AccountsTypes.LDDS]: {
    label: "Livret de développement durable et solidaire",
    type: "LDDS",
    className: "is-light",
    color: "#888888",
    interest: 3,
    maxAmount: 12000,
  },
  [AccountsTypes.LEP]: {
    label: "Livret dépargne populaire",
    type: "LEP",
    className: "is-warning",
    color: "#FFE08AFF",
    interest: 5,
    maxAmount: 10000,
  },
  [AccountsTypes.LIVRETJ]: {
    label: "Livret jeune",
    type: "LIVRETJ",
    className: "is-primary",
    color: "#00D1B2FF",
    interest: 3,
    maxAmount: 1600,
  },
  [AccountsTypes.CEL]: {
    label: "Compte épargne logement",
    type: "CEL",
    className: "is-link",
    color: "#485FC7FF",
    interest: 2,
    maxAmount: 15300,
  },
  [AccountsTypes.PEL]: {
    label: "Plan épargne logement",
    type: "PEL",
    className: ".is-link.is-light",
    color: "#a974ff",
    interest: 2,
    maxAmount: 61200,
  },
  [AccountsTypes.PERP]: {
    label: "Plan épargne retraite populaire",
    type: "PERP",
    className: "is-info",
    color: "#3E8ED0FF",
    interest: 2,
    maxAmount: 0,
  },
  [AccountsTypes.CSL]: {
    label: "Compte sur livret",
    type: "CSL",
    className: "is-success",
    color: "#48C78EFF",
    interest: 0,
    maxAmount: 0,
  },

};

module.exports = AccounstTypesFull;
