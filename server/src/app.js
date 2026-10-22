const express = require('express');
const { makeService } = require('./service');
const { createDatabase } = require('./database');

function createApp(db = createDatabase()) {
  const app = express();
  const service = makeService(db);
  app.use(express.json({ limit: '32kb' }));
  app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'guided-algorithm-solver' }));
  app.get('/api/problems', (_req, res) => res.json(service.listProblems()));
  app.get('/api/problems/:id', (req, res) => {
    const problem = service.getProblem(req.params.id);
    return problem ? res.json(problem) : res.status(404).json({ error: 'Problem not found' });
  });
  app.post('/api/sessions', (req, res) => {
    try { return res.json(service.startSession(req.body?.sessionId)); }
    catch (error) { return res.status(400).json({ error: error.message }); }
  });
  app.post('/api/attempts', (req, res) => {
    try { return res.json(service.addAttempt(req.body ?? {})); }
    catch (error) { return res.status(400).json({ error: error.message }); }
  });
  app.post('/api/events', (req, res) => {
    try { return res.json(service.addEvent(req.body ?? {})); }
    catch (error) { return res.status(400).json({ error: error.message }); }
  });
  app.get('/api/foundations/:sessionId', (req, res) => {
    try { return res.json({ completed: service.completedFoundations(req.params.sessionId) }); }
    catch (error) { return res.status(404).json({error:error.message}); }
  });
  app.post('/api/foundations/completions', (req,res) => {
    try { return res.json(service.completeFoundation(req.body ?? {})); }
    catch (error) { return res.status(400).json({error:error.message}); }
  });
  app.post('/api/challenges/attempts', (req,res) => {
    try { return res.json(service.addChallengeAttempt(req.body ?? {})); }
    catch (error) { return res.status(400).json({error:error.message}); }
  });
  app.get('/api/results/:sessionId', (req, res) => {
    try { return res.json(service.results(req.params.sessionId)); }
    catch (error) { return res.status(404).json({ error: error.message }); }
  });
  return { app, db };
}
module.exports = { createApp };
