const jwt = require("jsonwebtoken");

const config = require("../utils/config.js");

module.exports = {
  /* admin auth token */
  admin: (admin, need2FA = false) => jwt.sign(
    {id: admin.id, email: admin.email, need2FA},
    config.jwt.admin,
    {expiresIn: "1d"},
  ),

  verifyAdmin: token => jwt.verify(token, config.jwt.admin),
  /* /admin auth token */

  user: contributor => jwt.sign(
    {id: contributor.id, email: contributor.email, type: "user"},
    config.jwt.user,
    {expiresIn: "1d"},
  ),

  verifyUser: token => jwt.verify(token, config.jwt.user),
  /* /society auth token */

  /* email confirmation token */
  confirmUser: user => jwt.sign(
    {id: user.id, email: user.email, type: "user"},
    config.jwt.confirmation,
    {expiresIn: "15d"}, //  expired after 15 days
  ),

  confirmOperator: operator => jwt.sign(
    {id: operator.id, email: operator.email, type: "operator"},
    config.jwt.confirmation,
    {expiresIn: "15d"}, //  expired after 15 days
  ),

  verifyConfirm: token => jwt.verify(token, config.jwt.confirmation),
  /* /email confirmation token */
};
