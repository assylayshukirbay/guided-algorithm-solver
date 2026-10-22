// Transfer tasks use NEW numbers/scenarios rather than repeating a guided question.
// These are in-app practice checks, NOT the study's pre/post outcome instruments.
const independentChallenges = {
  'even-odd': {
    prompt: 'A ticket machine receives the integer 27. What should its even/odd algorithm display?',
    context: 'Apply the decision rule without step-by-step prompts.',
    options: ['Even', 'Odd', 'Zero', 'Cannot determine'],
    correct: 1,
    explanation: '27 MOD 2 = 1, so the integer is odd.',
  },
  'find-maximum': {
    prompt: 'A temperature sensor recorded -7, -2 and -9 degrees. What is the maximum value?',
    context: 'Track the largest value while considering negative numbers.',
    options: ['-9', '-7', '-2', '9'],
    correct: 2,
    explanation: '-2 is greater than both -7 and -9, even though all values are negative.',
  },
  'calculate-average': {
    prompt: 'A student scored 4, 10 and 16 points in three mini tasks. What is the arithmetic mean?',
    context: 'Plan the sum and division by the number of values.',
    options: ['8', '10', '12', '30'],
    correct: 1,
    explanation: '(4 + 10 + 16) / 3 = 30 / 3 = 10.',
  },
};
function publicChallenge(problemId) {
  const entry = independentChallenges[problemId];
  if (!entry) return null;
  const { prompt, context, options } = entry;
  return { prompt, context, options };
}
module.exports = { independentChallenges, publicChallenge };
