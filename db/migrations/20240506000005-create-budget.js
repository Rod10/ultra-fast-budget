'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable("BUGDET", {
    ID: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER(20),
    },
    NAME: {
      allowNull: false,
      type: Sequelize.STRING(45),
    },
    TOTAL_AMOUNT: {
      allowNull: false,
      type: Sequelize.INTEGER(100)
    },
    DATA: {type: Sequelize.TEXT},
    CREATION_DATE: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),

  down: (queryInterface, _Sequelize) => queryInterface.dropTable("BUGDET"),
};
