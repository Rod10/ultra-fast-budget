const assert = require("assert");

const {logger} = require("../services/logger.js");

const tokenSrv = require("../services/token.js");
const userSrv = require("../services/user.js");
const {SEE_OTHER} = require("../utils/error.js");

const getUser = async (req, decoded, testValidity) => {
  req.user = await userSrv.get(decoded.id);
  if (testValidity) {
    /* if (user.state !== ContributorStates.ACTIVE) {
      throw new Error("Compte désactivé");
    }
    if (!SocietyStatusSets.enabled.includes(req.society.status)
      || (req.society.parent && !SocietyStatusSets.enabled.includes(req.society.parent.status))) {
      throw new Error("Société désactivé");
    }*/
  }
};

const verifyToken = async req => {
  const token = req.cookies.token;
  assert(token, "Missing token");

  const decoded = tokenSrv.verifyUser(token);
  assert(decoded, "Invalid token");
  assert(decoded.id && decoded.email && decoded.type, "Invalid token");
  switch (decoded.type) {
  case "user":
    await getUser(req, decoded, true);
    break;
  default:
    throw new Error("Invalid token type");
  }
};

const accessError = () => new Error("Vous n'êtes pas autorisé à effectuer cette action");

module.exports = {
  /* email: async (req, res, next) => {
    try {
      const token = req.query.token;
      assert(token, "Missing token");

      const decoded = tokenSrv.verifyConfirm(token);
      assert(decoded, "Invalid token");
      assert(decoded.id && decoded.email && decoded.type, "Invalid token");

      switch (decoded.type) {
      case "society":
        await getSociety(req, decoded);
        break;
      case "user":
        await getContributor(req, decoded);
        break;
      default:
        throw new Error("Invalid token type");
      }
      return next();
    } catch (error) {
      return next(error);
    }
  },*/

  normal: async (req, res, next) => {
    try {
      await verifyToken(req);
      res.locals = res.locals || {};
      res.locals.society = req.society;
      res.locals.user = req.user;
      res.locals.htmlSociety = true;
      return next();
    } catch (error) {
      logger.error(error);
      return next(error);
    }
  },

  strict: async (req, res, next) => {
    try {
      await verifyToken(req);
      res.locals = res.locals || {};
      res.locals.society = req.society;
      res.locals.user = req.user;
      res.locals.htmlSociety = true;
      return next();
    } catch (error) {
      logger.error(error);
      return res.redirect(
        SEE_OTHER,
        `/login?redirect=${encodeURIComponent(req.originalUrl)}`,
      );
    }
  },
};
