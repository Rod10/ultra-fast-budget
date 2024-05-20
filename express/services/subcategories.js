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

fs.existsSync(IMAGES) || fs.mkdirSync(IMAGES);
fs.existsSync(ICON) || fs.mkdirSync(ICON);

const subCategorySrv = {};

subCategorySrv.ICON_DIR = ICON;

const getDir = user => `${user.id}-${user.lastName}/subcategories`;

/**
 * Add all the subsubCategory for a new user into the database
 *
 * @param {object} user - The id of the user
 */
subCategorySrv.createForNewUser = async user => {
  logger.debug("Create all subcategories for new user=[%s]", user.id);
  const dir = `${user.id}-${user.lastName}/subcategories`;

  for (const [key, value] of Object.entries(SubCategoriesFull)) {
    for (const subCategory of value.parent) {
      try {
        const parentCategory = await subCategorySrv.getByType(user.id, subCategory);
        if (parentCategory) {
          const imagePath = `${dir}/${value.imagePath}`;
          SubCategory.create({
            userId: user.id,
            subCategoryId: parentCategory.id,
            type: key,
            name: value.name,
            imagePath,
          });
        }
      } catch (error) {
        logger.error("Error retrieving subCategory:", error);
      }
    }
  }
  fs.mkdirSync(path.resolve(ICON, dir), {recursive: true});
  fs.cpSync(path.resolve(ICON, "base/subcategories"), path.resolve(ICON, dir), {recursive: true});
  // Now you can safely proceed with bulk creation
  // await SubCategory.bulkCreate(subCategories);
};

subCategorySrv.create = (user, subCategoryId, data, file) => {
  logger.debug("Create subsubCategory for user=[%s] and subCategory=[%s] with data=[%s]", user.id, subCategoryId, data);

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
    subCategoryId,
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
