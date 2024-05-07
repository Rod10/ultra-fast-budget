const getSocietyIds = require("./getsocietyids.js");

const addDocuments = (newDocuments, queryInterface) => getSocietyIds(queryInterface)
  .then(results => {
    const newDate = new Date();
    const entries = results.reduce((acc, society) => acc.concat(newDocuments.map(newDocument => ({
      SOCIETY_ID: society.ID,
      NAME: newDocument.name,
      DISPLAY_NAME: newDocument.displayName,
      TYPE: newDocument.type,
      TEMPLATE: newDocument.template,
      CREATION_DATE: newDate,
    }))), []);
    return queryInterface.bulkInsert("DOCUMENT_TYPE", entries);
  });

const removeDocuments = (newDocuments, queryInterface) => queryInterface.bulkDelete(
  "DOCUMENT_TYPE",
  {TYPE: newDocuments.map(newDocument => newDocument.type)},
);

module.exports = {
  addDocuments,
  removeDocuments,
  full: newDocuments => ({
    up: queryInterface => addDocuments(newDocuments, queryInterface),
    down: queryInterface => removeDocuments(newDocuments, queryInterface),
  }),
};
