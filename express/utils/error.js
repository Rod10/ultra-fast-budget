const statuses = require("statuses");

const OK = statuses("OK"); // 200
const NO_CONTENT = statuses("No content"); // 204
const FOUND = statuses("Found"); // 302
const SEE_OTHER = statuses("See other"); // 303
const UNAUTHORIZED = statuses("Unauthorized");
const FORBIDDEN = statuses("Forbidden"); // 403
const NOT_FOUND = statuses("Not found"); // 404
const UNPROCESSABLE_ENTITY = statuses("Unprocessable Entity"); // 422
const INTERNAL_SERVER_ERROR = statuses("Internal server error"); // 500

module.exports = {
  FOUND,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NO_CONTENT,
  NOT_FOUND,
  OK,
  SEE_OTHER,
  UNAUTHORIZED,
  UNPROCESSABLE_ENTITY,
};
