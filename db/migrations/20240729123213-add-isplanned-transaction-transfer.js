module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "TRANSACTION",
      "IS_PLANNED",
      {
        allowNull: true,
        type: Sequelize.INTEGER(20),
      },
    );
    await queryInterface.addColumn(
      "TRANSFER",
      "IS_PLANNED",
      {
        allowNull: true,
        type: Sequelize.BOOL,
      },
    );
  },
  down: async queryInterface => {
    await queryInterface.removeColumn("TRANSACTION", "IS_PLANNED");
    await queryInterface.removeColumn("TRANSFER", "IS_PLANNED");
  },
};
