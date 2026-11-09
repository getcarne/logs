// File dest: lines appended via std/os, JSON-parseable.
var os = require("std/os");
var logs = require("../index.js");
var helper = require("./helper.js");
var check = helper.check;

function run() {
  var path = os.tmpdir() + "/logs_pkg_test.log";
  if (os.exists(path)) os.remove(path);
  var log = logs.createLogger({dest: path, now: helper.fixedNow()});
  log.info("to file", {n: 1});
  log.warn("second", {n: 2});
  var body = os.readFile(path);
  var lines = body.split("\n").filter(function (l) { return l.length > 0; });
  check(lines.length === 2, "two lines appended to dest");
  check(JSON.parse(lines[0]).msg === "to file", "first line parses");
  check(JSON.parse(lines[1]).level === "warn", "second line level parses");
  os.remove(path);
}

module.exports = {run: run};
