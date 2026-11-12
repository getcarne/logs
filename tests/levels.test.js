// Levels: threshold filtering + JSON shape.
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

test("levels: threshold filtering and JSON shape", () => {
  var c = collector();
  var log = logs.createLogger({level: "warn", write: c.write, now: fixedNow()});
  expect(log.level).toBe("warn");
  log.debug("dropped");
  log.info("dropped too");
  log.warn("kept", {code: 1});
  log.error("kept too");
  expect(c.lines.length).toBe(2);

  var first = JSON.parse(c.lines[0]);
  expect(first.time).toBe("2026-01-01T00:00:00.000Z");
  expect(first.level).toBe("warn");
  expect(first.msg).toBe("kept");
  expect(first.code).toBe(1);

  var d = collector();
  var debug = logs.createLogger({level: "debug", write: d.write, now: fixedNow()});
  debug.debug("visible");
  expect(d.lines.length).toBe(1);

  expect(logs.levels.debug).toBe(10);
  expect(logs.levels.error).toBe(40);
});
