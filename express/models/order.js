/* eslint-disable no-magic-numbers, max-lines-per-function */
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define("Order", {
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
    type: {
      type: DataTypes.ENUM,
      values: ["ORDER", "DIVIDEND", "INTEREST", "DEPOSIT", "WITHDRAW"],
      allowNull: false,
    },
    side: {
      type: DataTypes.ENUM,
      values: ["BUY", "SELL"],
      allowNull: true,
    },
    quantity: {
      allowNull: true,
      type: DataTypes.DECIMAL(15, 2),
    },
    isin: {
      allowNull: true,
      type: DataTypes.STRING(45),
    },
    price: {
      allowNull: true,
      type: DataTypes.DECIMAL(15, 2),
    },
    fees: {
      allowNull: true,
      type: DataTypes.DECIMAL(15, 2),
    },
    investedAmount: {
      allowNull: false,
      type: DataTypes.DECIMAL(15, 2),
    },
    receivedAt: {
      type: DataTypes.DATE,
      allowNull: false,
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
    tableName: "ORDER",
    createdAt: "creationDate",
    updatedAt: "modificationDate",
  });
  Order.associate = models => {
    Order.Portfolio = Order.belongsTo(models.Portfolio, {
      as: "portfolio",
      foreignKey: {
        name: "portfolioId",
        allowNull: false,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
  };
  return Order;
};
