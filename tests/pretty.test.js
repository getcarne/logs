// Pretty mode: human lines with and without color.
const { test, expect } = require("std/test");
var logs = require("../index.js");

function collector() {
  var lines = [];
  return {
    lines: lines,
    write: function (line) { lines.push(line); }
  };
}

function fixedNow() {
  return function () { return "2026-01-01T00:00:00.000Z"; };
}

test("pretty: human lines with and without color", () => {
  var c = collector();
  var log = logs.createLogger({pretty: true, color: false, write: c.write, now: fixedNow()});
  log.info("server started", {port: 3000});
  expect(c.lines.length).toBe(1);
  var line = c.lines[0];
  expect(line.indexOf("INFO") >= 0).toBe(true);
  expect(line.indexOf("server started") >= 0).toBe(true);
  expect(line.indexOf("port=3000") >= 0).toBe(true);
  expect(line.indexOf("\x1b[") < 0).toBe(true);

  var cc = collector();
  var colored = logs.createLogger({pretty: true, color: true, write: cc.write, now: fixedNow()});
  colored.error("boom");
  expect(cc.lines[0].indexOf("\x1b[31m")).toBe(0);
  expect(cc.lines[0].indexOf("\x1b[0m") > 0).toBe(true);

  var spaced = collector();
  var plog = logs.createLogger({pretty: true, color: false, write: spaced.write, now: fixedNow()});
  plog.info("hi", {note: "two words"});
  expect(spaced.lines[0].indexOf('note="two words"') >= 0).toBe(true);
});
