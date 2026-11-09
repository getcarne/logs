// Shared test helper: check() throws on failure (uncaught -> exit 1).

function check(cond, msg) {
  if (!cond) throw new Error("FAIL: " + msg);
  console.log("ok: " + msg);
}

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

module.exports = {check: check, collector: collector, fixedNow: fixedNow};
