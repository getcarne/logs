// Core logger: levels, JSON + pretty formatting, console/file sinks.
// Only std deps are std/os (file dest) and std/env (LOG_LEVEL,
// NO_COLOR). Everything else is plain JS so records stay cheap.

var os = require("std/os");

var LEVELS = {debug: 10, info: 20, warn: 30, error: 40};

var RESET = "\x1b[0m";
var LEVEL_COLOR = {
  debug: "\x1b[2m",
  info: "\x1b[36m",
  warn: "\x1b[33m",
  error: "\x1b[31m"
};

function envGet(key) {
  try {
    var env = require("std/env");
    var get = env.getEnv || env.getenv;
    if (typeof get === "function") return get.call(env, key);
  } catch (e) {}
  return undefined;
}

function useColor(explicit) {
  if (explicit === true) return true;
  if (explicit === false) return false;
  if (envGet("NO_COLOR") !== undefined) return false;
  if (envGet("TERM") === "dumb") return false;
  return true;
}

function normalizeLevel(lvl, dflt) {
  if (lvl === undefined || lvl === null) return dflt;
  if (typeof lvl !== "string" || !LEVELS.hasOwnProperty(lvl.toLowerCase())) {
    throw new Error("logs: level must be debug|info|warn|error, got " + JSON.stringify(lvl));
  }
  return lvl.toLowerCase();
}

function checkFields(fields, method) {
  if (fields === undefined) return {};
  if (fields === null || typeof fields !== "object" || Array.isArray(fields)) {
    throw new Error("logs: " + method + " fields must be an object");
  }
  return fields;
}

function safeValue(v) {
  if (v instanceof Error) {
    var out = {error: v.message};
    if (v.stack !== undefined) out.stack = String(v.stack);
    return out;
  }
  return v;
}

function buildEntry(base, fields, level, msg, now) {
  var entry = {time: now(), level: level, msg: msg};
  var k;
  for (k in base) entry[k] = safeValue(base[k]);
  for (k in fields) entry[k] = safeValue(fields[k]);
  return entry;
}

function toJson(entry) {
  try {
    return JSON.stringify(entry);
  } catch (e) {}
  // Circular fields: retry with String() fallbacks, never throw.
  var flat = {};
  for (var k in entry) {
    try {
      JSON.stringify(entry[k]);
      flat[k] = entry[k];
    } catch (e2) {
      flat[k] = String(entry[k]);
    }
  }
  return JSON.stringify(flat);
}

function formatPair(k, v) {
  var s;
  if (typeof v === "string") {
    s = (v.indexOf(" ") >= 0 || v.indexOf("=") >= 0) ? JSON.stringify(v) : v;
  } else {
    try {
      s = JSON.stringify(v);
    } catch (e) {
      s = String(v);
    }
  }
  return k + "=" + s;
}

function formatPretty(entry, color) {
  var parts = [entry.time, entry.level.toUpperCase(), entry.msg];
  for (var k in entry) {
    if (k === "time" || k === "level" || k === "msg") continue;
    parts.push(formatPair(k, entry[k]));
  }
  var line = parts.join(" ");
  if (!color) return line;
  return (LEVEL_COLOR[entry.level] || "") + line + RESET;
}

function createLogger(opts) {
  opts = opts || {};
  if (typeof opts !== "object" || Array.isArray(opts)) {
    throw new Error("logs: options must be an object");
  }
  var envLevel = envGet("LOG_LEVEL");
  var level = normalizeLevel(
    opts.level !== undefined ? opts.level : (envLevel !== undefined ? envLevel : "info"),
    "info"
  );
  var pretty = opts.pretty === true;
  var color = useColor(opts.color);
  var dest = opts.dest;
  if (dest !== undefined && typeof dest !== "string") {
    throw new Error("logs: dest must be a file path string");
  }
  var write = opts.write;
  if (write !== undefined && typeof write !== "function") {
    throw new Error("logs: write must be a function");
  }
  var now = opts.now;
  if (now !== undefined && typeof now !== "function") {
    throw new Error("logs: now must be a function");
  }
  if (now === undefined) now = function () { return new Date().toISOString(); };
  var base = checkFields(opts.base, "base");
  var seen = {};
  for (var bk in base) seen[bk] = base[bk];

  function emit(lvl, msg, fields) {
    if (LEVELS[lvl] < LEVELS[level]) return;
    if (typeof msg !== "string") {
      throw new Error("logs: " + lvl + " message must be a string");
    }
    var entry = buildEntry(seen, checkFields(fields, lvl), lvl, msg, now);
    var line = pretty ? formatPretty(entry, color) : toJson(entry);
    if (dest !== undefined) {
      os.appendFile(dest, line + "\n");
    } else if (write !== undefined) {
      write(line);
    } else {
      console.log(line);
    }
  }

  function child(fields) {
    var f = checkFields(fields, "child");
    var merged = {};
    var k;
    for (k in seen) merged[k] = seen[k];
    for (k in f) merged[k] = f[k];
    return createLogger({
      level: level, pretty: pretty, color: color,
      dest: dest, write: write, now: now, base: merged
    });
  }

  return {
    level: level,
    debug: function (msg, fields) { emit("debug", msg, fields); },
    info: function (msg, fields) { emit("info", msg, fields); },
    warn: function (msg, fields) { emit("warn", msg, fields); },
    error: function (msg, fields) { emit("error", msg, fields); },
    child: child
  };
}

module.exports = {createLogger: createLogger, LEVELS: LEVELS};
