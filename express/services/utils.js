const nodeCrypto = require("crypto");

const utils = {};

utils.getRandomCode = (defaultLength = 33) => nodeCrypto.randomBytes(defaultLength)
  .toString("base64")
  .replace(/\//gu, "_")
  .replace(/\+/gu, "-");

/** Escape a string to be used in a MySQL regexp */
utils.escapeMySQLRegexString = str => {
  const toEscape = /([\\.+*?[\]^$(){}=!<>|:-])/g;
  return str.replace(toEscape, (_, m1) => `\\${m1}`);
};

/* No Quote */
const nq = "([^\"])*";
utils.nq = nq;

module.exports = utils;
