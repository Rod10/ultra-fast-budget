/* eslint-disable no-magic-numbers, max-lines-per-function */
module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define("Transaction", {
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
    accountId: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
    },
    data: {
      type: DataTypes.TEXT,
      get() {
        const val = this.getDataValue("data");
        if (!val || !val.length) return {};
        return JSON.parse(val);
      },
      set(val) {
        this.setDataValue("data", JSON.stringify(val));
      },
    },
    to: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    other: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    transactionDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM,
      values: ["INCOME", "EXPECTED_INCOME", "EXPENSE", "EXPECTED_EXPENSE", "TRANSFER", "EXPECTED_TRANSFERT"],
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
    deletedOn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    freezeTableName: true,
    tableName: "TRANSACTION",
    createdAt: "creationDate",
    updatedAt: "modificationDate",
  });
  Transaction.associate = models => {
    Transaction.User = Transaction.belongsTo(models.User, {
      as: "user",
      foreignKey: {
        name: "userId",
        allowNull: false,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
    Transaction.Account = Transaction.belongsTo(models.Account, {
      as: "account",
      foreignKey: {
        name: "accountId",
        allowNull: false,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
  };
  return Transaction;
};
