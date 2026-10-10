import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { addSession, loadSessions, summarize, validDate } from '../src/sessions.js';

function temp(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'study-test-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return path.join(directory, 'sessions.json');
}

test('persists multiple sessions without replacing earlier entries', t => {
  const file = temp(t);
  assert.deepEqual(loadSessions(file), []);
  addSession(file, ' Algorithms ', 45, '2026-10-10');
  addSession(file, 'SQL', 30, '2026-10-09');
  assert.equal(loadSessions(file).length, 2);
  assert.equal(loadSessions(file)[0].subject, 'Algorithms');
});

test('rejects invalid minutes, empty subjects and impossible dates', t => {
  const file = temp(t);
  for (const minutes of [0, -1, 1.5, 1441, NaN]) assert.throws(() => addSession(file, 'CS', minutes));
  assert.throws(() => addSession(file, ' ', 20));
  assert.throws(() => addSession(file, 'CS', 20, '2026-02-30'));
  assert.equal(validDate('2024-02-29'), true);
  assert.equal(fs.existsSync(file), false);
});

test('summary includes exactly seven dates and excludes future sessions', () => {
  const sessions = [
    { subject: 'CS', minutes: 20, date: '2026-10-03' },
    { subject: 'CS', minutes: 30, date: '2026-10-04' },
    { subject: 'SQL', minutes: 45, date: '2026-10-10' },
    { subject: 'CS', minutes: 60, date: '2026-10-11' },
  ];
  assert.deepEqual(summarize(sessions, '2026-10-10'), {
    start: '2026-10-04', end: '2026-10-10', count: 2, minutes: 75, subjects: [['SQL', 45], ['CS', 30]]
  });
});

test('corrupt data is reported and never overwritten', t => {
  const file = temp(t);
  fs.writeFileSync(file, 'broken');
  assert.throws(() => addSession(file, 'CS', 20));
  assert.equal(fs.readFileSync(file, 'utf8'), 'broken');
  fs.writeFileSync(file, '{}');
  assert.throws(() => loadSessions(file));
});

test('CLI works and returns a failing exit code for invalid input', t => {
  const file = temp(t);
  const cli = fileURLToPath(new URL('../cli.js', import.meta.url));
  const run = (...args) => spawnSync(process.execPath, [cli, ...args], { env: { ...process.env, STUDY_FILE: file }, encoding: 'utf8' });
  assert.equal(run('add', 'Algorithms', '45', '2026-10-10').status, 0);
  assert.match(run('summary', '2026-10-10').stdout, /45 minutes across 1 sessions/);
  assert.match(run('list').stdout, /Algorithms/);
  assert.equal(run('add', 'CS', '2.5').status, 1);
  assert.equal(run('unknown').status, 1);
});
