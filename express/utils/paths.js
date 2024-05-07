const path = require("path");
const {dataPath} = require("./config.js");

const PUBLIC = path.resolve(__dirname, "..", "..", "public");
const TEMPLATES = path.resolve(__dirname, "..", "templates");
const VIEWS = path.resolve(__dirname, "..", "views");
const LOGS = path.resolve("logs");

const dataPathAbs = dataPath[0] === "/"
  ? dataPath
  : path.resolve(dataPath);
const DOCUMENTS = path.resolve(dataPathAbs, "documents");
const LOGOS = path.resolve(dataPathAbs, "logos");

module.exports = {
  DOCUMENTS,
  LOGOS,
  LOGS,
  PUBLIC,
  TEMPLATES,
  VIEWS,
};
