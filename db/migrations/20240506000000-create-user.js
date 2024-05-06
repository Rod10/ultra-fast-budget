'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable("USER", {
    ID: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER(20),
    },
    FIRST_NAME: {
      allowNull: false,
      type: Sequelize.STRING(45),
    },
    LAST_NAME: {
      allowNull: false,
      type: Sequelize.STRING(45),
    },
    EMAIL: {
      allowNull: false,
      type: Sequelize.STRING(100),
      unique: true,
    },
    PASSWORD: {
      allowNull: true,
      type: Sequelize.STRING(100),
    },
    PHONE: {
      allowNull: false,
      type: Sequelize.STRING(45),
    },
    STATE: {
      allowNull: false,
      defaultValue: "ACTIVE",
      type: Sequelize.ENUM("CREATED", "ACTIVE", "INACTIVE", "DELETED"),
    },
    CREATION_DATE: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),

  down: (queryInterface, _Sequelize) => queryInterface.dropTable("USER"),
};
