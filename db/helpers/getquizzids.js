module.exports = (queryInterface, society) => queryInterface.sequelize.query(
  "SELECT ID FROM QUIZZ WHERE SOCIETY_ID = ?",
  {
    replacements: [society.ID],
    type: queryInterface.sequelize.QueryTypes.SELECT,
  },
);
