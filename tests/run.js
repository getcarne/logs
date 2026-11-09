// logs test entry: runs every case file sequentially in one run.
// Usage: carne run tests/run.js (from the package root).
var levels = require("./test_levels.js");
var pretty = require("./test_pretty.js");
var file = require("./test_file.js");
var child = require("./test_child.js");
var validation = require("./test_validation.js");

levels.run();
pretty.run();
file.run();
child.run();
validation.run();
console.log("all logs tests passed");
