// Levels: threshold filtering + JSON shape.
var logs = require("../index.js");
var helper = require("./helper.js");
var check = helper.check;

function run() {
  var c = helper.collector();
  var log = logs.createLogger({level: "warn", write: c.write, now: helper.fixedNow()});
  check(log.level === "warn", "reports its level");
  log.debug("dropped");
  log.info("dropped too");
  log.warn("kept", {code: 1});
  log.error("kept too");
  check(c.lines.length === 2, "below-threshold records are dropped");

  var first = JSON.parse(c.lines[0]);
  check(first.time === "2026-01-01T00:00:00.000Z", "time field present");
  check(first.level === "warn", "level field present");
  check(first.msg === "kept", "msg field present");
  check(first.code === 1, "extra fields merged");

  var d = helper.collector();
  var debug = logs.createLogger({level: "debug", write: d.write, now: helper.fixedNow()});
  debug.debug("visible");
  check(d.lines.length === 1, "debug level keeps everything");

  check(logs.levels.debug === 10 && logs.levels.error === 40, "level numbers exported");
}

module.exports = {run: run};
