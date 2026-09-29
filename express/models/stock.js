/* eslint-disable no-magic-numbers, max-lines-per-function */
module.exports = (sequelize, DataTypes) => {
  const Stock = sequelize.define("Stock", {
    id: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    portfolioId: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
    },
    ticker: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currentPrice: {
      allowNull: false,
      type: DataTypes.DECIMAL(15, 2),
    },
    average: {
      allowNull: false,
      type: DataTypes.DECIMAL(15, 2),
    },
    quantity: {
      allowNull: false,
      type: DataTypes.DECIMAL(15, 2),
    },
    investedAmount: {
      allowNull: false,
      type: DataTypes.DECIMAL(15, 2),
    },
    weight: {
      allowNull: true,
      type: DataTypes.DECIMAL(15, 2),
    },
    targetWeight: {
      allowNull: true,
      type: DataTypes.DECIMAL(15, 2),
    },
    dividendsReceived: {
      allowNull: false,
      type: DataTypes.DECIMAL(15, 2),
    },
    boughtThisYear: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
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
    tableName: "STOCK",
    createdAt: "creationDate",
    updatedAt: "modificationDate",
  });
  Stock.associate = models => {
    Stock.Portfolio = Stock.belongsTo(models.Portfolio, {
      as: "portfolio",
      foreignKey: {
        name: "portfolioId",
        allowNull: false,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
  };
  return Stock;
};
