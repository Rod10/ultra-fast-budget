/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable("PORTFOLIO", {
    ID: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
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
    MONTHLY_CONTRIBUTION: {
      allowNull: false,
      type: Sequelize.DECIMAL(15, 2),
    },
    NEED_DECIDE: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: false,
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
  down: (queryInterface, _Sequelize) => queryInterface.dropTable("PORTFOLIO"),
};
