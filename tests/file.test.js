// File dest: lines appended via std/os, JSON-parseable.
const { test, expect } = require("std/test");
var os = require("std/os");
var logs = require("../index.js");

function fixedNow() {
  return function () { return "2026-01-01T00:00:00.000Z"; };
}

test("file: lines appended to dest, JSON-parseable", () => {
  var path = os.tmpdir() + "/logs_pkg_test.log";
  if (os.exists(path)) os.remove(path);
  var log = logs.createLogger({dest: path, now: fixedNow()});
  log.info("to file", {n: 1});
  log.warn("second", {n: 2});
  var body = os.readFile(path);
  var lines = body.split("\n").filter(function (l) { return l.length > 0; });
  expect(lines.length).toBe(2);
  expect(JSON.parse(lines[0]).msg).toBe("to file");
  expect(JSON.parse(lines[1]).level).toBe("warn");
  os.remove(path);
});
