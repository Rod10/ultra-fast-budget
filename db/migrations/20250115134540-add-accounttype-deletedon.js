module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "ACCOUNT_TYPE",
      "DELETED_ON",
      {
        allowNull: true,
        type: Sequelize.DATE,
      },
    );
  },
  down: async queryInterface => {
    await queryInterface.removeColumn("ACCOUNT_TYPE", "DELETED_ON");
  },
};
