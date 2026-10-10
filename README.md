# Study Session CLI

A small **Node.js / JavaScript** tool for logging study time and viewing a seven-day summary by subject. Data stays in a local JSON file, and the project uses only Node's built-in modules.

## Quick start

Requires Node.js 22 or newer. No dependencies or install step.

```bash
node cli.js add "Algorithms" 45 2026-10-10
node cli.js add "SQL" 30 2026-10-09
node cli.js list
node cli.js summary 2026-10-10
```

```text
2026-10-04 to 2026-10-10: 75 minutes across 2 sessions
  Algorithms: 45 min
  SQL: 30 min
```

Omit the date to use today's local calendar date:

```bash
node cli.js add "Deep Learning" 60
node cli.js summary
node cli.js --help
```

## Commands

| Command | Purpose |
| --- | --- |
| `add "Subject" MINUTES [DATE]` | Append a completed session |
| `list` | Show all sessions ordered by date |
| `summary [DATE]` | Group minutes by subject for that date and the preceding six days |

Minutes must be an integer from 1 to 1440. Dates must be real calendar dates in `YYYY-MM-DD` format. Subject names are trimmed and case-sensitive. Invalid commands or data return exit code 1.

## Storage

Sessions are stored in `.sessions.json` in your current directory. This file is ignored by Git. You can choose another location:

```bash
STUDY_FILE=./data/study.json node cli.js add "Python" 25
```

In PowerShell, set `$env:STUDY_FILE = './data/study.json'` before running the command.

Each record contains a UUID, subject, minutes, and date. Writes use a temporary file and rename to avoid leaving partially written JSON. Invalid existing data raises an error instead of being replaced. Back up your data file if the records matter to you.

## Design and tests

```text
cli.js                   Argument handling and text output
src/sessions.js          Validation, persistence, date window and aggregation
test/sessions.test.js    Unit tests and real CLI subprocess tests
```

```bash
npm test
```

Tests cover persistence, input validation, calendar boundaries, corrupted files, and CLI behavior. GitHub Actions runs on Node.js 22 and 24.

## Scope

This is a manual session log, not a live timer. Run one command at a time: concurrent writers are not coordinated. The file is read into memory, so this is intended for personal-sized logs. Possible extensions include CSV export, editing/deleting sessions, and weekly goals.

## License

MIT — see [LICENSE](LICENSE).
