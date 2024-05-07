const nodeCrypto = require("crypto");
const bcrypt = require("bcrypt");

/* eslint-disable array-element-newline */
const DIC = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "W", "Z",
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
  "[", "]", "{", "}", "-", "_", "+", "?",
];
/* eslint-enable array-element-newline */

const PASS_LEN = 8;

const SALT_ROUND = 10;

module.exports = {
  minPasswordLength: PASS_LEN,
  hash: async password => {
    const salt = await bcrypt.genSalt(SALT_ROUND);
    return bcrypt.hash(password, salt);
  },
  compare: (password, hash) => bcrypt.compare(password, hash),
  generate: (length = PASS_LEN) => {
    const buff = nodeCrypto.randomBytes(length);
    const arr = [];
    for (let i = 0; i < buff.length; i++) {
      arr[i] = DIC[buff[i] % DIC.length];
    }
    return arr.join("");
  },
};
