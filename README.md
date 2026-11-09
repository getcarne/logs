<p align="center">
  <img src="https://github.com/openpeeps/carne/blob/main/.github/carne_logo.png" alt="Carne Logo" width="140px" height="140px"><br>
  <strong>Logs</strong>, a structured logger for <a href="https://github.com/openpeeps/carne">Carne</a><br>
  JSON lines by default, colored pretty mode, file output. Pure JS.
</p>

## Install

```bash
carne pkg install logs
```

Or link a checkout while developing:

```bash
carne pkg develop /path/to/logs
```

## Usage

```js
const logs = require("pkg/logs");
const log = logs.createLogger({level: "info", pretty: true});

log.info("server started", {port: 3000});
log.warn("disk nearly full", {pct: 91});
log.error("request failed", {path: "/users", code: 500});

const api = log.child({service: "api"});
api.info("incoming request", {method: "GET"});
```

JSON mode (default) emits one object per line:

```js
const log = logs.createLogger({level: "debug"});
log.info("hi", {n: 1});
// {"time":"2026-01-01T00:00:00.000Z","level":"info","msg":"hi","n":1}
```

File output appends via `std/os`:

```js
const log = logs.createLogger({dest: "/var/log/app.log"});
log.error("boom");
```

## API

`createLogger(opts)` where `opts` is:

- `level` (`debug` | `info` | `warn` | `error`, default `"info"`).
  Overridden by the `LOG_LEVEL` env var when `level` is omitted.
- `pretty` (bool, default `false`). One human-readable line per
  record instead of JSON.
- `color` (bool, default auto). Pretty colors follow `NO_COLOR` and
  `TERM=dumb` like the carne CLI.
- `dest` (path string). When set, lines are appended to the file;
  otherwise they go to `console.log` (or `write`).
- `write(fn)` custom sink, receives the line without trailing
  newline. Useful for tests.
- `now(fn)` timestamp source, defaults to ISO time. Useful for
  tests.
- `base` (object) fields merged into every record.

Returns `{level, debug, info, warn, error, child}`. Each method is
`(msg, fields?)`: `msg` must be a string, `fields` a plain object.
`child(fields)` returns a logger with bound fields; call fields win
on collision. `Error` values serialize to `{error, stack}` and
circular fields degrade to strings, never throw.

`logs.levels` exposes `{debug: 10, info: 20, warn: 30, error: 40}`.

## Limits in v1

- File `dest` appends synchronously and blocks the loop like
  `std/os`. Fine for scripts and small servers, not for hot paths.
- No log rotation; pair with an external rotator or open a new
  logger per file.
- CommonJS only, like every Carne package.

## Tests

```bash
carne run tests/run.js
```

## License

MIT.
