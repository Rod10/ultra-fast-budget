const fs = require("fs");
const path = require("path");

const {
  sequelize,
  Sequelize,
  Category,
  Op,
} = require("../models/index.js");

const CategoryFull = require("../constants/categoryfull.js");
const {
  CATEGORIES,
  IMAGES,
} = require("../utils/paths.js");
const {logger} = require("./logger.js");

const categorySrv = {};

/**
 * Add all the category for a new user into the database
 *
 * @param {object} user - Id of the user
 */
categorySrv.createForNewUser = user => {
  logger.debug("Create all category for new user=[%s]", user.id);
  const dir = `${user.id}-${user.lastName}/categories`;

  for (const [key, value] of Object.entries(CategoryFull)) {
    const imagePath = `${dir}/${user.id}/${value.imagePath}`;
    Category.create({
      userId: user.id,
      name: value.name,
      type: value.type,
      imagePath,
    });
  }
  fs.mkdirSync(path.resolve(IMAGES, dir), {recursive: true});
  fs.cpSync(path.resolve(IMAGES, "base/categories"), path.resolve(IMAGES, dir), {recursive: true});
};

categorySrv.getByType = (userId, type) => {
  logger.debug("Get the category for user=[%s] with type=[%s]", userId, type);

  return Category.findOne({
    where: {
      userId,
      type,
    },
  });
};

module.exports = categorySrv;