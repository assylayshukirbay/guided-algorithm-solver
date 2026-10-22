# Research instruments — draft for lecturer review (not yet administered)

## Recruitment and consent essentials

Invite only eligible adults where applicable and obtain university approval before recruiting. Form introduction should identify researchers and contact, purpose, voluntary nature, estimated time, privacy, data access and retention, right to stop, lack of grading consequence, and consent decision. Record signed/online consent separately from in-app anonymous session ID where institutional rules permit. Avoid collecting student IDs in the app.

## External pre-test and post-test (distinct from in-app practice)

**Goal:** independently measure pre-coding problem analysis and planning. Both groups use the same task formats and scoring. Suggested timing: 20–25 minutes per two-task form. These are **illustrative draft items**; instructor must review and pilot parallel-form equivalence.

**Pre-test Form A, Task A1 (condition):** A delivery service charges a fixed 500-unit delivery fee when the shopping subtotal is below 5,000 units; otherwise delivery is free. Given a shopping subtotal, plan an algorithm to display the final amount to pay. Identify input/output and potential boundary case.

**Pre-test Form A, Task A2 (comparison):** A weather station reads four temperatures, which may include equal or negative values. Plan an algorithm that displays the smallest reading.

**Post-test Form B, Task B1 (condition):** A cinema applies a 10% discount when the ticket subtotal is at least 6,000 units; otherwise no discount applies. Given a subtotal, plan an algorithm to display the final amount. Identify input/output and the threshold case.

**Post-test Form B, Task B2 (comparison):** A sports tracker reads four daily distances, which may include repeated or zero values. Plan an algorithm that displays the largest distance.

**Common response template:** (1) inputs, output, constraints/boundaries; (2) logical decomposition; (3) algorithm steps in a correct order, including conditions if needed; (4) language-neutral pseudocode. Participants should not submit executable code.

### Analytic scoring rubric per task (0–10)

| Component | 0 | Intermediate | Maximum |
| --- | --- | --- | --- |
| Understanding (0–2) | Missing/wrong inputs and outputs | 1 = partly specified | 2 = accurate input/output and important constraints |
| Decomposition (0–2) | No useful subtasks | 1 = partial logical breakdown | 2 = all necessary subtasks with no substantive omissions |
| Algorithm logic (0–3) | No coherent order | 1–2 = partly correct, errors in conditions/order | 3 = coherent sequence, boundary cases handled |
| Pseudocode planning (0–3) | Missing/uninterpretable | 1–2 = readable but incomplete or inconsistent | 3 = complete, logically accurate language-neutral instructions |

Two tasks per instrument produce scores 0–20. Independently score by two graders for a subset; discuss disagreements and set resolution rules before scoring research data. Record rubric-specific points, not just totals.

## Usability and perceived usefulness questionnaire (post-use experimental arm)

Answer options for Q1–Q6: 1 Strongly disagree, 2 Disagree, 3 Neutral, 4 Agree, 5 Strongly agree.

1. The purpose of the application was clear to me.
2. I could understand what I was expected to do at each stage.
3. Decomposition prompts helped me break down programming problems.
4. Optional hints were useful when I was stuck.
5. Worked examples helped me plan a solution.
6. The application helped me feel more confident in planning algorithms before coding.
7. Which feature was most useful? (Choose one: Understanding prompts; Decomposition; Step ordering puzzle; Pseudocode; Hints; Worked examples.)
8. What should be improved? (Open text, optional.)

These are **researcher-written items**, not a validated standardized instrument. Report descriptive distributions and clearly label their status.

## Observation/log data for Objective 4

With consent and appropriate approval, extract aggregated `session_id`, `problem_id`, `stage`, stage first score, best score, attempts, seconds_spent, `hint_opened`, `worked_example_opened`, independent challenge first response. Session IDs are pseudonymous, not automatically anonymous if linked externally. Link to pre/post assessment using a separately controlled mapping only when the approved study protocol permits it.
