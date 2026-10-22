// Introductory learning content is shared by experimental and control conditions.
// It is not part of the study outcome assessment.
export const FOUNDATION = [
  {
    id: 'thinking', number: '01', tag: 'THE BIG PICTURE', minutes: 4,
    title: 'Think before you code', icon: '◎',
    summary: 'Understand what a programming problem is and why planning matters.',
    intro: 'Programming is not just remembering commands. It starts with understanding a problem and describing a logical solution.',
    blocks: [
      { title: 'What is a programming problem?', body: 'A problem gives you a goal and some information. Your job is to figure out a sequence of actions that reaches the goal.' },
      { title: 'Input → Process → Output', body: 'Input is the information you receive. Process is the logic you apply. Output is the result you produce.' },
      { title: 'What is an algorithm?', body: 'An algorithm is an ordered set of clear steps for solving a problem. It is not tied to Python, Java, or any particular language.' },
    ],
    illustration: { title: 'Everyday example · Making tea', input: 'Input: water, tea, cup', process: 'Process: boil water → pour → steep', output: 'Output: a cup of tea' },
    check: { question: 'In a program that calculates a shopping total, which part is the output?', options: ['The item prices entered', 'Adding the item prices', 'The total amount displayed'], correct: 2, explanation: 'The displayed total is the output. Prices are inputs, and addition is the process.' },
    takeaway: 'Before writing code, always ask: What do I receive? What must I do? What should I produce?',
  },
  {
    id: 'building-blocks', number: '02', tag: 'CORE CONCEPTS', minutes: 6,
    title: 'Meet the building blocks', icon: '▧',
    summary: 'Recognize variables, calculations, decisions, and repetition.',
    intro: 'Most beginner programming problems combine just a few basic ideas. Understanding these ideas makes problem-solving less intimidating.',
    blocks: [
      { title: 'Variables', body: 'A variable is a named place to keep a value. Example: price = 500. You can use the value again later.' },
      { title: 'Arithmetic', body: 'You can add (+), subtract (-), multiply (*) and divide (/). MOD calculates the remainder: 7 MOD 2 = 1.' },
      { title: 'Conditions', body: 'IF and ELSE let a solution choose between actions. Example: IF age >= 18 THEN show “Adult”, ELSE show “Minor”.' },
      { title: 'Loops', body: 'Loops repeat steps. Example: repeat “add a number to the total” for each number in a list. We will practise loops in later lessons.' },
    ],
    illustration: { title: 'Example · Student discount', input: 'Input: price, isStudent', process: 'IF isStudent THEN reduce the price by 10%', output: 'Output: final price' },
    check: { question: 'Which concept helps a program choose between two actions?', options: ['A variable', 'A condition (IF / ELSE)', 'A loop'], correct: 1, explanation: 'A condition selects an action based on whether a statement is true or false.' },
    takeaway: 'The goal is not to memorize syntax, but to recognize which building block a solution needs.',
  },
  {
    id: 'four-step', number: '03', tag: 'OUR METHOD', minutes: 5,
    title: 'Solve it in four steps', icon: '↗',
    summary: 'Practise the exact pre-coding method used in our guided challenges.',
    intro: 'Instead of jumping to code, we will solve one smaller decision at a time. This method works across programming languages.',
    blocks: [
      { title: '1 · Understand', body: 'Read the question carefully. Identify input values, expected output, and special cases.' },
      { title: '2 · Decompose', body: 'Split the problem into smaller tasks. Remove steps that do not contribute to the output.' },
      { title: '3 · Design', body: 'Put the required steps into a logical order. Make sure each step can happen when it is needed.' },
      { title: '4 · Pseudocode', body: 'Describe the plan using plain, code-like instructions such as INPUT, IF, OUTPUT, and END IF.' },
    ],
    illustration: { title: 'Example · Free delivery', input: 'Input: order total', process: 'IF total >= 5000 THEN delivery is free, ELSE delivery costs 500', output: 'Output: delivery fee' },
    check: { question: 'What should you do before arranging algorithm steps?', options: ['Translate into Python immediately', 'Understand and decompose the problem', 'Memorize all code commands'], correct: 1, explanation: 'Understanding the goal and decomposing it makes algorithm design more reliable.' },
    takeaway: 'Understand → Decompose → Design → Pseudocode. Then translate the plan into code.',
  },
];

export const STUDY_NOTE = 'Foundation lessons are shared learning material, not pre-test or post-test items.';
