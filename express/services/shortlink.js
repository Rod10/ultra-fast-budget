const {
  Op,
  ShortLink,
  Sequelize,
} = require("../models/index.js");

const env = require("../utils/env.js");
const config = require("../utils/config.js");

const {logger} = require("./logger.js");
const {getRandomCode} = require("./utils.js");

const getCodeLink = code => `${config.base[env]}/code/${code}`;

const create = async (link, expirationDate) => {
  const maxAttempt = 10;
  let attempt = 0;
  while (attempt < maxAttempt) {
    try {
      // attempt to create a short link with unique code
      const shortLink = await ShortLink.create({
        code: getRandomCode(),
        link,
        expirationDate,
      });
      return getCodeLink(shortLink.code);
    } catch (error) {
      if (!(error instanceof Sequelize.ValidationError)) {
        throw error;
      }
      if (error.errors.length !== 1 && error.errors[0]) {
        throw error;
      }
      attempt++;
    }
  }
  throw new Error("Cannot find unique code");
};

const getLinkFromCode = async code => {
  const shortLink = await ShortLink.findOne({
    where: {
      code,
      expirationDate: {[Op.gte]: new Date()},
    },
  });
  if (shortLink) return shortLink.link;
  logger.info("ShortLink for code=[{}] not found.", code);
  return null;
};

module.exports = {
  create,
  getCodeLink,
  getLinkFromCode,
};
