/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable("TRANSFER", {
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
    SENDER_ID: {
      allowNull: false,
      onDelete: "CASCADE",
      references: {
        model: "ACCOUNT",
        key: "ID",
      },
      type: Sequelize.INTEGER(20),
    },
    RECEIVER_ID: {
      allowNull: false,
      onDelete: "CASCADE",
      references: {
        model: "ACCOUNT",
        key: "ID",
      },
      type: Sequelize.INTEGER(20),
    },
    AMOUNT: {
      allowNull: true,
      type: Sequelize.TEXT,
    },
    OTHER: {
      allowNull: true,
      type: Sequelize.TEXT,
    },
    TRANSFER_DATE: {
      allowNull: false,
      type: Sequelize.DATE,
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

  down: (queryInterface, _Sequelize) => queryInterface.dropTable("TRANSFER"),
};
