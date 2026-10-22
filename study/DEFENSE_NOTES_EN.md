# Oral defense — short speaking notes (English)

**Project motivation (25 seconds).** Our project addresses a recurring difficulty among novice university programmers: students may recognize syntax but struggle to turn a problem statement into a logical plan. Guided Algorithm Solver is a mobile-first educational prototype designed for the pre-coding stage, not a general Python course.

**What we built (40 seconds).** We built a React Native and Expo frontend connected to a Node.js and Express API with an SQLite database. Beginners start with three concise foundation lessons, then solve tasks through four stages: understanding, decomposition, algorithm design, and pseudocode. Optional hints, worked examples, feedback, and decreasing emphasis on help create the scaffolding. A new independent challenge checks transfer without stepwise prompts. The app stores attempts, first-try scores, hints, time and progress under pseudonymous session IDs.

**How it works (30 seconds).** The phone requests a problem from the backend. Users select answers and reorder puzzle steps. The server validates and scores the submitted attempt and writes it to SQLite. The results endpoint reconstructs saved progress. We can demonstrate the API health endpoint, one complete problem and score persistence after restart.

**How we plan to evaluate it (35 seconds).** Our proposed quasi-experimental design includes 40 first-year novice programmers, 20 per group. Both groups will receive equal foundation knowledge. Experimental participants use the scaffolded app; controls practise matched tasks without scaffolds. Both take external pre- and post-tests, scored on a common analytic rubric. A post-test comparison adjusted for pre-test performance is planned only if assumptions permit. Usability feedback and hint logs are secondary exploratory measures.

**Honest limitations (20 seconds).** The prototype runs locally and is not a production application. The planned human-subject experiment and external usability data are not yet collected. We have implemented and automatically tested backend behaviour; real iPhone screenshots and actual study records must be added after verification and approvals.

**Likely questions**

- **Why not teach Python syntax?** Our approved research outcome is pre-coding algorithmic problem-solving, which transfers across programming languages.
- **Why foundation lessons?** Novices need common concepts to understand activities; for fair comparison both study groups receive equivalent base instruction.
- **What is scaffolding?** Structured support that helps learners tackle difficult steps, such as decomposition prompts, worked examples, optional hints, and gradual fading.
- **Is a game score a research outcome?** No; formative scores give feedback. Main outcomes come from independent external pre/post assessments.
- **Is this causal proof?** No; the design is quasi-experimental and can be affected by selection bias. The data have not yet been collected.
