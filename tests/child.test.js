// child(): bound fields merged, call fields win.
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

test("child: bound fields merged, call fields win", () => {
  var c = collector();
  var log = logs.createLogger({write: c.write, now: fixedNow(), base: {app: "demo"}});
  var api = log.child({service: "api"});
  api.info("hit", {path: "/x"});
  var entry = JSON.parse(c.lines[0]);
  expect(entry.app).toBe("demo");
  expect(entry.service).toBe("api");

  var c2 = collector();
  var log2 = logs.createLogger({write: c2.write, now: fixedNow()});
  var kid = log2.child({a: 1});
  kid.info("m", {a: 2});
  expect(JSON.parse(c2.lines[0]).a).toBe(2);

  var c3 = collector();
  var errLog = logs.createLogger({write: c3.write, now: fixedNow()});
  errLog.error("failed", {err: new Error("boom")});
  var withErr = JSON.parse(c3.lines[0]);
  expect(withErr.err.error).toBe("boom");

  var circ = {};
  circ.self = circ;
  var c4 = collector();
  var circLog = logs.createLogger({write: c4.write, now: fixedNow()});
  circLog.info("circular", {circ: circ});
  expect(JSON.parse(c4.lines[0]).msg).toBe("circular");
});
