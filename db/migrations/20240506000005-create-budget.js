/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable("BUDGET", {
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
    TOTAL_AMOUNT: {
      allowNull: false,
      type: Sequelize.FLOAT,
    },
    TOTAL_ALLOCATED_AMOUNT: {
      allowNull: false,
      type: Sequelize.FLOAT,
    },
    DURATION: {
      allowNull: false,
      type: Sequelize.INTEGER(20),
    },
    UNIT: {
      allowNull: false,
      defaultValue: "MONTH",
      type: Sequelize.ENUM("YEAR", "MONTH", "WEEK", "DAY"),
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
    DATA: {type: Sequelize.TEXT},
    CREATION_DATE: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    MODIFICATION_DATE: {
      allowNull: true,
      type: Sequelize.DATE,
    },
  }),

  down: (queryInterface, _Sequelize) => queryInterface.dropTable("BUDGET"),
};
