/* eslint-disable no-magic-numbers, max-lines-per-function */
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    civility: {
      type: DataTypes.ENUM,
      values: ["MADAME", "MONSIEUR"],
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(200),
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
    tableName: "USER",
    createdAt: "creationDate",
    updatedAt: "modificationDate",
    getterMethods: {
      name: function name() {
        return `${this.getDataValue("firstName")} ${this.getDataValue("lastName")}`;
      },
    },
  });

  User.associate = models => {
    User.Account = User.hasMany(models.Account, {
      as: "account",
      foreignKey: "userId",
    });
    User.Categories = User.hasMany(models.Category, {
      as: "categories",
      foreignKey: "userId",
    });
    User.SubCategories = User.hasMany(models.SubCategory, {
      as: "subCategories",
      foreignKey: "userId",
    });
    User.Transaction = User.hasMany(models.Transaction, {
      as: "transaction",
      foreignKey: "userId",
    });
    /* User.hasMany(models.budget, {
      as: "budget",
      foreignKey: "userId",
    });*/
  };

  User.prototype.toJSON = function toJSON() {
    const values = {...this.get()};

    delete values.password;

    values.login = this.login;

    if (values.roles) {
      values.roles = values.roles.map(role => role.type);
    }

    return values;
  };

  return User;
};
