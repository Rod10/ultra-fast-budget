/* eslint-disable no-magic-numbers, max-lines-per-function */
module.exports = (sequelize, DataTypes) => {
  const PlannedTransaction = sequelize.define("PlannedTransaction", {
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
    occurence: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
    },
    unit: {
      type: DataTypes.ENUM,
      values: ["YEAR", "MONTH", "WEEK", "DAY"],
      allowNull: false,
    },
    number: {
      type: DataTypes.INTEGER(20),
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
    tableName: "PLANNED_TRANSACTION",
    createdAt: "creationDate",
    updatedAt: "modificationDate",
  });
  PlannedTransaction.associate = models => {
    PlannedTransaction.User = PlannedTransaction.belongsTo(models.User, {
      as: "user",
      foreignKey: {
        name: "userId",
        allowNull: false,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
    PlannedTransaction.Account = PlannedTransaction.belongsTo(models.Account, {
      as: "account",
      foreignKey: {
        name: "accountId",
        allowNull: false,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
  };
  return PlannedTransaction;
};
