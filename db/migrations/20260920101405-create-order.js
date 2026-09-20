/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable("ORDER", {
    ID: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER(20),
    },
    PORTFOLIO_ID: {
      allowNull: false,
      onDelete: "CASCADE",
      references: {
        model: "PORTFOLIO",
        key: "ID",
      },
      type: Sequelize.INTEGER(20),
    },
    TYPE: {
      allowNull: false,
      defaultValue: "ORDER",
      type: Sequelize.ENUM("ORDER", "DIVIDEND", "INTEREST"),
    },
    QUANTITY: {
      allowNull: false,
      type: Sequelize.DECIMAL(15, 2),
    },
    CURRENT_PRICE: {
      allowNull: false,
      type: Sequelize.DECIMAL(15, 2),
    },
    FEES: {
      allowNull: true,
      type: Sequelize.DECIMAL(15, 2),
    },
    INVESTED_AMOUNT: {
      allowNull: false,
      type: Sequelize.DECIMAL(15, 2),
    },
    CREATION_DATE: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    MODIFICATION_DATE: {
      allowNull: true,
      type: Sequelize.DATE,
    },
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable("ORDER"),
};
