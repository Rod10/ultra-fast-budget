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
const {logger} = require("./logger.js");

const categorySrv = require("./category.js");

fs.existsSync(IMAGES) || fs.mkdirSync(IMAGES);
fs.existsSync(ICON) || fs.mkdirSync(ICON);

const subCategorySrv = {};

subCategorySrv.ICON_DIR = ICON;

const getDir = user => `${user.id}-${user.lastName}/subcategories`;

/**
 * Add all the subcategory for a new user into the database
 *
 * @param {object} user - The id of the user
 */
subCategorySrv.createForNewUser = async user => {
  logger.debug("Create all subcategories for new user=[%s]", user.id);
  const dir = `${user.id}-${user.lastName}/subcategories`;

  for (const [key, value] of Object.entries(SubCategoriesFull)) {
    for (const category of value.parent) {
      try {
        const parentCategory = await categorySrv.getByType(user.id, category);
        if (parentCategory) {
          const imagePath = `/icon/${dir}/${value.imagePath}`;
          SubCategory.create({
            userId: user.id,
            categoryId: parentCategory.id,
            type: key,
            name: value.name,
            imagePath,
          });
        }
      } catch (error) {
        logger.error("Error retrieving category:", error);
      }
    }
  }
  fs.mkdirSync(path.resolve(ICON, dir), {recursive: true});
  fs.cpSync(path.resolve(ICON, "base/subcategories"), path.resolve(ICON, dir), {recursive: true});
  // Now you can safely proceed with bulk creation
  // await SubCategory.bulkCreate(subCategories);
};

subCategorySrv.create = (user, categoryId, data, file) => {
  logger.debug("Create subcategory for user=[%s] and category=[%s] with data=[%s]", user.id, categoryId, data);

  const dir = getDir(user);
  const fileParts = file[0].originalname.split(".");
  const extension = fileParts[1];
  const imagePath = `/icon/${dir}/${data.type}.${extension}`;

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

module.exports = subCategorySrv;
