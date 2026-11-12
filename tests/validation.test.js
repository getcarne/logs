// Input validation: bad options throw with clear messages.
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

function expectThrow(fn) {
  var threw = false;
  try {
    fn();
  } catch (e) {
    threw = true;
  }
  expect(threw).toBe(true);
}

test("validation: bad options and records throw, nothing emitted", () => {
  expectThrow(function () { logs.createLogger({level: "verbose"}); });
  expectThrow(function () { logs.createLogger({dest: 42}); });
  expectThrow(function () { logs.createLogger({write: "x"}); });
  expectThrow(function () { logs.createLogger({base: []}); });
  expectThrow(function () { logs.createLogger([]); });

  var c = collector();
  var log = logs.createLogger({write: c.write, now: fixedNow()});
  expectThrow(function () { log.info(42); });
  expectThrow(function () { log.info("m", [1]); });
  expectThrow(function () { log.child("x"); });
  expect(c.lines.length).toBe(0);
});
