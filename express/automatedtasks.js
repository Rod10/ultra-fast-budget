#!/usr/bin/env node

const automatedtasks = require("./services/automatedtasks.js");
const config = require("./utils/config.js").automatedTasks;
const {hasProperty} = require("./utils/index.js");

for (const task in config) {
  if (hasProperty(config, task)) {
    automatedtasks.run(
      config[task].cron,
      automatedtasks[task],
      task,
    );
  }
}

process.on("SIGINT", automatedtasks.stop);
