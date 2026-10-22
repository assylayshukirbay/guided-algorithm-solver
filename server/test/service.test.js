const test = require('node:test');
const assert = require('node:assert/strict');
const { createDatabase } = require('../src/database');
const { makeService } = require('../src/service');
const { scoreAttempt } = require('../src/scoring');

test('provides three problems without leaking answer keys', () => {
  const db = createDatabase(':memory:');
  const svc = makeService(db);
  assert.equal(svc.listProblems().length, 3);
  const even = svc.getProblem('even-odd');
  assert.equal(even.understand[0].correct, undefined);
  assert.equal(even.decompose[0].correct, undefined);
  assert.equal(even.pseudocode.fields[0].answers, undefined);
  db.close();
});

test('scores correct and incorrect responses', () => {
  assert.equal(scoreAttempt('even-odd', 'understand', { input: 1, output: 2 }).points, 2);
  assert.equal(scoreAttempt('even-odd', 'understand', { input: 0, output: 0 }).points, 0);
  assert.equal(scoreAttempt('even-odd', 'decompose', { ids: ['read','remainder','classify','output'] }).points, 2);
  assert.equal(scoreAttempt('even-odd', 'puzzle', { order: ['ev_owl','ev_birch','ev_cloud','ev_rose'] }).points, 3);
  assert.equal(scoreAttempt('even-odd', 'pseudocode', { divisor: '2', even: 'Even', odd: 'Odd' }).points, 3);
  assert.equal(scoreAttempt('find-maximum', 'pseudocode', { initial: 'a', second: 'b', third: 'c' }).points, 3);
  assert.equal(scoreAttempt('calculate-average', 'pseudocode', { expression: 'c + a + b', divisor: '3', output: 'average' }).points, 3);
  assert.throws(() => scoreAttempt('even-odd', 'puzzle', { order: ['ev_owl','ev_owl','ev_cloud','ev_rose'] }));
});

test('stores attempts and hint events and restores progress for session', () => {
  const db = createDatabase(':memory:');
  const svc = makeService(db);
  const { sessionId } = svc.startSession();
  assert.equal(svc.startSession(sessionId).resumed, true);
  assert.equal(svc.addAttempt({ sessionId, problemId: 'even-odd', stage: 'understand', answer: { input:1, output:2 }, hintsUsed: 0, secondsSpent: 8 }).points, 2);
  assert.equal(svc.addAttempt({ sessionId, problemId: 'even-odd', stage: 'understand', answer: { input:0, output:0 }, hintsUsed: 0, secondsSpent: 4 }).isFirstAttempt, false);
  svc.addEvent({sessionId, problemId:'even-odd', stage:'puzzle', eventType:'hint_opened',data:{level:1}});
  const result = svc.results(sessionId);
  assert.equal(result.problems[0].stageResults[0].firstScore, 2);
  assert.equal(result.problems[0].stageResults[0].bestScore, 2);
  assert.equal(result.problems[0].stageResults[0].attempts, 2);
  assert.equal(result.problems[0].hintsOpened, 1);
  assert.equal(result.completed, 0);
  db.close();
});

test('rejects malformed session, stage, and invalid attempts', () => {
  const db = createDatabase(':memory:');
  const svc = makeService(db);
  const {sessionId} = svc.startSession();
  assert.throws(() => svc.addAttempt({sessionId:'missing',problemId:'even-odd',stage:'understand',answer:{}}));
  assert.throws(() => svc.addAttempt({sessionId,problemId:'even-odd',stage:'nonexistent',answer:{}}));
  assert.throws(() => svc.addAttempt({sessionId,problemId:'even-odd',stage:'understand',answer:{},secondsSpent:-7}));
  db.close();
});
