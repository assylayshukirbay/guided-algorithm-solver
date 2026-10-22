# Practical evidence plan — record only genuine observations

## Automated tests

From `server` run `npm test`. Expected suites test correctness of the 3 problems, response validation, persistence, help-event logging, lesson completion and transfer challenge. Record your own terminal screenshot with `10 tests passed` only if that is what you actually see locally.

## Live acceptance checklist

| Test ID | Action | Expected output | Evidence to save |
| --- | --- | --- | --- |
| T01 | Open `GET /api/health` from laptop + iPhone | `{ok:true}` JSON | Safari screenshot |
| T02 | First launch of v2 | Welcome + four-stage learning journey | iPhone screenshot |
| T03 | Open foundation lesson and answer comprehension question | Immediate feedback and completion | iPhone screenshot |
| T04 | Select Even or Odd | Context explanation before quiz | iPhone screenshot |
| T05 | Complete Understand and Decompose | Per-stage scores and explanations | iPhone screenshots |
| T06 | Reorder algorithm cards correctly | Server returns 3/3 for puzzle | iPhone screenshot |
| T07 | Fill pseudocode correctly | Feedback and per-stage score | iPhone screenshot |
| T08 | Reveal hint and worked example in new challenge | UI shows hint; server event count increases | Screenshot before/after + Progress |
| T09 | Finish four guided stages | Review screen reports first score, best score, hints | Screenshot |
| T10 | Solve independent challenge | New transfer scenario + server feedback | Screenshot |
| T11 | Close/reopen app | Saved guided progress persists | Before/after screenshots |
| T12 | Stop Node backend then request problem | Visible connection error and retry | iPhone screenshot; restart backend afterward |

For each test note `PASS / FAIL / NOT RUN`, observation date/time, and source (real screenshot or actual console log). Do **not** label a test PASS without running it. Add real screenshots to Appendix and include the GitHub commit/PR URL from your own repository.
