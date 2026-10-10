import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function validateSession(session) {
  if (!session || typeof session.subject !== 'string' || !session.subject.trim() || session.subject.length > 100)
    throw new Error('Subject must contain 1–100 characters.');
  if (!Number.isSafeInteger(session.minutes) || session.minutes < 1 || session.minutes > 1440)
    throw new Error('Minutes must be an integer between 1 and 1440.');
  if (!validDate(session.date)) throw new Error('Date must be a real calendar date in YYYY-MM-DD format.');
  if (typeof session.id !== 'string' || !session.id) throw new Error('Session ID is missing.');
  return session;
}

export function loadSessions(file) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  const sessions = JSON.parse(text);
  if (!Array.isArray(sessions)) throw new Error('Session file must contain a JSON array.');
  sessions.forEach(validateSession);
  if (new Set(sessions.map(s => s.id)).size !== sessions.length) throw new Error('Duplicate session IDs in file.');
  return sessions;
}

export function addSession(file, subject, minutes, date = localDate()) {
  const session = validateSession({ id: randomUUID(), subject: subject?.trim(), minutes, date });
  const sessions = loadSessions(file);
  sessions.push(session);
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temporary, `${JSON.stringify(sessions, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
    fs.renameSync(temporary, file);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
  return session;
}

export function summarize(sessions, end = localDate()) {
  if (!validDate(end)) throw new Error('Summary date must be YYYY-MM-DD.');
  const endTime = Date.parse(`${end}T00:00:00Z`);
  const start = new Date(endTime - 6 * 86400000).toISOString().slice(0, 10);
  const selected = sessions.filter(s => s.date >= start && s.date <= end);
  const subjects = new Map();
  for (const session of selected) subjects.set(session.subject, (subjects.get(session.subject) ?? 0) + session.minutes);
  return { start, end, count: selected.length,
    minutes: selected.reduce((sum, session) => sum + session.minutes, 0),
    subjects: [...subjects].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])) };
}
