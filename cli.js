#!/usr/bin/env node
import { addSession, loadSessions, summarize } from './src/sessions.js';

const help = `Study Session CLI
  node cli.js add "Subject" MINUTES [YYYY-MM-DD]
  node cli.js list
  node cli.js summary [YYYY-MM-DD]
Data: STUDY_FILE environment variable, otherwise .sessions.json in the current directory.`;

const [command, ...args] = process.argv.slice(2);
const file = process.env.STUDY_FILE || '.sessions.json';
try {
  if (command === 'add' && (args.length === 2 || args.length === 3)) {
    if (!/^\d+$/.test(args[1])) throw new Error('Minutes must be a positive integer.');
    const session = addSession(file, args[0], Number(args[1]), args[2]);
    console.log(`Saved ${session.minutes} minutes of ${session.subject} on ${session.date}.`);
  } else if (command === 'list' && args.length === 0) {
    const sessions = loadSessions(file).sort((a, b) => a.date.localeCompare(b.date));
    if (!sessions.length) console.log('No sessions yet.');
    for (const s of sessions) console.log(`${s.date} | ${s.subject} | ${s.minutes} min`);
  } else if (command === 'summary' && args.length <= 1) {
    const report = summarize(loadSessions(file), args[0]);
    console.log(`${report.start} to ${report.end}: ${report.minutes} minutes across ${report.count} sessions`);
    for (const [subject, minutes] of report.subjects) console.log(`  ${subject}: ${minutes} min`);
  } else if (command === '--help' || command === undefined) {
    console.log(help);
  } else {
    throw new Error(`Unknown command or incorrect arguments.\n${help}`);
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
