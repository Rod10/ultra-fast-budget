module.exports = (queryInterface, question, q) => queryInterface.sequelize.query(
  "SELECT ID FROM QUESTION_QUIZZ WHERE QUESTION_TEXT = ? AND QUIZZ_ID = ?",
  {
    replacements: [question.question, q.ID],
    type: queryInterface.sequelize.QueryTypes.SELECT,
  },
);
