// Structured learning content. The answers below stay on the server.
const problems = [
  {
    id: 'even-odd', title: 'Even or Odd', difficulty: 'Easy', topic: 'Conditions',
    description: 'Read an integer and determine whether it is even or odd. Display "Even" or "Odd".',
    examples: [{ input: '8', output: 'Even' }, { input: '7', output: 'Odd' }, { input: '-4', output: 'Even' }, { input: '0', output: 'Even' }],
    understand: [
      { id: 'input', question: 'What type of input does the algorithm require?', options: ['A string', 'An integer', 'A list of numbers', 'A Boolean'], correct: 1 },
      { id: 'output', question: 'What should the algorithm output?', options: ['The square of the number', 'The number divided by two', 'Whether the number is even or odd', 'The largest number'], correct: 2 },
    ],
    decompose: [
      { id: 'read', text: 'Read the integer', correct: true },
      { id: 'remainder', text: 'Calculate the remainder after division by 2', correct: true },
      { id: 'classify', text: 'Determine whether the remainder is zero', correct: true },
      { id: 'output', text: 'Display Even or Odd', correct: true },
      { id: 'sort', text: 'Sort multiple numbers', correct: false },
      { id: 'sqrt', text: 'Calculate the square root', correct: false },
    ],
    puzzle: [
      { id: 'ev_owl', text: 'Read integer n.' },
      { id: 'ev_birch', text: 'If n MOD 2 = 0, set result to "Even".' },
      { id: 'ev_cloud', text: 'Otherwise, set result to "Odd".' },
      { id: 'ev_rose', text: 'Display the result.' },
    ],
    puzzleShuffled: ['ev_rose', 'ev_cloud', 'ev_owl', 'ev_birch'],
    pseudocode: {
      lines: ['INPUT n', 'IF n MOD {{divisor}} = 0 THEN', '    OUTPUT "{{even}}"', 'ELSE', '    OUTPUT "{{odd}}"', 'END IF'],
      fields: [
        { id: 'divisor', prompt: 'Divisor in MOD condition', placeholder: 'e.g. 2', answers: ['2'] },
        { id: 'even', prompt: 'Output when remainder is zero', placeholder: 'Even or Odd', answers: ['Even'] },
        { id: 'odd', prompt: 'Output otherwise', placeholder: 'Even or Odd', answers: ['Odd'] },
      ],
    },
    hints: {
      understand: ['Identify the input and the expected classification.', 'We need one whole number and an Even/ Odd output.'],
      decompose: ['Find input, decision and output actions.', 'Use MOD 2 to choose which label to display.'],
      puzzle: ['Input must be read before the condition.', 'Keep both decision branches before displaying the result.'],
      pseudocode: ['Even numbers have zero remainder on division by 2.', 'Use MOD 2; the true branch outputs Even, the other Odd.'],
    },
    workedExample: 'For n = 11, 11 MOD 2 = 1, so the output is Odd.',
  },
  {
    id: 'find-maximum', title: 'Find Maximum of Three Numbers', difficulty: 'Easy', topic: 'Comparisons',
    description: 'Read three integers and display the largest. Handle equal and negative numbers correctly.',
    examples: [{ input: '4, 9, 2', output: '9' }, { input: '-8, -3, -5', output: '-3' }, { input: '7, 7, 2', output: '7' }, { input: '5, 5, 5', output: '5' }],
    understand: [
      { id: 'input', question: 'How many input values are required?', options: ['One', 'Two', 'Three', 'Any number'], correct: 2 },
      { id: 'output', question: 'What should the algorithm return?', options: ['The sum', 'The smallest number', 'The largest number', 'The average'], correct: 2 },
    ],
    decompose: [
      { id: 'read', text: 'Read three input numbers', correct: true },
      { id: 'init', text: 'Set the first number as the current maximum', correct: true },
      { id: 'compare-b', text: 'Compare the second number with the current maximum', correct: true },
      { id: 'compare-c', text: 'Compare the third number with the current maximum', correct: true },
      { id: 'display', text: 'Display the final maximum', correct: true },
      { id: 'average', text: 'Calculate the average', correct: false },
      { id: 'multiply', text: 'Multiply all three numbers', correct: false },
    ],
    puzzle: [
      { id: 'max_river', text: 'Read integers a, b, and c.' },
      { id: 'max_leaf', text: 'Set maxValue to a.' },
      { id: 'max_ash', text: 'If b > maxValue, update maxValue to b.' },
      { id: 'max_sun', text: 'If c > maxValue, update maxValue to c.' },
      { id: 'max_pine', text: 'Display maxValue.' },
    ],
    puzzleShuffled: ['max_sun', 'max_pine', 'max_leaf', 'max_river', 'max_ash'],
    pseudocode: {
      lines: ['INPUT a, b, c', 'maxValue <- {{initial}}', 'IF b > maxValue THEN', '    maxValue <- {{second}}', 'END IF', 'IF c > maxValue THEN', '    maxValue <- {{third}}', 'END IF', 'OUTPUT maxValue'],
      fields: [
        { id: 'initial', prompt: 'Initial value of maxValue', placeholder: 'variable name', answers: ['a'] },
        { id: 'second', prompt: 'Value assigned after comparing b', placeholder: 'variable name', answers: ['b'] },
        { id: 'third', prompt: 'Value assigned after comparing c', placeholder: 'variable name', answers: ['c'] },
      ],
    },
    hints: {
      understand: ['You need to compare three provided values.', 'Output a single value: the greatest of the three.'],
      decompose: ['Track the largest value seen so far.', 'Start with a; compare against b and c, then display.'],
      puzzle: ['Initialize maxValue before any comparisons.', 'Compare b, then c, then display the final maxValue.'],
      pseudocode: ['The maximum can start as the first input.', 'Use a, b, and c in that order as assignment values.'],
    },
    workedExample: 'For (6, 12, 9): start maxValue=6; compare b=12 so maxValue=12; c=9 does not change it; output 12.',
  },
  {
    id: 'calculate-average', title: 'Calculate Average of Three Numbers', difficulty: 'Easy', topic: 'Arithmetic',
    description: 'Read three numbers, calculate their sum, divide the sum by three, and display the arithmetic mean.',
    examples: [{ input: '4, 8, 12', output: '8' }, { input: '2, 4, 9', output: '5' }, { input: '-3, 0, 3', output: '0' }, { input: '1.5, 2.5, 5', output: '3' }],
    understand: [
      { id: 'input', question: 'What input is needed?', options: ['Three numeric values', 'One integer', 'A list of strings', 'Two Boolean values'], correct: 0 },
      { id: 'output', question: 'What is the arithmetic mean?', options: ['The largest value', 'The sum divided by the number of values', 'The product of all values', 'The range'], correct: 1 },
    ],
    decompose: [
      { id: 'read', text: 'Read three numbers', correct: true },
      { id: 'sum', text: 'Calculate their sum', correct: true },
      { id: 'divide', text: 'Divide the sum by 3', correct: true },
      { id: 'display', text: 'Display the average', correct: true },
      { id: 'sort', text: 'Sort the numbers', correct: false },
      { id: 'minimum', text: 'Find the smallest number', correct: false },
    ],
    puzzle: [
      { id: 'avg_dawn', text: 'Read numbers a, b, and c.' },
      { id: 'avg_fern', text: 'Calculate sum = a + b + c.' },
      { id: 'avg_coral', text: 'Calculate average = sum / 3.' },
      { id: 'avg_wave', text: 'Display the average.' },
    ],
    puzzleShuffled: ['avg_coral', 'avg_wave', 'avg_dawn', 'avg_fern'],
    pseudocode: {
      lines: ['INPUT a, b, c', 'sum <- {{expression}}', 'average <- sum / {{divisor}}', 'OUTPUT {{output}}'],
      fields: [
        { id: 'expression', prompt: 'Expression to calculate the sum', placeholder: 'e.g. a + b', answers: ['a+b+c', 'a+c+b', 'b+a+c', 'b+c+a', 'c+a+b', 'c+b+a'] },
        { id: 'divisor', prompt: 'Number of values', placeholder: 'number', answers: ['3'] },
        { id: 'output', prompt: 'Variable to display', placeholder: 'variable name', answers: ['average'] },
      ],
    },
    hints: {
      understand: ['What values are needed for a mean?', 'Three numeric inputs and one average output.'],
      decompose: ['Think about intermediate arithmetic.', 'Add the three values, divide by 3, and display.'],
      puzzle: ['You must read inputs before calculating.', 'Sum comes before average; output comes last.'],
      pseudocode: ['Sum the three values first.', 'Use a + b + c, divide by 3, and output average.'],
    },
    workedExample: 'For (6, 9, 12): sum=27, average=27/3=9.',
  },
];

