/* eslint-disable no-process-env */
const shouldBeSecure = process.env.NODE_ENV === "production"
  || process.env.NODE_ENV === "qa";
/* eslint-enable no-process-env */

const cookieOptions = {
  httpOnly: true,
  secure: shouldBeSecure,
  sameSite: true,
};

const operatorCookieOptions = {
  httpOnly: true,
  secure: shouldBeSecure,
  sameSite: false,
};

module.exports = {
  shouldBeSecure,
  cookieOptions,
  operatorCookieOptions,
};
