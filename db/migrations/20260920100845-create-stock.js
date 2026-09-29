/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable("STOCK", {
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
    TICKER: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    ISIN: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    NAME: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    CURRENT_PRICE: {
      allowNull: false,
      type: Sequelize.DECIMAL(15, 2),
    },
    AVERAGE: {
      allowNull: false,
      type: Sequelize.DECIMAL(15, 2),
    },
    QUANTITY: {
      allowNull: false,
      type: Sequelize.DECIMAL(15, 2),
    },
    INVESTED_AMOUNT: {
      allowNull: false,
      type: Sequelize.DECIMAL(15, 2),
    },
    DIVIDENDS_RECEIVED: {
      allowNull: false,
      type: Sequelize.DECIMAL(15, 2),
    },
    WEIGHT: {
      allowNull: true,
      type: Sequelize.DECIMAL(15, 2),
    },
    TARGET_WEIGHT: {
      allowNull: true,
      type: Sequelize.DECIMAL(15, 2),
    },
    BOUGHT_THIS_YEAR: {
      allowNull: true,
      type: Sequelize.BOOLEAN,
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
  down: (queryInterface, Sequelize) => queryInterface.dropTable("STOCK"),
};
