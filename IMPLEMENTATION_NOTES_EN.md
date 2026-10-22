# Implementation notes — version 2

## Architecture

Mobile: React Native + Expo 57 (React 19.2.3, React Native 0.86) with AsyncStorage for one pseudonymous development session and optional local lesson completion fallback. Backend: Node 22.13+, Express 5 and built-in `node:sqlite` `DatabaseSync` persisted at `server/data/solver.sqlite`. Mobile talks over JSON/HTTP on port 3001 via `mobile/src/api.js`. The server is locally hosted, so the phone must reach the laptop over the network. Expo tunnel supports the Metro development connection, not the backend HTTP port.

## Core API

- GET `/api/health` — health response.
- POST `/api/sessions` — create/resume anonymous UUID.
- GET `/api/problems` — catalog.
- GET `/api/problems/:id` — public problem text, learning context, hidden-key choices, staged hints, practice challenge description.
- POST `/api/attempts` — validate and score a guided stage, persist answer, first/best progress.
- POST `/api/events` — persist `hint_opened`, `worked_example_opened`.
- GET `/api/results/:sessionId` — formative summary including external practice completion.
- GET `/api/foundations/:sessionId` — foundation completion IDs.
- POST `/api/foundations/completions` — persist foundation lesson.
- POST `/api/challenges/attempts` — validate new transfer problem, return feedback, persist first and repeated attempts.

## Schema and data minimization

`session(id, created_at)`, `attempts`, `events`, `foundation_completions`, `challenge_attempts` with foreign keys. No names, institutional IDs, dates of birth, email, or passwords. Device sessions are pseudonymous. API is designed only for local prototypes and has **no authentication, TLS, fine-grained access control, or deployment hardening**; don't expose it publicly or use it with actual participants before the ethics/security review.

## Educational design / scope

Three local Foundation lessons show Input→Process→Output, variables/conditions/loops, and the four-step method. They contain formative comprehension questions and save completion. Beginner micro-lessons explain the real-world value of each of 3 guided problems. The four stages match A2, and the teacher-supplied content uses server-side answer keys. The code example (Python) is optional after guided completion; the study outcome remains language-independent pre-coding work. Independent transfer challenges are new contexts without hints; **they are not the common external post-test**.

## Known limits and future extensions

Three problems only; no authentication; data lives on one laptop; assignment content and rubric require instructor/participant validation. `fading` currently offers optional help with lower prominence only after two perfect, hint-free first-try completed challenges, a heuristic not established by research. UI is not experimentally validated. Frontend packaging/iOS end-to-end run must be verified on a device. Test data are program-generated development tests; no empirical outcomes.

## Verification recorded during authoring

- `node --test server/test/*.test.js`: 10/10 tests passed in the build environment (Node v22.16.0; `node:sqlite` ExperimentalWarning expected).
- TypeScript JSX parser: `mobile/App.js` parsed with 0 syntax diagnostics.
- npm installation, Expo Metro bundling and execution on the student's physical iPhone were not available in the build environment and remain verification steps for the user.
