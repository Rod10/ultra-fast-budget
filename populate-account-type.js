const AccountTypes = require("./express/constants/accountstypefull.js");
const accountTypeSrv = require("./express/services/accounttype.js");

const populateAccountType = async () => {
  for (const accountType of Object.values(AccountTypes)) {
    await accountTypeSrv.create(1, accountType);
  }
};

populateAccountType()
  .then(() => {
    console.log("Creation done");
    // eslint-disable-next-line no-process-exit
    process.exit(0);
  })
  .catch(err => {
    throw new Error(err);
  });
