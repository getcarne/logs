// Input validation: bad options throw with clear messages.
var logs = require("../index.js");
var helper = require("./helper.js");
var check = helper.check;

function throws(fn, msg) {
  var ok = false;
  try {
    fn();
  } catch (e) {
    ok = true;
  }
  check(ok, msg);
}

function run() {
  throws(function () { logs.createLogger({level: "verbose"}); }, "bad level throws");
  throws(function () { logs.createLogger({dest: 42}); }, "non-string dest throws");
  throws(function () { logs.createLogger({write: "x"}); }, "non-function write throws");
  throws(function () { logs.createLogger({base: []}); }, "array base throws");
  throws(function () { logs.createLogger([]); }, "array options throw");

  var c = helper.collector();
  var log = logs.createLogger({write: c.write, now: helper.fixedNow()});
  throws(function () { log.info(42); }, "non-string message throws");
  throws(function () { log.info("m", [1]); }, "array fields throw");
  throws(function () { log.child("x"); }, "non-object child fields throw");
  check(c.lines.length === 0, "failed records emit nothing");
}

module.exports = {run: run};
