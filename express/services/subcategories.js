const fs = require("fs");
const {
  sequelize,
  Sequelize,
  SubCategory,
  Op,
} = require("../models/index.js");

const SubCategoriesFull = require("../constants/subcategoriesfull.js");
const {logger} = require("./logger.js");

const categorySrv = require("./category.js");
const path = require("path");
const {IMAGES} = require("../utils/paths.js");

fs.existsSync(IMAGES) || fs.mkdirSync(IMAGES);

const subCategorySrv = {};

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
          const imagePath = `/images/subcategories/${user.id}/${value.imagePath}`;
          SubCategory.create({
            userId: user.id,
            categoryId: parentCategory.id,
            type: key,
            name: value.name,
            imagePath,
          });
        }
      } catch (error) {
        console.error("Error retrieving category:", error);
      }
    }
  }
  fs.mkdirSync(path.resolve(IMAGES, dir), {recursive: true});
  fs.cpSync(path.resolve(IMAGES, "base/subcategories"), path.resolve(IMAGES, dir), {recursive: true});
  // Now you can safely proceed with bulk creation
  // await SubCategory.bulkCreate(subCategories);
};

module.exports = subCategorySrv;
