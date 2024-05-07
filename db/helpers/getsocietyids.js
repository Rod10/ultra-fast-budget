module.exports = queryInterface => queryInterface.sequelize.query(
  "SELECT ID FROM SOCIETY",
  {type: queryInterface.sequelize.QueryTypes.SELECT},
);
