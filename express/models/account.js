/* eslint-disable no-magic-numbers, max-lines-per-function */
module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define("Account", {
    id: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    currency: {
      type: DataTypes.ENUM,
      values: ["EUR", "USD", "JPY", "CNY"],
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM,
      values: ["COURANT", "LIVRETA", "LDDS", "LEP", "LIVRETJ", "CEL", "PEL", "PERP", "CSL"],
      allowNull: false,
    },
    initialBalance: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    balance: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    creationDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    freezeTableName: true,
    tableName: "ACCOUNT",
    createdAt: "creationDate",
    updatedAt: false,
  });
  Account.associate = models => {
    Account.belongsTo(models.User, {
      as: "user",
      foreignKey: {
        name: "userId",
        allowNull: false,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
  };
  return Account;
};
