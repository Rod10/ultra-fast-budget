const utils = require("../utils/index.js");
const {cookieOptions} = require("../services/cookie.js");

const minLimit = 10;
const defaultLimit = 100;
const defaultPage = 0;

const getPagination = query => {
  const limit = utils.hasProperty(query, "limit")
    ? parseInt(query.limit, 10) || defaultLimit
    : defaultLimit;
  const page = utils.hasProperty(query, "page")
    ? parseInt(query.page, 10) || defaultPage
    : defaultPage;

  return {
    limit: limit < minLimit ? minLimit : limit,
    page: page < defaultPage ? defaultPage : page,
  };
};

module.exports = {
  operation: (req, _res, next) => {
    const q = {...req.query, ...getPagination(req.query)};

    if (q.notState && !Array.isArray(q.notState)) {
      q.notState = q.notState.split(",");
    }
    req.parsedQuery = q;
    next();
  },

  operators: (req, _res, next) => {
    const q = {...req.query, ...getPagination(req.query)};
    if (q.functions && !Array.isArray(q.functions)) {
      q.functions = q.functions.split(",");
    }
    req.parsedQuery = q;
    next();
  },

  getPagination: (req, res, next) => {
    req.parsedQuery = {...req.query, ...getPagination(req.query)};
    next();
  },

  cookie: (req, res, next) => {
    let cookie = {};
    try {
      if (req.cookies.search) {
        cookie = JSON.parse(Buffer.from(req.cookies.search, "base64").toString());
      }
    } catch (_) {
      cookie = {};
    }
    req.parsedSearchCookie = cookie;
    next();
  },

  setCookie: (res, cookie) => {
    res.cookie(
      "search",
      Buffer.from(JSON.stringify(cookie)).toString("base64")
        .replaceAll("=", ""),
      cookieOptions,
    );
  },
  validatorLimit: value => {
    const limit = value ? parseInt(value, 10) || defaultLimit : defaultLimit;
    return limit < minLimit ? minLimit : limit;
  },
  validatorPage: value => {
    const page = value ? parseInt(value, 10) || defaultPage : defaultPage;
    return page < 0 ? 0 : page;
  },
};
