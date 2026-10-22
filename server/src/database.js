const path = require('node:path');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');

function createDatabase(filename = path.join(__dirname, '..', 'data', 'solver.sqlite')) {
  if (filename !== ':memory:') fs.mkdirSync(path.dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL REFERENCES sessions(id),
      problem_id TEXT NOT NULL,
      stage TEXT NOT NULL,
      answer_json TEXT NOT NULL,
      points INTEGER NOT NULL,
      max_points INTEGER NOT NULL,
      hints_used INTEGER NOT NULL DEFAULT 0,
      seconds_spent INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS foundation_completions (
      session_id TEXT NOT NULL REFERENCES sessions(id),
      lesson_id TEXT NOT NULL,
      completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (session_id, lesson_id)
    );
    CREATE TABLE IF NOT EXISTS challenge_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL REFERENCES sessions(id),
      problem_id TEXT NOT NULL,
      choice INTEGER NOT NULL,
      correct INTEGER NOT NULL,
      seconds_spent INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS challenge_by_session ON challenge_attempts(session_id, problem_id);
    CREATE INDEX IF NOT EXISTS attempts_by_session ON attempts(session_id, problem_id, stage);
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL REFERENCES sessions(id),
      problem_id TEXT NOT NULL,
      stage TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_data TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  return db;
}
module.exports = { createDatabase };
