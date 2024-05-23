const config = require("../config.json");

Object.keys(config.database)
  .forEach(env => {
    config.database[env].define = {underscored: true};
  });

module.exports = config.database;
