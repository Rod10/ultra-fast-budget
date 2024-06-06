/* eslint-disable no-magic-numbers, max-lines-per-function */
module.exports = (sequelize, DataTypes) => {
  const Budget = sequelize.define("Budget", {
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
    categoryId: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    totalAmount: {
      allowNull: true,
      type: DataTypes.FLOAT,
    },
    totalAllocatedAmount: {
      allowNull: true,
      type: DataTypes.FLOAT,
    },
    duration: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING(45),
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
    tableName: "BUDGET",
    createdAt: "creationDate",
    updatedAt: "modificationDate",
  });
  Budget.associate = models => {
    Budget.User = Budget.belongsTo(models.User, {
      as: "user",
      foreignKey: {
        name: "userId",
        allowNull: false,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
    Budget.Category = Budget.belongsTo(models.Category, {
      as: "category",
      foreignKey: {
        name: "categoryId",
        allowNull: false,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
  };
  return Budget;
};
