// child(): bound fields merged, call fields win.
var logs = require("../index.js");
var helper = require("./helper.js");
var check = helper.check;

function run() {
  var c = helper.collector();
  var log = logs.createLogger({write: c.write, now: helper.fixedNow(), base: {app: "demo"}});
  var api = log.child({service: "api"});
  api.info("hit", {path: "/x"});
  var entry = JSON.parse(c.lines[0]);
  check(entry.app === "demo", "child inherits base fields");
  check(entry.service === "api", "child adds its fields");

  var c2 = helper.collector();
  var log2 = logs.createLogger({write: c2.write, now: helper.fixedNow()});
  var kid = log2.child({a: 1});
  kid.info("m", {a: 2});
  check(JSON.parse(c2.lines[0]).a === 2, "call fields override child fields");

  var c3 = helper.collector();
  var errLog = logs.createLogger({write: c3.write, now: helper.fixedNow()});
  errLog.error("failed", {err: new Error("boom")});
  var withErr = JSON.parse(c3.lines[0]);
  check(withErr.err.error === "boom", "Error values serialize to message");

  var circ = {};
  circ.self = circ;
  var c4 = helper.collector();
  var circLog = logs.createLogger({write: c4.write, now: helper.fixedNow()});
  circLog.info("circular", {circ: circ});
  check(JSON.parse(c4.lines[0]).msg === "circular", "circular fields never throw");
}

module.exports = {run: run};
