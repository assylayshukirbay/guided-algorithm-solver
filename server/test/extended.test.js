const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createDatabase } = require('../src/database');
const { makeService } = require('../src/service');
const { problems } = require('../src/problems');

const correctSteps = {
  'even-odd': {understand:{input:1,output:2},decompose:{ids:['read','remainder','classify','output']},pseudocode:{divisor:'2',even:'Even',odd:'Odd'}},
  'find-maximum': {understand:{input:2,output:2},decompose:{ids:['read','init','compare-b','compare-c','display']},pseudocode:{initial:'a',second:'b',third:'c'}},
  'calculate-average': {understand:{input:0,output:1},decompose:{ids:['read','sum','divide','display']},pseudocode:{expression:'a + b + c',divisor:'3',output:'average'}},
};
function completeGuided(svc,sessionId,problemId) {
  const p=problems.find(x=>x.id===problemId);
  const answers=correctSteps[problemId];
  for (const stage of ['understand','decompose','puzzle','pseudocode']) {
    const answer=stage==='puzzle'?{order:p.puzzle.map(s=>s.id)}:answers[stage];
    svc.addAttempt({sessionId,problemId,stage,answer,hintsUsed:0,secondsSpent:5});
  }
}
test('problem teaching is informative, while challenges do not expose answer keys',()=>{
  const db=createDatabase(':memory:');const svc=makeService(db);
  for(const p of svc.listProblems()){
    const details=svc.getProblem(p.id);
    assert.ok(details.teaching.concept);assert.ok(details.teaching.why);
    assert.equal(details.independent.correct,undefined);
    assert.equal(details.independent.explanation,undefined);
    assert.ok(details.independent.options.length>=3);
  }
  db.close();
});
test('foundation lessons persist by anonymous session and reject invalid lessons',()=>{
  const db=createDatabase(':memory:');const svc=makeService(db);
  const {sessionId}=svc.startSession();
  assert.deepEqual(svc.completedFoundations(sessionId),[]);
  svc.completeFoundation({sessionId,lessonId:'thinking'});
  svc.completeFoundation({sessionId,lessonId:'thinking'});
  assert.deepEqual(svc.completedFoundations(sessionId),['thinking']);
  assert.deepEqual(svc.results(sessionId).foundationCompleted,['thinking']);
  assert.throws(()=>svc.completeFoundation({sessionId,lessonId:'not-a-lesson'}),/Unknown foundation/);
  db.close();
});
test('independent challenge requires completing the guided workflow first',()=>{
  const db=createDatabase(':memory:');const svc=makeService(db);
  const {sessionId}=svc.startSession();
  assert.throws(()=>svc.addChallengeAttempt({sessionId,problemId:'even-odd',choice:1}),/Finish the four/);
  completeGuided(svc,sessionId,'even-odd');
  const first=svc.addChallengeAttempt({sessionId,problemId:'even-odd',choice:0,secondsSpent:13});
  assert.equal(first.correct,false);assert.equal(first.attemptNumber,1);
  const next=svc.addChallengeAttempt({sessionId,problemId:'even-odd',choice:1,secondsSpent:6});
  assert.equal(next.correct,true);
  const progress=svc.results(sessionId).problems.find(p=>p.problemId==='even-odd');
  assert.equal(progress.complete,true);
  assert.equal(progress.firstAttemptTotal,10);
  assert.equal(progress.independentAttempts,2);
  assert.equal(progress.independentFirstCorrect,false);
  assert.equal(progress.independentBestCorrect,true);
  db.close();
});
test('rejects malformed independent challenge inputs',()=>{
  const db=createDatabase(':memory:');const svc=makeService(db);
  const {sessionId}=svc.startSession();
  completeGuided(svc,sessionId,'calculate-average');
  for (const choice of [-1,4,1.2,'1',null]) {
    assert.throws(()=>svc.addChallengeAttempt({sessionId,problemId:'calculate-average',choice}),/Invalid choice/);
  }
  assert.throws(()=>svc.addChallengeAttempt({sessionId,problemId:'calculate-average',choice:1,secondsSpent:-1}),/Invalid time/);
  db.close();
});
test('maximum and average challenge checks use correct keys',()=>{
  const db=createDatabase(':memory:');const svc=makeService(db);
  const {sessionId}=svc.startSession();
  for(const p of ['find-maximum','calculate-average'])completeGuided(svc,sessionId,p);
  assert.equal(svc.addChallengeAttempt({sessionId,problemId:'find-maximum',choice:2}).correct,true);
  assert.equal(svc.addChallengeAttempt({sessionId,problemId:'calculate-average',choice:1}).correct,true);
  db.close();
});
test('SQLite file restores foundations, guided answers and challenge history after restart',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'solver-test-'));
  const filename=path.join(dir,'test.sqlite');
  let db=createDatabase(filename);let svc=makeService(db);
  const {sessionId}=svc.startSession();
  svc.completeFoundation({sessionId,lessonId:'four-step'});
  completeGuided(svc,sessionId,'even-odd');
  svc.addEvent({sessionId,problemId:'even-odd',stage:'pseudocode',eventType:'hint_opened',data:{level:1}});
  svc.addChallengeAttempt({sessionId,problemId:'even-odd',choice:1});
  db.close();
  db=createDatabase(filename);svc=makeService(db);
  assert.equal(svc.startSession(sessionId).resumed,true);
  const saved=svc.results(sessionId);
  assert.deepEqual(saved.foundationCompleted,['four-step']);
  assert.equal(saved.problems[0].hintsOpened,1);
  assert.equal(saved.problems[0].independentFirstCorrect,true);
  db.close();
  fs.rmSync(dir,{recursive:true,force:true});
});
