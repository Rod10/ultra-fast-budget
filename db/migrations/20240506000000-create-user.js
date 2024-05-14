/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable("USER", {
    ID: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER(20),
    },
    CIVILITY: {
      allowNull: false,
      defaultValue: "MADAME",
      type: Sequelize.ENUM("MADAME", "MONSIEUR"),
    },
    FIRST_NAME: {
      allowNull: false,
      type: Sequelize.STRING(45),
    },
    LAST_NAME: {
      allowNull: false,
      type: Sequelize.STRING(45),
    },
    EMAIL: {
      allowNull: false,
      type: Sequelize.STRING(100),
      unique: true,
    },
    PASSWORD: {
      allowNull: false,
      type: Sequelize.STRING(100),
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

  down: (queryInterface, _Sequelize) => queryInterface.dropTable("USER"),
};
