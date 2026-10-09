/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable("LAST_REFERENCE", {
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
    DIVIDEND: {
      allowNull: true,
      type: Sequelize.STRING(45),
    },
    ORDER: {
      allowNull: true,
      type: Sequelize.STRING(45),
    },
    TRANSACTION: {
      allowNull: true,
      type: Sequelize.STRING(45),
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
  down: (queryInterface, Sequelize) => queryInterface.dropTable("LAST_REFERENCE"),
};
