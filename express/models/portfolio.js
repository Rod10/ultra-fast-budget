/* eslint-disable no-magic-numbers, max-lines-per-function */
module.exports = (sequelize, DataTypes) => {
  const Portfolio = sequelize.define("Portfolio", {
    id: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    accountId: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
    },
    monthlyContribution: {
      allowNull: false,
      type: DataTypes.DECIMAL(15, 2),
    },
    needDecide: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    creationDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    modificationDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    freezeTableName: true,
    tableName: "PORTFOLIO",
    createdAt: "creationDate",
    updatedAt: "modificationDate",
  });
  Portfolio.associate = models => {
    Portfolio.Account = Portfolio.belongsTo(models.Account, {
      as: "account",
      foreignKey: {
        name: "accountId",
        allowNull: false,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
    Portfolio.Stock = Portfolio.hasMany(models.Stock, {
      as: "stock",
      foreignKey: "portfolioId",
    });
  };
  return Portfolio;
};
