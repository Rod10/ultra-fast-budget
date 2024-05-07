const fs = require("fs");
const winston = require("winston");
const expressWinston = require("express-winston");
require("winston-daily-rotate-file");

const env = require("../utils/env.js");
const {LOGS} = require("../utils/paths.js");

//  setup loggers
fs.existsSync(LOGS) || fs.mkdirSync(LOGS);

const transport = new winston.transports.DailyRotateFile({
  dirname: LOGS,
  filename: "winston-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: 30,
  level: (env.NODE_ENV === "production" ? "info" : "debug"),
});

const {combine, timestamp, splat, printf} = winston.format;

const myFormat = printf(info => {
  const base = `${info.timestamp} ${info.level}:`;
  if (info instanceof Error) {
    return `${base} ${info.stack}`;
  } else if (info.meta) {
    const meta = {...info.meta};
    delete meta.res;
    delete meta.responseTime;
    return `${base} ${info.message} ${JSON.stringify(meta)}`;
  }
  return `${base} ${info.message}`;
});

const logger = winston.createLogger({
  transports: [transport],
  exitOnError: false,
  format: combine(
    timestamp(),
    splat(),
    myFormat,
  ),
});

module.exports = {
  logger,
  expressWinston: expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    msg: "{{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
    requestWhitelist: ["body"],
    responseWhitelist: [],
    dynamicMeta: req => {
      const data = {};
      if (req.admin) data.admin = req.admin.id;
      if (req.operation) data.operation = req.operation.id;
      if (req.operator) data.operator = req.operator.id;
      if (req.society) data.society = req.society.id;
      if (req.user) data.user = req.user.id;
      return data;
    },
  }),
};
