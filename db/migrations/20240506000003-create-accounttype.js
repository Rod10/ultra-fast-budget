/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable("ACCOUNT_TYPE", {
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
    TYPE: {
      allowNull: false,
      type: Sequelize.STRING(45),
    },
    COLOR: {
      allowNull: false,
      type: Sequelize.STRING(45),
    },
    CLASS_NAME: {
      allowNull: false,
      type: Sequelize.STRING(45),
    },
    INTEREST: {
      allowNull: false,
      type: Sequelize.FLOAT,
    },
    UNIT: {
      allowNull: false,
      defaultValue: "MONTH",
      type: Sequelize.ENUM("YEAR", "MONTH", "WEEK", "DAY"),
    },
    MAX_AMOUNT: {
      allowNull: false,
      type: Sequelize.FLOAT,
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

  down: (queryInterface, _Sequelize) => queryInterface.dropTable("ACCOUNT_TYPE"),
};
