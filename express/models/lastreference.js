/* eslint-disable no-magic-numbers, max-lines-per-function */
module.exports = (sequelize, DataTypes) => {
  const LastReference = sequelize.define("LastReference", {
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
    dividend: {
      allowNull: true,
      type: DataTypes.STRING(45),
    },
    order: {
      allowNull: true,
      type: DataTypes.STRING(45),
    },
    transaction: {
      allowNull: true,
      type: DataTypes.STRING(45),
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
    tableName: "LAST_REFERENCE",
    createdAt: "creationDate",
    updatedAt: "modificationDate",
  });
  LastReference.associate = models => {
    LastReference.User = LastReference.belongsTo(models.User, {
      as: "user",
      foreignKey: {
        name: "userId",
        allowNull: false,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
  };
  return LastReference;
};
