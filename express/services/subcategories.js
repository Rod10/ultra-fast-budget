const fs = require("fs");
const path = require("path");
const {
  sequelize,
  Sequelize,
  SubCategory,
  Op,
} = require("../models/index.js");

const SubCategoriesFull = require("../constants/subcategoriesfull.js");
const {IMAGES, ICON} = require("../utils/paths.js");
const categorySrv = require("./category.js");
const {logger} = require("./logger.js");

fs.existsSync(IMAGES) || fs.mkdirSync(IMAGES);
fs.existsSync(ICON) || fs.mkdirSync(ICON);

const subCategorySrv = {};

subCategorySrv.ICON_DIR = ICON;

const getDir = user => `${user.id}-${user.lastName}/subcategories`;

/**
 * Add all the subsubCategory for a new user into the database
 *
 * @param {object} user - The id of the user
 * @param {object} categories - The categories of the user
 */
subCategorySrv.createForNewUser = async (user, categories) => {
  logger.debug("Create all subcategories for new user=[%s]", user.id);
  const dir = `${user.id}-${user.lastName}/subcategories`;
  for (const [key, value] of Object.entries(SubCategoriesFull)) {
    for (const parent of value.parent) {
      const category = categories.find(c => c.type === parent);
      if (category) {
        const imagePath = `${dir}/${value.imagePath}`;
        SubCategory.create({
          userId: user.id,
          categoryId: category.id,
          type: key,
          name: value.name,
          imagePath,
        });
      }
    }
  }
  fs.mkdirSync(path.resolve(ICON, dir), {recursive: true});
  fs.cpSync(path.resolve(ICON, "base/subcategories"), path.resolve(ICON, dir), {recursive: true});
  // Now you can safely proceed with bulk creation
  // await SubCategory.bulkCreate(subCategories);
};

subCategorySrv.create = (user, categoryId, data, file) => {
  logger.debug("Create subCategory for user=[%s] and category=[%s] with data=[%s]", user.id, categoryId, data);

  const dir = getDir(user);
  const fileParts = file[0].originalname.split(".");
  const extension = fileParts[1];
  const imagePath = `${dir}/${data.type}.${extension}`;

  fs.renameSync(
    path.resolve(ICON, file[0].filename),
    path.resolve(ICON, `${dir}/${data.type}.${extension}`),
  );

  return SubCategory.create({
    userId: user.id,
    categoryId,
    name: data.name,
    type: data.type,
    imagePath,
  });
};

subCategorySrv.getById = id => {
  logger.debug("Get the subCategory with id=[%s]", id);

  return SubCategory.findOne({where: {id}});
};

subCategorySrv.edit = async (subCategory, user, data, file) => {
  logger.debug("Edit subCategory=[%s] with data=[%s]", subCategory.id, data);
  const dir = getDir(user);

  if (file) {
    const fileParts = file[0].originalname.split(".");
    const extension = fileParts[1];
    const imagePath = `${dir}/${data.type}.${extension}`;

    fs.unlinkSync(path.resolve(ICON, subCategory.imagePath));

    fs.renameSync(
      path.resolve(ICON, file[0].filename),
      path.resolve(ICON, `${dir}/${data.type}.${extension}`),
    );
    subCategory.imagePath = imagePath;
    subCategory.save();
  }

  return SubCategory.update(
    {
      name: data.name,
      type: data.type,
      genre: data.genre,
    },
    {where: {id: subCategory.id}},
  );
};

subCategorySrv.delete = async id => {
  logger.debug("Delete subCategory=[%s]", id);

  const subCategory = await subCategorySrv.getById(id);
  fs.unlinkSync(path.resolve(ICON, subCategory.imagePath));
  return SubCategory.destroy({where: {id}});
};

module.exports = subCategorySrv;
