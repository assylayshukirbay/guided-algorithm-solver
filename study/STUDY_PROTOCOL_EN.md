# Research protocol — Assignment 3 (planned, not conducted)

## Alignment with Assignment 2

**Title:** Effects of a Scaffolded Mobile Application on Algorithmic Problem-Solving Performance Among Novice University Programmers: A Quasi-Experimental Study.

**Primary research question:** How does practice with a scaffolded mobile application, compared with practice using standard non-scaffolded problem sets, affect the performance of novice university programmers on pre-coding algorithmic problem-solving tasks?

**Aim:** To investigate whether practising with a scaffolded mobile application improves novice university programmers' performance on pre-coding algorithmic problem-solving tasks compared with practising with standard non-scaffolded problem sets.

**Objectives:** (1) identify literature-grounded scaffolds; (2) build the four-stage mobile prototype; (3) compare pre/post assessments between conditions; (4) assess usability, usefulness and exploratory associations between scaffold usage and performance.

## Proposed methodology

- **Design:** Nonrandomized, quasi-experimental comparison with pre-test and post-test, possible post-test ANCOVA adjusting for baseline. No causal claim without limitations.
- **Participants:** Target N=40 (20 experimental, 20 control); first-year CS/Software Engineering/related programs taking introductory programming. N is a recruitment target, not actual sample size or power guarantee.
- **Recruitment:** Approval from the university/instructor and voluntary informed consent **before** recruitment or collection. Document inclusion (novices in introductory programming) and exclusion (extensive prior programming experience) criteria consistently.
- **Intervention:** 2–3 weeks of scaffolded four-stage mobile tasks: Understand, Decompose, Design, Pseudocode. Track hints and attempts by random session identifiers. Optional independent transfer practice is formative, not a primary outcome.
- **Comparison:** Standard problem sets addressing the same targets and providing comparable amount of practice/time but **without** interactive decomposition prompts, worked example-on-demand and fading hints. Avoid handing the control group fewer general theory resources.
- **Baseline:** Both groups receive the same foundation learning content (the app's foundation content can also be provided as a handout/video to controls). Record prior experience before assignment.
- **Measurement:** Common pre/post tasks and 10-point analytic rubric for each task; consider two comparable tasks per test (score 0–20). Counterbalance comparable assessment forms where feasible, with an instructor review of equivalence.
- **Scoring rubric:** understanding (0–2), decomposition (0–2), algorithm logic/order (0–3), pseudocode/planning (0–3). Operational descriptors, graders, and inter-rater procedure should be fixed before actual study.
- **Analysis:** Descriptive stats; baseline comparison; primary ANCOVA (`post ~ group + pre`) only when assumptions and sample properties warrant; otherwise clearly labelled descriptive/robust alternative; 95% CI and effect size. Explore hint counts vs post scores only for experimental arm with baseline adjustment. Report missing data and attrition, not selectively removed participants.
- **Usability:** After practice, experimental participants complete a brief survey on ease of use, feedback, usefulness, learning flow; report descriptive item distributions. If using a validated scale, obtain official item wording and scoring rules rather than calling a self-written form validated.
- **Quality:** Pilot instruments with permission; check task difficulty/content validity with lecturer; standardized instructions, identical time windows, common graders, blindness where possible. Discuss small convenience sample and selection bias.
- **Ethics:** Participant names/email/IDs not collected by prototype. Researchers must not repurpose app's developer sessions as real student data. Secure local SQLite database, permission-limited access; establish retention period and encrypted transfer plan before recruitment. No grade consequences for refusal.

## Study vs product distinction

The app's 10-point guided score and independent challenge result are **training feedback**, not evidence of treatment impact. Pre/post performance is a separately scored external measure for both groups, to avoid a built-in advantage for the experimental condition.

## What is not yet done

No participant recruitment, informed consent, field observation, pre/post data, user survey responses, effect size, or inferential results have been produced by this repository. The practical evidence is software tests, implementation code and any screenshots the student captures from her own live run.
