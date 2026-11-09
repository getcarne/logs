// logs: structured JSON and pretty logger for Carne.
// Pure JS: console output by default, optional file dest on std/os,
// LOG_LEVEL env override on std/env. No dependencies.
//
//   var logs = require("pkg/logs");
//   var log = logs.createLogger({level: "info", pretty: true});
//   log.info("server started", {port: 3000});
//   var api = log.child({service: "api"});
//   api.error("boom", {err: String(e)});
//
// Levels: debug < info < warn < error. Below-threshold records are
// dropped before formatting. JSON mode emits one object per line:
// {time, level, msg, ...fields}. Pretty mode emits one colored line
// per record and honors NO_COLOR / TERM=dumb like the carne CLI.

var loggerLib = require("./lib/logger.js");

module.exports = {
  createLogger: loggerLib.createLogger,
  levels: loggerLib.LEVELS
};
