/* eslint-disable no-magic-numbers, max-lines-per-function */
module.exports = (sequelize, DataTypes) => {
  const AccountType = sequelize.define("AccountType", {
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
    type: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    tag: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    interest: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    maxAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    unit: {
      type: DataTypes.ENUM,
      values: ["YEAR", "MONTH", "WEEK", "DAY"],
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
    deletedOn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    freezeTableName: true,
    tableName: "ACCOUNT_TYPE",
    createdAt: "creationDate",
    updatedAt: "modificationDate",
    deletedAt: "deletedOn",
  });
  AccountType.associate = models => {
    AccountType.User = AccountType.belongsTo(models.User, {
      as: "user",
      foreignKey: {
        name: "userId",
        allowNull: false,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
    AccountType.Account = AccountType.hasMany(models.Account, {
      as: "account",
      foreignKey: "accountTypeId",
    });
  };
  return AccountType;
};
