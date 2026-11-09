// logs basic example. Run: carne run examples/basic.js
var logs = require("../index.js");

var log = logs.createLogger({level: "debug", pretty: true});
log.debug("cache miss", {key: "user:3"});
log.info("server started", {port: 3000});
log.warn("disk nearly full", {pct: 91});
log.error("request failed", {path: "/users", code: 500});

var api = log.child({service: "api"});
api.info("incoming request", {method: "GET"});

var json = logs.createLogger({level: "info"});
json.info("json line", {structured: true});
json.error("with error", {err: new Error("boom")});

var file = logs.createLogger({dest: "/tmp/logs_demo.log"});
file.info("goes to file", {n: 1});
console.log("wrote /tmp/logs_demo.log");
