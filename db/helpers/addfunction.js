const getSocietyIds = require("./getsocietyids.js");

const addFunctions = (newFunctions, queryInterface) => getSocietyIds(queryInterface)
  .then(results => {
    const newDate = new Date();
    const entries = results.reduce((acc, society) => acc.concat(newFunctions.map(newFunction => ({
      SOCIETY_ID: society.ID,
      NAME: newFunction.name,
      POSITION: newFunction.position,
      CREATION_DATE: newDate,
    }))), []);
    return queryInterface.bulkInsert("FUNCTION", entries);
  });

const removeFunctions = (newFunctions, queryInterface) => queryInterface.bulkDelete(
  "FUNCTION",
  {POSITION: newFunctions.map(newFunction => newFunction.position)},
);

module.exports = {
  addFunctions,
  removeFunctions,
  full: newFunctions => ({
    up: queryInterface => addFunctions(newFunctions, queryInterface),
    down: queryInterface => removeFunctions(newFunctions, queryInterface),
  }),
};
