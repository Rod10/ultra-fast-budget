const generateMigration = require("./addvaluestoenum.js");

const tableName = "SOCIETY_OPTION";
const columnName = "NAME";
module.exports = generateMigration(tableName, columnName);
