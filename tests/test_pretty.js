// Pretty mode: human lines with and without color.
var logs = require("../index.js");
var helper = require("./helper.js");
var check = helper.check;

function run() {
  var c = helper.collector();
  var log = logs.createLogger({pretty: true, color: false, write: c.write, now: helper.fixedNow()});
  log.info("server started", {port: 3000});
  check(c.lines.length === 1, "pretty emits one line");
  var line = c.lines[0];
  check(line.indexOf("INFO") >= 0, "pretty line carries level");
  check(line.indexOf("server started") >= 0, "pretty line carries msg");
  check(line.indexOf("port=3000") >= 0, "pretty line carries fields");
  check(line.indexOf("\x1b[") < 0, "color:false emits no escapes");

  var cc = helper.collector();
  var colored = logs.createLogger({pretty: true, color: true, write: cc.write, now: helper.fixedNow()});
  colored.error("boom");
  check(cc.lines[0].indexOf("\x1b[31m") === 0, "error pretty starts red");
  check(cc.lines[0].indexOf("\x1b[0m") > 0, "colored line resets");

  var spaced = helper.collector();
  var plog = logs.createLogger({pretty: true, color: false, write: spaced.write, now: helper.fixedNow()});
  plog.info("hi", {note: "two words"});
  check(spaced.lines[0].indexOf('note="two words"') >= 0, "spaced values are quoted");
}

module.exports = {run: run};
