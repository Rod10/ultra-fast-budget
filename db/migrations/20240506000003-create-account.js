'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable("ACCOUNT", {
    ID: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER(20),
    },
    USER_ID: {
      allowNull: false,
      onDelete: "CASCADE",
      references: {
        model: "USER",
        key: "ID",
      },
      type: Sequelize.INTEGER(20),
    },
    NAME: {
      allowNull: false,
      type: Sequelize.STRING(45),
    },
    BALANCE: {
      allowNull: false,
      type: Sequelize.FLOAT,
    },
    CREATION_DATE: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),

  down: (queryInterface, _Sequelize) => queryInterface.dropTable("ACCOUNT"),
};
