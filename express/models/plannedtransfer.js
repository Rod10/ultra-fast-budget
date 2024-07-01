/* eslint-disable no-magic-numbers, max-lines-per-function */
module.exports = (sequelize, DataTypes) => {
  const PlannedTransfer = sequelize.define("PlannedTransfer", {
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
    senderId: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
    },
    receiverId: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
    },
    amount: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    other: {
      allowNull: true,
      type: DataTypes.TEXT,
    },
    transferDate: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: "PLANNED_TRANSFER",
    createdAt: "creationDate",
    updatedAt: "modificationDate",
  });
  PlannedTransfer.associate = models => {
    PlannedTransfer.User = PlannedTransfer.belongsTo(models.User, {
      as: "user",
      foreignKey: {
        name: "userId",
        allowNull: false,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
    PlannedTransfer.Sender = PlannedTransfer.belongsTo(models.Account, {
      as: "sender",
      foreignKey: {
        name: "senderId",
        allowNull: false,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
    PlannedTransfer.Receiver = PlannedTransfer.belongsTo(models.Account, {
      as: "receiver",
      foreignKey: {
        name: "receiverId",
        allowNull: false,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
  };
  return PlannedTransfer;
};
