# Study Session CLI

A small JavaScript command-line program for recording study sessions. It saves a JSON file and adds up the last seven days by subject. It uses only Node's built-in modules.

## Try it

Use Node.js 22 or newer. No install step is needed. In the repository folder with no existing `.sessions.json`, run:

```sh
node cli.js add "Algorithms" 45 2026-10-10
node cli.js add "SQL" 30 2026-10-09
node cli.js list
node cli.js summary 2026-10-10
```

The summary prints:

```text
2026-10-04 to 2026-10-10: 75 minutes across 2 sessions
  Algorithms: 45 min
  SQL: 30 min
```

Run the example once for this result; repeating `add` records more sessions.

## Commands and storage

- `add "Subject" MINUTES [DATE]` records a session.
- `list` prints sessions in date order.
- `summary [DATE]` totals that date and the preceding six days.
- `--help` prints the command syntax.

Dates use `YYYY-MM-DD`; omitting a date uses today's local date. Minutes must be an integer from 1 to 1440. Subject names are trimmed and case-sensitive. Invalid input or an unreadable data file returns exit code 1.

Data goes in `.sessions.json` in the current directory, which is ignored by Git. To use another path:

```sh
STUDY_FILE=./data/study.json node cli.js add "Python" 25
```

In PowerShell, set `$env:STUDY_FILE = './data/study.json'` first. Writes go through a temporary file, and invalid existing JSON is reported rather than replaced.

## Tests

```sh
npm test
```

Tests cover saved sessions, validation, the seven-day window, corrupt files, and the CLI. GitHub Actions runs them on Node.js 22 and 24. The date and file logic lives in `src/sessions.js`; `cli.js` handles arguments and output.

## Limitations

This is a manual log, so it does not time sessions. There is no edit/delete command. Run one command at a time: concurrent writes can lose entries. The whole log is read into memory. Keep a backup of the JSON file if you want to keep the records.

[MIT license](LICENSE).
