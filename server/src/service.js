const crypto = require('node:crypto');
const { problems, publicProblem, stageNames } = require('./problems');
const { scoreAttempt, pointCaps } = require('./scoring');
const { independentChallenges } = require('./independent');
const FOUNDATION_IDS = ['thinking', 'building-blocks', 'four-step'];

function makeService(db) {
  const hasSession = (sessionId) => !!db.prepare('SELECT id FROM sessions WHERE id = ?').get(sessionId);
  function startSession(existingId) {
    if (existingId !== undefined && (typeof existingId !== 'string' || !/^[a-f0-9-]{36}$/.test(existingId))) throw new Error('Invalid session ID');
    if (existingId && hasSession(existingId)) return { sessionId: existingId, resumed: true };
    const sessionId = crypto.randomUUID();
    db.prepare('INSERT INTO sessions (id) VALUES (?)').run(sessionId);
    return { sessionId, resumed: false };
  }
  function addAttempt({ sessionId, problemId, stage, answer, hintsUsed, secondsSpent }) {
    if (!hasSession(sessionId)) throw new Error('Unknown session');
    const outcome = scoreAttempt(problemId, stage, answer);
    const seconds = Number(secondsSpent ?? 0);
    const hints = Number(hintsUsed ?? 0);
    if (!Number.isInteger(seconds) || seconds < 0 || seconds > 86400) throw new Error('Invalid time spent');
    if (!Number.isInteger(hints) || hints < 0 || hints > 2) throw new Error('Invalid hint count');
    db.prepare(`INSERT INTO attempts(session_id, problem_id, stage, answer_json, points, max_points, hints_used, seconds_spent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(sessionId, problemId, stage, JSON.stringify(answer), outcome.points, outcome.maxPoints, hints, seconds);
    const count = db.prepare('SELECT COUNT(*) AS n FROM attempts WHERE session_id=? AND problem_id=? AND stage=?').get(sessionId, problemId, stage).n;
    return { ...outcome, attemptNumber: count, isFirstAttempt: count === 1 };
  }
  function addEvent({ sessionId, problemId, stage, eventType, data }) {
    if (!hasSession(sessionId)) throw new Error('Unknown session');
    if (!problems.some((p) => p.id === problemId)) throw new Error('Unknown problem');
    if (!stageNames.includes(stage)) throw new Error('Unknown stage');
    if (!['hint_opened', 'worked_example_opened'].includes(eventType)) throw new Error('Unknown event type');
    db.prepare('INSERT INTO events(session_id, problem_id, stage, event_type, event_data) VALUES(?,?,?,?,?)')
      .run(sessionId, problemId, stage, eventType, JSON.stringify(data ?? {}));
    return { saved: true };
  }
  function completedFoundations(sessionId) {
    if (!hasSession(sessionId)) throw new Error('Unknown session');
    return db.prepare('SELECT lesson_id FROM foundation_completions WHERE session_id=? ORDER BY completed_at').all(sessionId).map(r => r.lesson_id);
  }
  function completeFoundation({sessionId, lessonId}) {
    if (!hasSession(sessionId)) throw new Error('Unknown session');
    if (!FOUNDATION_IDS.includes(lessonId)) throw new Error('Unknown foundation lesson');
    db.prepare('INSERT OR IGNORE INTO foundation_completions(session_id,lesson_id) VALUES (?,?)').run(sessionId, lessonId);
    return {saved:true, completed:completedFoundations(sessionId)};
  }
  function addChallengeAttempt({sessionId,problemId,choice,secondsSpent}) {
    if (!hasSession(sessionId)) throw new Error('Unknown session');
    const item = independentChallenges[problemId];
    if (!item) throw new Error('Unknown problem');
    if (!Number.isInteger(choice) || choice < 0 || choice >= item.options.length) throw new Error('Invalid choice');
    const seconds = Number(secondsSpent ?? 0);
    if (!Number.isInteger(seconds) || seconds < 0 || seconds > 86400) throw new Error('Invalid time spent');
    // A transfer task becomes available after the four guided stages have been attempted.
    const stageCount = db.prepare('SELECT COUNT(DISTINCT stage) n FROM attempts WHERE session_id=? AND problem_id=?')
      .get(sessionId,problemId).n;
    if (stageCount < stageNames.length) throw new Error('Finish the four guided stages first');
    const isCorrect = choice === item.correct;
    db.prepare('INSERT INTO challenge_attempts(session_id,problem_id,choice,correct,seconds_spent) VALUES (?,?,?,?,?)')
      .run(sessionId,problemId,choice,isCorrect ? 1 : 0,seconds);
    const count = db.prepare('SELECT COUNT(*) n FROM challenge_attempts WHERE session_id=? AND problem_id=?').get(sessionId,problemId).n;
    return {correct:isCorrect, explanation:item.explanation, attemptNumber:count};
  }
  function results(sessionId) {
    if (!hasSession(sessionId)) throw new Error('Unknown session');
    const attempts = db.prepare('SELECT problem_id, stage, points, max_points, hints_used, seconds_spent FROM attempts WHERE session_id=? ORDER BY id').all(sessionId);
    const allEvents = db.prepare('SELECT problem_id, stage, event_type FROM events WHERE session_id=? ORDER BY id').all(sessionId);
    const challengeRows = db.prepare('SELECT problem_id,correct FROM challenge_attempts WHERE session_id=? ORDER BY id').all(sessionId);
    const byProblem = problems.map((problem) => {
      const selected = attempts.filter((r) => r.problem_id === problem.id);
      const perStage = stageNames.map((stage) => {
        const arr = selected.filter((r) => r.stage === stage);
        return { stage, firstScore: arr.length ? arr[0].points : null, bestScore: arr.length ? Math.max(...arr.map((a) => a.points)) : null, maxScore: pointCaps[stage], attempts: arr.length };
      });
      const complete = perStage.every((r) => r.attempts > 0);
      const problemEvents = allEvents.filter((e) => e.problem_id === problem.id);
      const challenges = challengeRows.filter((r) => r.problem_id === problem.id);
      return {
        problemId: problem.id, title: problem.title, complete,
        stageResults: perStage,
        firstAttemptTotal: perStage.reduce((sum, r) => sum + (r.firstScore ?? 0), 0),
        bestTotal: perStage.reduce((sum, r) => sum + (r.bestScore ?? 0), 0),
        attempts: selected.length, secondsSpent: selected.reduce((sum, r) => sum + r.seconds_spent, 0),
        hintsOpened: problemEvents.filter((e) => e.event_type === 'hint_opened').length,
        examplesOpened: problemEvents.filter((e) => e.event_type === 'worked_example_opened').length,
        independentAttempts: challenges.length, independentFirstCorrect: challenges.length ? !!challenges[0].correct : null,
        independentBestCorrect: challenges.some(r => !!r.correct),
      };
    });
    const successfulIndependent = byProblem.filter((p) => p.complete && p.hintsOpened === 0 && p.firstAttemptTotal === 10).length;
    return { sessionId, foundationCompleted: completedFoundations(sessionId), problems: byProblem, completed: byProblem.filter((p) => p.complete).length, total: problems.length, reducedHelp: successfulIndependent >= 2 };
  }
  return {
    listProblems: () => problems.map(({ id, title, difficulty, topic, description }) => ({ id, title, difficulty, topic, description })),
    getProblem: (problemId) => publicProblem(problems.find((p) => p.id === problemId)),
    startSession, addAttempt, addEvent, results, completedFoundations, completeFoundation, addChallengeAttempt,
  };
}
module.exports = { makeService };
