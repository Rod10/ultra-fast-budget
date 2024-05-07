const generateMigration = require("./addvaluestoenum.js");

const tableName = "HABILITATION";
const columnName = "LEVEL";
module.exports = generateMigration(tableName, columnName);
