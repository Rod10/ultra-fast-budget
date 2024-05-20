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

const getDir = user => `${user.id}-${user.lastName}/categories`;

/**
 * Add all the category for a new user into the database
 *
 * @param {object} user - Id of the user
 */
categorySrv.createForNewUser = user => {
  logger.debug("Create all category for new user=[%s]", user.id);
  const dir = `${user.id}-${user.lastName}/categories`;

  for (const [key, value] of Object.entries(CategoryFull)) {
    const imagePath = `${dir}/${value.imagePath}`;
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

categorySrv.getById = id => {
  logger.debug("Get the category with id=[%s]", id);

  return Category.findOne({where: {id}});
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

categorySrv.create = (user, data, file) => {
  logger.debug("Create category for user=[%s] with data=[%s]", user.id, data);

  const dir = getDir(user);
  const fileParts = file[0].originalname.split(".");
  const extension = fileParts[1];
  const imagePath = `/icon/${dir}/${data.type}.${extension}`;

  fs.renameSync(
    path.resolve(ICON, file[0].filename),
    path.resolve(ICON, `${dir}/${data.type}.${extension}`),
  );

  return Category.create({
    userId: user.id,
    name: data.name,
    type: data.type,
    genre: data.genre,
    imagePath,
  });
};

categorySrv.edit = async (category, user, data, file) => {
  logger.debug("Edit category=[%s] with data=[%s]", category.id, data);
  const dir = getDir(user);

  if (file) {
    const fileParts = file[0].originalname.split(".");
    const extension = fileParts[1];
    const imagePath = `${dir}/${data.type}.${extension}`;

    fs.unlinkSync(path.resolve(ICON, category.imagePath));

    fs.renameSync(
      path.resolve(ICON, file[0].filename),
      path.resolve(ICON, `${dir}/${data.type}.${extension}`),
    );
    category.imagePath = imagePath;
    category.save();
  }

  return Category.update(
    {
      name: data.name,
      type: data.type,
      genre: data.genre,
    },
    {where: {id: category.id}},
  );
};

categorySrv.delete = async id => {
  logger.debug("Delete category=[%s]", id);

  const category = await categorySrv.getById(id);
  fs.unlinkSync(path.resolve(ICON, category.imagePath));
  return category.destroy();
};

module.exports = categorySrv;
