module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn(
      "ACCOUNT_TYPE",
      "CLASS_NAME",
      "TAG",
    );
  },
  down: async queryInterface => {
    await queryInterface.renameColumn(
      "ACCOUNT_TYPE",
      "TAG",
      "CLASS_NAME",
    );
  },
};
