/* eslint-disable no-magic-numbers, max-lines-per-function */
module.exports = (sequelize, DataTypes) => {
  const Snapshot = sequelize.define("Snapshot", {
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
    year: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
    },
    startBalance: {
      allowNull: false,
      type: DataTypes.DECIMAL(15, 2),
    },
    endBalance: {
      allowNull: false,
      type: DataTypes.DECIMAL(15, 2),
    },
    totalGain: {
      allowNull: false,
      type: DataTypes.DECIMAL(15, 2),
    },
    netGain: {
      allowNull: false,
      type: DataTypes.DECIMAL(15, 2),
    },
    interestGain: {
      allowNull: false,
      type: DataTypes.DECIMAL(15, 2),
    },
    dividendGain: {
      allowNull: false,
      type: DataTypes.DECIMAL(15, 2),
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
    tableName: "SNAPSHOT",
    createdAt: "creationDate",
    updatedAt: "modificationDate",
  });
  Snapshot.associate = models => {
    Snapshot.Portfolio = Snapshot.belongsTo(models.Portfolio, {
      as: "portfolio",
      foreignKey: {
        name: "portfolioId",
        allowNull: false,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
  };
  return Snapshot;
};
