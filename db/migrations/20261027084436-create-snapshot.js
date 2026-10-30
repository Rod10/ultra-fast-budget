/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable("SNAPSHOT", {
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
    YEAR: {
      allowNull: false,
      type: Sequelize.INTEGER(20),
    },
    START_BALANCE: {
      allowNull: true,
      type: Sequelize.DECIMAL(15, 2),
    },
    END_BALANCE: {
      allowNull: true,
      type: Sequelize.DECIMAL(15, 2),
    },
    TOTAL_GAIN: {
      allowNull: true,
      type: Sequelize.DECIMAL(15, 2),
    },
    NET_GAIN: {
      allowNull: true,
      type: Sequelize.DECIMAL(15, 2),
    },
    INTEREST_GAIN: {
      allowNull: true,
      type: Sequelize.DECIMAL(15, 2),
    },
    DIVIDEND_GAIN: {
      allowNull: true,
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
  down: (queryInterface, Sequelize) => queryInterface.dropTable("SNAPSHOT"),
};
