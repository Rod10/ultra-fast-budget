/**
 * @param {Object} obj
 */
const metaFilter = body => (req, res, next) => {
  if (body) req._routeWhitelists.body = body;
  next();
};

module.exports = metaFilter;
