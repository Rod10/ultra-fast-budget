const parser = require("cron-parser");
const {logger} = require("../services/logger.js");

class Runner {
  constructor(cronDefinition, fn, name) {
    this.pending = false;
    this.cronDefinition = cronDefinition;
    this._fn = fn;
    this.name = name;
    this.fn = this.fn.bind(this);
    this.getNextTime = this.getNextTime.bind(this);
    this.timeout = setTimeout(this.fn, this.getNextTime());
  }

  getNextTime() {
    const nextTic = parser.parseExpression(this.cronDefinition).next();
    return nextTic.getTime() - Date.now();
  }

  fn() {
    if (this.pending) return;
    this.pending = true;
    return Promise.resolve(logger.info(`Starting task ${this.name}`))
      .then(() => this._fn())
      .catch(error => logger.error(error))
      .then(() => {
        logger.info(`End of task ${this.name}`);
        this.pending = false;
        this.timeout = setTimeout(this.fn, this.getNextTime());
      });
  }

  stop() {
    clearTimeout(this.timeout);
  }
}

module.exports = Runner;
