/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable("CATEGORY", {
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
    GENRE: {
      allowNull: false,
      defaultValue: "INCOME",
      type: Sequelize.ENUM("INCOME", "OUTCOME"),
    },
    NAME: {
      allowNull: false,
      type: Sequelize.STRING(45),
    },
    TYPE: {
      allowNull: false,
      type: Sequelize.STRING(45),
    },
    IMAGE_PATH: {
      allowNull: false,
      type: Sequelize.TEXT,
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

  down: (queryInterface, _Sequelize) => queryInterface.dropTable("CATEGORY"),
};
