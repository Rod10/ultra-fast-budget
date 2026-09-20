module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "ACCOUNT_TYPE",
      "IS_PORTFOLIO",
      {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    );
  },
  down: async queryInterface => {
    await queryInterface.removeColumn("ACCOUNT_TYPE", "IS_PORTFOLIO");
  },
};
