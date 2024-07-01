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
    ACCOUNT_ID: {
      allowNull: false,
      onDelete: "CASCADE",
      references: {
        model: "ACCOUNT",
        key: "ID",
      },
      type: Sequelize.INTEGER(20),
    },
    DATA: {type: Sequelize.TEXT},
    TO: {
      allowNull: true,
      type: Sequelize.TEXT,
    },
    OTHER: {
      allowNull: true,
      type: Sequelize.TEXT,
    },
    TRANSACTION_DATE: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    TYPE: {
      allowNull: false,
      defaultValue: "EXPENSE",
      type: Sequelize.ENUM("INCOME", "EXPECTED_INCOME", "EXPENSE", "EXPECTED_EXPENSE", "TRANSFER", "EXPECTED_TRANSFERT", "INTEREST"),
    },
    CREATION_DATE: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    MODIFICATION_DATE: {
      allowNull: true,
      type: Sequelize.DATE,
    },
    DELETED_ON: {
      allowNull: true,
      type: Sequelize.DATE,
    },
  }),

  down: (queryInterface, _Sequelize) => queryInterface.dropTable("TRANSACTION"),
};
