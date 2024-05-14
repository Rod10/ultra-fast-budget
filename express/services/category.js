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
  ICON,
  IMAGES,
} = require("../utils/paths.js");
const {logger} = require("./logger.js");

fs.existsSync(IMAGES) || fs.mkdirSync(IMAGES);
fs.existsSync(ICON) || fs.mkdirSync(ICON);

const categorySrv = {};

categorySrv.ICON_DIR = ICON;

/**
 * Add all the category for a new user into the database
 *
 * @param {object} user - Id of the user
 */
categorySrv.createForNewUser = user => {
  logger.debug("Create all category for new user=[%s]", user.id);
  const dir = `${user.id}-${user.lastName}/categories`;

  for (const [key, value] of Object.entries(CategoryFull)) {
    const imagePath = `/icon/${dir}/${value.imagePath}`;
    Category.create({
      userId: user.id,
      name: value.name,
      type: value.type,
      genre: value.genre,
      imagePath,
    });
  }
  fs.mkdirSync(path.resolve(ICON, dir), {recursive: true});
  fs.cpSync(path.resolve(ICON, "base/categories"), path.resolve(ICON, dir), {recursive: true});
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

categorySrv.getAll = userId => {
  logger.debug("Find all categories for user=[%s]", userId);

  return Category.findAndCountAll({
    where: {userId},
    include: [{
      association: Category.SubCategory,
      // where: {userId},
    }],
  });
};

module.exports = categorySrv;
