module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "ACCOUNT",
      "DELETED_ON",
      {
        allowNull: true,
       type: Sequelize.DATE,
      },
    );
  },
  down: async queryInterface => {
    await queryInterface.removeColumn("ACCOUNT", "DELETED_ON");
  },
};
