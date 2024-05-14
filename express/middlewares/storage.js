const multer = require("multer");

const categorySrv = require("../services/category.js");
const {getSafeUTF8} = require("../utils/filename.js");

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, categorySrv.ICON_DIR);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${getSafeUTF8(file.originalname)}`);
    },
  }),
});

module.exports = {upload};
