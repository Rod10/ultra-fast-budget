const fs = require("fs");
const path = require("path");

const AccountTypes = require("./express/constants/accountstype.js");
const Civilities = require("./express/constants/civilities.js");

const userSrv = require("./express/services/user.js");
const accountSrv = require("./express/services/account.js");

const createUser = async () => {
  const user = await userSrv.create({
    firstName: "Erwan",
    lastName: "Billy",
    password: "12345678",
    confirmation: "12345678",
    email: "erwan.billy@hotmail.fr",
    civility: Civilities.MONSIEUR.long,
  });

  const walletAccount = await accountSrv.create(user.id, {
    name: "Portefeuille",
    initialBalance: 60,
    currency: "EUR",
    type: AccountTypes.WALLET,
  });

  const currentAccount = await accountSrv.create(user.id, {
    name: "Compte Courant",
    initialBalance: 2432.54,
    currency: "EUR",
    type: AccountTypes.COURANT,
  });

  const livretA = await accountSrv.create(user.id, {
    name: "Livret A",
    initialBalance: 23068.30,
    currency: "EUR",
    type: AccountTypes.LIVRETA,
  });

  const lepAccount = await accountSrv.create(user.id, {
    name: "LEP",
    initialBalance: 4530.0,
    currency: "EUR",
    type: AccountTypes.LEP,
  });

  const pelAccount = await accountSrv.create(user.id, {
    name: "PEL",
    initialBalance: 3268.27,
    currency: "EUR",
    type: AccountTypes.PEL,
  });

  const accounts = {
    walletAccount,
    currentAccount,
    livretA,
    lepAccount,
    pelAccount,
  };

  return {user, accounts};
};

createUser()
  .then(() => {
    console.log("Creation done");
    // eslint-disable-next-line no-process-exit
    process.exit(0);
  })
  .catch(err => {
    throw new Error(err);
  });