const stageNames = ['understand', 'decompose', 'puzzle', 'pseudocode'];
const teachingNotes = {
  'even-odd': {
    concept: 'Making decisions with IF / ELSE',
    why: 'Programs often need to classify input before choosing what to do next. Even/odd is a small example of decision-making.',
    method: 'Ask what the input is, choose a test, and then select one of two possible outputs.',
    realLife: 'A game alternates turns based on whether a round number is even or odd.',
    python: 'n = int(input())\nprint("Even" if n % 2 == 0 else "Odd")',
  },
  'find-maximum': {
    concept: 'Comparing values with a running maximum',
    why: 'Finding the best or largest value is useful in scores, measurements, prices, and data processing.',
    method: 'Store the largest value seen so far and update it when another value is larger.',
    realLife: 'A weather app compares temperature readings to report the highest temperature.',
    python: 'a, b, c = 6, 12, 9\nmaximum = a\nif b > maximum: maximum = b\nif c > maximum: maximum = c\nprint(maximum)',
  },
  'calculate-average': {
    concept: 'Breaking a calculation into smaller steps',
    why: 'A complex calculation becomes easier when you identify intermediate results, such as a sum.',
    method: 'Read the values, calculate a sum, divide by the count, and display the result.',
    realLife: 'A teacher calculates the average score of three quizzes.',
    python: 'a, b, c = 4, 8, 12\ntotal = a + b + c\naverage = total / 3\nprint(average)',
  },
};

function publicProblem(problem) {
  if (!problem) return null;
  return {
    id: problem.id, title: problem.title, difficulty: problem.difficulty,
    topic: problem.topic, description: problem.description, examples: problem.examples,
    understand: problem.understand.map(({ id, question, options }) => ({ id, question, options })),
    decompose: problem.decompose.map(({ id, text }) => ({ id, text })),
    puzzle: problem.puzzleShuffled.map((id) => problem.puzzle.find((s) => s.id === id)),
    pseudocode: {
      lines: problem.pseudocode.lines,
      fields: problem.pseudocode.fields.map(({ id, prompt, placeholder }) => ({ id, prompt, placeholder })),
    },
    hints: problem.hints,
    workedExample: problem.workedExample,
    teaching: teachingNotes[problem.id],
    independent: require('./independent').publicChallenge(problem.id),
  };
}

module.exports = { problems, stageNames, publicProblem };
