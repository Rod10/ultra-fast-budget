'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable("TRANSACTION", {
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
    CATEGORY_ID: {
      allowNull: false,
      onDelete: "CASCADE",
      references: {
        model: "CATEGORY",
        key: "ID",
      },
      type: Sequelize.INTEGER(20),
    },
    SUBCATEGORY_ID: {
      allowNull: false,
      onDelete: "CASCADE",
      references: {
        model: "SUBCATEGORY",
        key: "ID",
      },
      type: Sequelize.INTEGER(20),
    },
    AMOUNT: {
      allowNull: false,
      type: Sequelize.FLOAT,
    },
    ACCOUNT_ID: {
      allowNull: false,
      onDelete: "CASCADE",
      references: {
        model: "ACCOUNT",
        key: "ID",
      },
      type: Sequelize.INTEGER(20),
    },
    TO: {
      allowNull: true,
      type: Sequelize.TEXT
    },
    OTHER: {
      allowNull: true,
      type: Sequelize.TEXT
    },
    TRANSACTION_TYPE: {
      allowNull: false,
      defaultValue: "EXPENSE",
      type: Sequelize.ENUM("INCOME", "EXPENSE", "EXPECTED_EXPENSE", "TRANSFER", "EXPECTED_TRANSFERT"),
    },
    CREATION_DATE: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),

  down: (queryInterface, _Sequelize) => queryInterface.dropTable("TRANSACTION"),
};
