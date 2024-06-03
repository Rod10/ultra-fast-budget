/* eslint-disable no-magic-numbers, max-lines-per-function */
module.exports = (sequelize, DataTypes) => {
  const Transfer = sequelize.define("Transfer", {
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
    tableName: "TRANSFER",
    createdAt: "creationDate",
    updatedAt: "modificationDate",
  });
  Transfer.associate = models => {
    Transfer.User = Transfer.belongsTo(models.User, {
      as: "user",
      foreignKey: {
        name: "userId",
        allowNull: false,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
    Transfer.Sender = Transfer.belongsTo(models.Account, {
      as: "sender",
      foreignKey: {
        name: "senderId",
        allowNull: false,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
    Transfer.Receiver = Transfer.belongsTo(models.Account, {
      as: "recevier",
      foreignKey: {
        name: "receiverId",
        allowNull: false,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
  };
  return Transfer;
};
