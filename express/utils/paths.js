const path = require("path");
const {dataPath} = require("./config.js");

const PUBLIC = path.resolve(__dirname, "..", "..", "public");
const TEMPLATES = path.resolve(__dirname, "..", "templates");
const VIEWS = path.resolve(__dirname, "..", "views");
const LOGS = path.resolve("logs");

const dataPathAbs = dataPath[0] === "/"
  ? dataPath
  : path.resolve(dataPath);
const CATEGORIES = path.resolve(dataPathAbs, "categories");
const SUBCATEGORIES = path.resolve(dataPathAbs, "subcategories");
const IMAGES = path.resolve(dataPathAbs, "images");
const ICON = path.resolve(dataPathAbs, "icon");
const LOGOS = path.resolve(dataPathAbs, "logos");

module.exports = {
  CATEGORIES,
  SUBCATEGORIES,
  IMAGES,
  ICON,
  LOGOS,
  LOGS,
  PUBLIC,
  TEMPLATES,
  VIEWS,
};
