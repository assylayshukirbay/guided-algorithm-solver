const { problems, stageNames } = require('./problems');

const pointCaps = { understand: 2, decompose: 2, puzzle: 3, pseudocode: 3 };
const clean = (value) => String(value ?? '').trim().replace(/\s+/g, '').toLowerCase();

function scoreAttempt(problemId, stage, answer) {
  const problem = problems.find((p) => p.id === problemId);
  if (!problem) throw new Error('Unknown problem');
  if (!stageNames.includes(stage)) throw new Error('Unknown stage');
  if (!answer || typeof answer !== 'object' || Array.isArray(answer)) throw new Error('Answer must be an object');
  let points = 0;
  let feedback = '';
  let details = [];

  if (stage === 'understand') {
    details = problem.understand.map((q) => ({
      questionId: q.id,
      correct: Number(answer[q.id]) === q.correct,
    }));
    // Missing values do not accidentally match an expected index.
    details = details.map((d) => ({ ...d, correct: Object.hasOwn(answer, d.questionId) && d.correct }));
    points = details.filter((d) => d.correct).length;
    feedback = points === 2 ? 'Great! You identified the input and expected output.' : 'Review what the algorithm receives and what it must display.';
  } else if (stage === 'decompose') {
    if (!Array.isArray(answer.ids) || answer.ids.some((v) => typeof v !== 'string')) throw new Error('Choose an array of subtask IDs');
    const valid = new Set(problem.decompose.map((s) => s.id));
    if (answer.ids.some((id) => !valid.has(id))) throw new Error('Unknown subtask ID');
    const chosen = new Set(answer.ids);
    const expected = new Set(problem.decompose.filter((s) => s.correct).map((s) => s.id));
    const missing = [...expected].filter((id) => !chosen.has(id));
    const extra = [...chosen].filter((id) => !expected.has(id));
    const errors = missing.length + extra.length;
    points = errors === 0 ? 2 : errors === 1 ? 1 : 0;
    details = { missingCount: missing.length, extraCount: extra.length };
    feedback = errors === 0 ? 'Exactly right. These are the necessary subtasks.' : 'Review your selected subtasks: focus on input, processing, and output.';
  } else if (stage === 'puzzle') {
    if (!Array.isArray(answer.order) || answer.order.some((v) => typeof v !== 'string')) throw new Error('Send an ordered array of step IDs');
    const expected = problem.puzzle.map((s) => s.id);
    if (answer.order.length !== expected.length || new Set(answer.order).size !== expected.length || answer.order.some((id) => !expected.includes(id))) throw new Error('Puzzle must contain each step once');
    const rightPositions = answer.order.filter((id, index) => id === expected[index]).length;
    points = rightPositions === expected.length ? 3 : rightPositions / expected.length >= 0.75 ? 2 : rightPositions / expected.length >= 0.5 ? 1 : 0;
    details = { correctPositions: rightPositions, totalPositions: expected.length };
    feedback = points === 3 ? 'Excellent. The algorithm is in the correct order.' : 'Check the sequence: read input first, display the result last.';
  } else if (stage === 'pseudocode') {
    details = problem.pseudocode.fields.map((field) => ({
      fieldId: field.id, correct: field.answers.some((v) => clean(v) === clean(answer[field.id])),
    }));
    points = details.filter((d) => d.correct).length;
    feedback = points === 3 ? 'Excellent. Your pseudocode is correct!' : 'Some expressions need revision. Recheck variables and operations.';
  }
  return { points, maxPoints: pointCaps[stage], correct: points === pointCaps[stage], feedback, details };
}
module.exports = { scoreAttempt, pointCaps };
