const fs = require("fs");
const path = require("path");

const express = require("express");
const favicon = require("serve-favicon");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const hbs = require("hbs");

const {
  logger,
  expressWinston,
} = require("./services/logger.js");
const {
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNPROCESSABLE_ENTITY,
} = require("./utils/error.js");
const {
  CATEGORIES,
  SUBCATEGORIES,
  LOGOS,
  PUBLIC,
  VIEWS,
} = require("./utils/paths.js");
const config = require("./utils/config.js");

const app = express();
app.disable("x-powered-by");

// view engine setup
app.set("views", VIEWS);
app.set("view engine", "hbs");

// view engine setup
/* eslint-disable no-invalid-this */
hbs.registerHelper("section", function section(name, options) {
  if (!this._sections) this._sections = {};
  this._sections[name] = options.fn(this);
  return null;
});

hbs.registerHelper("year", () => new Date().getFullYear());

hbs.registerHelper("json", object => object ? JSON.stringify(object) : "null");

hbs.registerHelper("eq", function eq(v1, v2, options) {
  /* eslint-disable-next-line no-magic-numbers */
  if (arguments.length < 3) {
    throw new Error("Handlebar Helper eq needs 2 parameters");
  } else if (v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});
/* eslint-enable no-invalid-this */

const getAppVersion = () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
  return pkg.version;
};

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.locals.isProd = app.get("env") === "production";
app.locals.preventCache = app.locals.isProd
  ? getAppVersion()
  : Date.now();

// uncomment after placing your favicon in /public
app.use(favicon(path.join(PUBLIC, "images", "logo-s.png")));

app.use(bodyParser.json({limit: "200KB"}));
app.use(bodyParser.urlencoded({limit: "200KB", extended: true}));
app.use(cookieParser());

app.use(express.static(PUBLIC));
app.use("/categories", express.static(CATEGORIES));
app.use("/subcategories", express.static(SUBCATEGORIES));
app.use("/logos", express.static(LOGOS));

app.use(expressWinston);

if (app.get("env") === "production") {
  app.set("trust proxy", 1);
}

app.use("/", require("./routes/index.js"));

// catch 404 and forward to error handler
app.use((req, res, _next) => {
  res.status(NOT_FOUND);
  if (req.xhr) {
    res.json({error: "Ressource non trouvée"});
  } else {
    res.render("404");
  }
});

// error handler
app.use((err, req, res, _next) => {
  if (err.status === UNPROCESSABLE_ENTITY) {
    const errors = err.errors.map(e => `${e.param} = [${e.value}]: ${e.msg}`);
    logger.error([
      err.message,
      ...errors,
    ].join("\n"));
    res.locals.message = err.message;
    res.locals.details = errors;
  } else {
    logger.error(err);
    res.locals.error = config.shouldDisplayErrors ? err : {};
    res.locals.details = "";
  }

  const dt = new Date().toISOString();
  res.locals.dt = err.timestamp || dt;

  // render the error page
  res.status(err.status || INTERNAL_SERVER_ERROR);
  if (req.xhr) {
    res.json({error: err.message, errors: err.errors});
  } else {
    res.render("error");
  }
});

module.exports = app;
