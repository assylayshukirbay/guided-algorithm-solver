import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, getProblems, getProblem, startSession, getResults, submitAttempt, recordEvent, completeFoundation, submitChallenge } from './src/api';
import { FOUNDATION } from './src/foundation';
import { C } from './src/theme';

const SESSION_KEY = 'guided_solver_session_v2';
const WELCOME_KEY = 'guided_solver_welcome_v2';
const LOCAL_LESSONS = 'guided_solver_foundation_v2';
const STAGES = [
  { key: 'understand', number: '01', short: 'Understand', title: 'Understand the problem', purpose: 'First understand what is being asked. Code comes later.', instruction: 'Identify the information given and the result you need.' },
  { key: 'decompose', number: '02', short: 'Decompose', title: 'Break it into steps', purpose: 'A difficult problem becomes manageable when you divide it into smaller tasks.', instruction: 'Select all the steps needed to reach the output.' },
  { key: 'puzzle', number: '03', short: 'Design', title: 'Build the algorithm', purpose: 'Even correct steps fail if they are arranged in the wrong order.', instruction: 'Move the cards into a logical sequence.' },
  { key: 'pseudocode', number: '04', short: 'Plan', title: 'Plan the pseudocode', purpose: 'Pseudocode expresses your plan without needing Python or Java syntax.', instruction: 'Complete the missing parts of the solution plan.' },
];
const TOPICS = [
  { title: 'Understand', body: 'What information comes in? What result must come out?', icon: '◉' },
  { title: 'Decompose', body: 'Which smaller tasks turn the input into the output?', icon: '▦' },
  { title: 'Design', body: 'Which logical order makes the tasks work?', icon: '⇄' },
  { title: 'Plan', body: 'How would you explain the solution in pseudocode?', icon: '</>' },
];

function T({ children, color = C.ink, size = 15, bold = false, style, ...props }) {
  return <Text {...props} style={[{ color, fontSize: size, lineHeight: size * 1.47, fontWeight: bold ? '700' : '400' }, style]}>{children}</Text>;
}
function Kicker({ children }) { return <T size={11} bold color={C.purple} style={styles.kicker}>{children}</T>; }
function Card({ children, style }) { return <View style={[styles.card, style]}>{children}</View>; }
function Button({ label, onPress, variant = 'primary', disabled = false, style }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({pressed}) => [styles.button, variant === 'outline' && styles.outlineButton, variant === 'ghost' && styles.ghostButton, disabled && {opacity:0.55}, pressed && {opacity:0.78}, style]}>
    <T bold size={14} color={variant === 'primary' ? C.white : C.purple} style={{textAlign:'center'}}>{label}</T>
  </Pressable>;
}
function Tag({ children, tone = 'purple' }) { return <View style={[styles.tag,{backgroundColor:tone==='green'?C.greenBg:tone==='orange'?C.orangeBg:C.purplePale}]}><T color={tone==='green'?C.green:tone==='orange'?C.orange:C.purple} bold size={11}>{children}</T></View>; }
function Option({ title, selected, onPress, disabled = false, number, multi = false }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({pressed})=>[styles.option,selected&&styles.optionSelected,pressed&&!disabled&&{opacity:0.85}]}>
    <View style={[styles.optionMark,selected&&styles.optionMarkActive,multi&&{borderRadius:6}]}><T size={11} color={selected?C.white:C.muted} bold>{selected?'✓':number||' '}</T></View>
    <View style={{flex:1}}><T size={14}>{title}</T></View>
  </Pressable>;
}
function ScreenTitle({ kicker, title, subtitle }) { return <View style={{marginBottom:21}}><Kicker>{kicker}</Kicker><T size={29} bold style={{marginTop:6,letterSpacing:-0.7}}>{title}</T>{subtitle?<T size={14} color={C.muted} style={{marginTop:6}}>{subtitle}</T>:null}</View>; }
function Meter({ value, tint=C.purple }) { return <View style={styles.meter}><View style={[styles.meterFill,{width:`${Math.min(100,Math.max(0,value))}%`,backgroundColor:tint}]}/></View>; }
function formatTime(value) { const n=Math.round(value||0); return n>=60?`${Math.floor(n/60)}m ${n%60}s`:`${n}s`; }

export default function App() {
  const [screen,setScreen]=useState('loading');
  const [err,setErr]=useState('');
  const [connected,setConnected]=useState(false);
  const [sessionId,setSessionId]=useState(null);
  const [problems,setProblems]=useState([]);
  const [progress,setProgress]=useState(null);
  const [completedLessons,setCompletedLessons]=useState([]);
  const [foundationIndex,setFoundationIndex]=useState(0);
  const [miniAnswer,setMiniAnswer]=useState(null);
  const [miniFeedback,setMiniFeedback]=useState(false);
  const [problem,setProblem]=useState(null);
  const [stageIndex,setStageIndex]=useState(0);
  const [answers,setAnswers]=useState({});
  const [selected,setSelected]=useState([]);
  const [order,setOrder]=useState([]);
  const [fields,setFields]=useState({});
  const [feedback,setFeedback]=useState(null);
  const [hintCount,setHintCount]=useState(0);
  const [exampleOpen,setExampleOpen]=useState(false);
  const [challengeChoice,setChallengeChoice]=useState(null);
  const [challengeFeedback,setChallengeFeedback]=useState(null);
  const [pythonOpen,setPythonOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [tab,setTab]=useState('home');
  const begun=useRef(Date.now());
  const scrollRef=useRef(null);

  useEffect(()=>{ scrollRef.current?.scrollTo({y:0, animated:false}); },[screen,stageIndex,foundationIndex]);
  useEffect(()=>{ connect(); },[]);
  const localCompleted=async()=>{
    try { const saved=JSON.parse(await AsyncStorage.getItem(LOCAL_LESSONS)||'[]'); return Array.isArray(saved)?saved:[]; }
    catch { return []; }
  };
  async function connect() {
    setScreen('loading'); setErr('');
    try {
      const seen=await AsyncStorage.getItem(WELCOME_KEY);
      const local=await localCompleted();
      setCompletedLessons(local);
      await api('/api/health');
      const previous=await AsyncStorage.getItem(SESSION_KEY);
      const session=await startSession(previous||undefined);
      await AsyncStorage.setItem(SESSION_KEY,session.sessionId);
      setSessionId(session.sessionId);
      const [list,stats]=await Promise.all([getProblems(),getResults(session.sessionId)]);
      setProblems(list); setProgress(stats); setConnected(true);
      setCompletedLessons([...new Set([...local,...(stats.foundationCompleted||[])])]);
      setScreen(seen?'home':'welcome');
    } catch(e){ setErr(e.message||String(e)); setConnected(false); setScreen('offline'); }
  }
  function nav(next) {
    setTab(next);
    if(next==='progress') refreshResults();
    else setScreen(next);
  }
  async function finishWelcome() { await AsyncStorage.setItem(WELCOME_KEY,'yes'); nav('home'); }
  function openFoundation(index) { setFoundationIndex(index);setMiniAnswer(null);setMiniFeedback(false);setScreen('foundation'); }
  async function finishFoundation() {
    const lesson=FOUNDATION[foundationIndex];
    const done=[...new Set([...completedLessons,lesson.id])];
    setCompletedLessons(done);
    await AsyncStorage.setItem(LOCAL_LESSONS,JSON.stringify(done));
    if(connected&&sessionId){try {await completeFoundation({sessionId,lessonId:lesson.id});}catch(e){setErr(e.message||'Cannot sync lesson yet. Saved on phone.');}}
    if(foundationIndex<FOUNDATION.length-1)openFoundation(foundationIndex+1);
    else nav('home');
  }
  async function refreshResults(next='progress') {
    setBusy(true);
    try { const stats=await getResults(sessionId);setProgress(stats);setScreen(next);setTab(next==='progress'?'progress':'home'); }
    catch(e){setErr(e.message);setScreen('offline');}
    finally {setBusy(false);}
  }
  async function openProblem(id) {
    setBusy(true);setErr('');
    try{const p=await getProblem(id);setProblem(p);setScreen('problemIntro');}
    catch(e){setErr(e.message);setScreen('offline');}
    finally{setBusy(false);}
  }
  function resetStage(index,p=problem) {
    setStageIndex(index);setAnswers({});setSelected([]);setOrder((p?.puzzle||[]).map(s=>s.id));setFields({});
    setFeedback(null);setHintCount(0);setExampleOpen(false);begun.current=Date.now();
  }
  function beginPractice(){resetStage(0);setScreen('lesson');}
  function move(index,direction){if(feedback)return;setOrder(old=>{const copy=[...old];const other=index+direction;if(other<0||other>=copy.length)return old;[copy[index],copy[other]]=[copy[other],copy[index]];return copy;});}
  const stage=STAGES[stageIndex];
  async function openHint() {
    if(busy||hintCount>=2)return;
    setBusy(true);
    try { await recordEvent({sessionId,problemId:problem.id,stage:stage.key,eventType:'hint_opened',data:{level:hintCount+1}});setHintCount(x=>x+1); }
    catch(e){setErr(e.message);}
    finally{setBusy(false);}
  }
  async function openExample() {
    if(exampleOpen||busy)return;
    setBusy(true);
    try{await recordEvent({sessionId,problemId:problem.id,stage:stage.key,eventType:'worked_example_opened'});setExampleOpen(true);}
    catch(e){setErr(e.message);}
    finally{setBusy(false);}
  }
  function stageAnswer(){return stage.key==='understand'?answers:stage.key==='decompose'?{ids:selected}:stage.key==='puzzle'?{order}:fields;}
  async function checkStage() {
    if(busy||feedback)return;
    setBusy(true);setErr('');
    try {
      const result=await submitAttempt({sessionId,problemId:problem.id,stage:stage.key,answer:stageAnswer(),hintsUsed:hintCount,secondsSpent:Math.round((Date.now()-begun.current)/1000)});
      setFeedback(result);
    } catch(e){setErr(e.message);} finally{setBusy(false);}
  }
  async function nextStage() {
    if(stageIndex<3){resetStage(stageIndex+1);return;}
    await refreshResults('review');
  }
  function openChallenge() { setChallengeChoice(null);setChallengeFeedback(null);setScreen('challenge');begun.current=Date.now(); }
  async function checkChallenge() {
    if(busy||challengeChoice===null||challengeFeedback)return;
    setBusy(true);setErr('');
    try { const result=await submitChallenge({sessionId,problemId:problem.id,choice:challengeChoice,secondsSpent:Math.round((Date.now()-begun.current)/1000)});setChallengeFeedback(result); }
    catch(e){setErr(e.message);}
    finally{setBusy(false);}
  }
  const activeProgress=progress?.problems.find(p=>p.problemId===problem?.id);
  const fading=!!progress?.reducedHelp;
  const navTabs=[['home','Home','⌂'],['foundations','Learn','▤'],['practice','Practice','◇'],['progress','Progress','↗']];

  return <SafeAreaView style={styles.safe}>
    <StatusBar barStyle="dark-content" backgroundColor={C.bg}/>
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
      <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        {screen==='loading' ? <View style={styles.center}><ActivityIndicator size="large" color={C.purple}/><T style={{marginTop:18}}>Opening your learning space…</T></View> : null}
        {screen==='offline' ? <>
          <ScreenTitle kicker="CONNECTION" title="Your learning space" subtitle="You can still read the foundation lessons. Practice requires the learning server on your laptop."/>
          <Card style={{backgroundColor:'#FFF6EB',borderColor:'#F4D7A6'}}><T bold size={16}>Unable to reach the API</T><T size={13} color={C.muted} style={{marginTop:6}}>{err||'Check your Wi-Fi and server address.'}</T><T size={12} style={{marginTop:12}}>Confirm: server npm start, mobile/src/config.js with the laptop IPv4, and Safari can open the health endpoint.</T></Card>
          <Button label="Try connecting again →" onPress={connect} style={{marginTop:18}}/>
          <Button label="Read foundation lessons offline" variant="outline" onPress={()=>nav('foundations')} style={{marginTop:12}}/>
        </> : null}
        {screen==='welcome' ? <>
          <View style={styles.brandRow}><View style={styles.logo}><T size={24} bold color={C.white}>✦</T></View><T bold color={C.purple} size={13}>GUIDED ALGORITHM SOLVER</T></View>
          <View style={styles.welcomeHero}><Tag>FOR BEGINNER PROGRAMMERS</Tag><T size={36} bold style={{marginTop:17,lineHeight:44,letterSpacing:-1.2}}>Learn to think{ '\n' }before you code.</T><T color={C.muted} size={15} style={{marginTop:12}}>Turn confusing programming questions into small, logical steps — with guidance when you need it.</T><View style={styles.welcomeVisual}><View style={styles.visualBubble}><T color={C.white} bold>INPUT</T></View><T color={C.purple} bold size={21}>→</T><View style={[styles.visualBubble,{backgroundColor:C.navy}]}><T color={C.white} bold>THINK</T></View><T color={C.purple} bold size={21}>→</T><View style={[styles.visualBubble,{backgroundColor:C.green}]}><T color={C.white} bold>PLAN</T></View></View></View>
          <Card><Kicker>HOW LEARNING WORKS</Kicker>{TOPICS.map((x,i)=><View key={x.title} style={[styles.row,{marginTop:12}]}><View style={styles.smallNumber}><T color={C.purple} bold>{i+1}</T></View><View style={{flex:1}}><T bold size={14}>{x.title}</T><T color={C.muted} size={12}>{x.body}</T></View></View>)}</Card>
          <Button label="Start my learning journey →" onPress={finishWelcome} style={{marginTop:20}}/>
          <T color={C.muted} size={12} style={{textAlign:'center',marginTop:12}}>No programming language required. No email or personal name requested.</T>
        </> : null}
        {screen==='home' ? <>
          <View style={styles.brandRow}><View style={styles.logoSmall}><T color={C.white} bold>✦</T></View><T bold size={13} color={C.purple}>GUIDED LEARNING</T><View style={{flex:1}}/><Tag tone="green">Prototype v2</Tag></View>
          <ScreenTitle kicker="YOUR LEARNING SPACE" title="Think. Plan. Solve." subtitle="Build the skills behind good code, one small step at a time."/>
          <View style={styles.hero}><T color="#C9D3FF" size={12} bold>YOUR LEARNING JOURNEY</T><View style={[styles.row,{alignItems:'flex-end',marginTop:10}]}><View style={{flex:1}}><T color={C.white} bold size={32}>{progress?.completed||0} / {progress?.total||3}</T><T color="#DDE3FF" size={13}>Guided challenges finished</T></View><View style={styles.heroOrb}><T color={C.white} size={29}>↗</T></View></View><Meter value={100*(progress?.completed||0)/(progress?.total||3)} tint="#C5AFFF"/><T color="#DDE3FF" size={12} style={{marginTop:12}}>{completedLessons.length} of 3 foundation lessons complete</T></View>
          <View style={styles.sectionHeader}><T bold size={20}>Your next step</T><Tag>RECOMMENDED</Tag></View>
          {completedLessons.length<3 ? <Pressable accessibilityRole="button" onPress={()=>nav('foundations')} style={[styles.nextCard,{backgroundColor:'#F1EBFF'}]}><View style={styles.nextIcon}><T size={24} color={C.purple}>▤</T></View><View style={{flex:1}}><T bold size={17}>Learn the foundations</T><T size={13} color={C.muted} style={{marginTop:5}}>Understand algorithms and the four-step method before taking on challenges.</T><T size={13} color={C.purple} bold style={{marginTop:11}}>Start a short lesson →</T></View></Pressable> : <Pressable accessibilityRole="button" onPress={()=>nav('practice')} style={[styles.nextCard,{backgroundColor:'#E9F7F0'}]}><View style={[styles.nextIcon,{backgroundColor:'#D2EFDF'}]}><T size={24} color={C.green}>◇</T></View><View style={{flex:1}}><T bold size={17}>Ready for practice?</T><T color={C.muted} size={13} style={{marginTop:5}}>Apply the four-step method to real beginner problems.</T><T color={C.green} bold size={13} style={{marginTop:11}}>Choose a challenge →</T></View></Pressable>}
          <View style={styles.sectionHeader}><T bold size={20}>How we solve problems</T></View>
          <View style={styles.twoCol}>{TOPICS.map((item,i)=><View key={item.title} style={styles.methodCard}><View style={styles.methodIcon}><T color={C.purple} size={18} bold>{item.icon}</T></View><T bold size={14} style={{marginTop:10}}>{i+1}. {item.title}</T><T color={C.muted} size={12} style={{marginTop:4}}>{item.body}</T></View>)}</View>
          <Button label="Explore practice problems →" onPress={()=>nav('practice')} style={{marginTop:18}}/>
          <T color={C.muted} size={11} style={{textAlign:'center',marginTop:20}}>Research prototype · Focus: pre-coding problem-solving</T>
        </> : null}
        {screen==='foundations' ? <>
          <ScreenTitle kicker="STEP 01 · BUILD CONFIDENCE" title="Learn the basics" subtitle="Three short lessons. No difficult syntax or previous experience required."/>
          <Card style={{backgroundColor:C.purplePale,borderColor:'#E2D9FF'}}><Kicker>YOUR FOUNDATION</Kicker><T bold size={20} style={{marginTop:8}}>{completedLessons.length} of 3 lessons</T><Meter value={100*completedLessons.length/3}/><T color={C.muted} size={12} style={{marginTop:10}}>Learn the basics before you move on to guided challenges.</T></Card>
          {FOUNDATION.map((lesson,i)=><Pressable accessibilityRole="button" key={lesson.id} onPress={()=>openFoundation(i)} style={[styles.lessonCard,completedLessons.includes(lesson.id)&&{borderColor:'#C9E9DA'}]}>
            <View style={styles.lessonNumber}><T size={18} bold color={C.purple}>{lesson.number}</T></View><View style={{flex:1}}><T size={11} bold color={C.purple}>{lesson.tag} · {lesson.minutes} MIN</T><T bold size={17} style={{marginTop:3}}>{lesson.title}</T><T color={C.muted} size={13} style={{marginTop:6}}>{lesson.summary}</T><T color={completedLessons.includes(lesson.id)?C.green:C.purple} size={12} bold style={{marginTop:10}}>{completedLessons.includes(lesson.id)?'✓ Completed · Review lesson':'Open lesson →'}</T></View>
          </Pressable>)}
          <Button label="Go to guided practice →" onPress={()=>nav('practice')} variant="outline" style={{marginTop:14}}/>
        </> : null}
        {screen==='foundation' ? (()=>{const lesson=FOUNDATION[foundationIndex];const right=miniAnswer===lesson.check.correct;return <>
          <Pressable style={styles.back} onPress={()=>nav('foundations')}><T bold size={14} color={C.purple}>← All lessons</T></Pressable>
          <View style={[styles.row,{justifyContent:'space-between',marginBottom:15}]}><Tag>{lesson.tag}</Tag><T color={C.muted} size={12}>LESSON {foundationIndex+1}/3 · {lesson.minutes} MIN</T></View>
          <T bold size={29}>{lesson.title}</T><T color={C.muted} size={15} style={{marginTop:10,marginBottom:20}}>{lesson.intro}</T>
          <Card style={{backgroundColor:'#F0F0FF',borderColor:'#E3DFFC'}}><Kicker>EXAMPLE YOU ALREADY KNOW</Kicker><T bold size={16} style={{marginTop:8}}>{lesson.illustration.title}</T><View style={{marginTop:10,gap:9}}>{[['INPUT',lesson.illustration.input],['PROCESS',lesson.illustration.process],['OUTPUT',lesson.illustration.output]].map(x=><View key={x[0]} style={styles.infoRow}><T size={11} color={C.purple} bold style={{width:72}}>{x[0]}</T><View style={{flex:1}}><T size={13}>{x[1]}</T></View></View>)}</View></Card>
          {lesson.blocks.map((b,i)=><View key={b.title} style={{marginTop:22}}><View style={[styles.row,{alignItems:'flex-start'}]}><View style={styles.smallNumber}><T color={C.purple} bold>{i+1}</T></View><View style={{flex:1}}><T bold size={17}>{b.title}</T><T color={C.muted} size={14} style={{marginTop:5}}>{b.body}</T></View></View></View>)}
          <Card style={{marginTop:26}}><Kicker>CHECK YOUR UNDERSTANDING</Kicker><T size={17} bold style={{marginTop:7}}>{lesson.check.question}</T><View style={{marginTop:14}}>{lesson.check.options.map((o,i)=><Option key={i} title={o} number={String.fromCharCode(65+i)} selected={miniAnswer===i} onPress={()=>{setMiniAnswer(i);setMiniFeedback(false);}} />)}</View><Button label="Check my understanding" onPress={()=>setMiniFeedback(true)} disabled={miniAnswer===null} style={{marginTop:12}}/>{miniFeedback?<View style={[styles.notice,{backgroundColor:right?C.greenBg:C.orangeBg}]}><T bold color={right?C.green:C.orange}>{right?'Well done!':'Almost! Give it another try.'}</T><T size={13} style={{marginTop:5}}>{lesson.check.explanation}</T></View>:null}</Card>
          <Card style={{marginTop:16,backgroundColor:'#F4F1FF'}}><Kicker>KEY TAKEAWAY</Kicker><T size={14} style={{marginTop:8}}>{lesson.takeaway}</T></Card>
          <Button label={foundationIndex<2?'Complete & next lesson →':'Finish foundation →'} onPress={finishFoundation} disabled={!miniFeedback||!right} style={{marginTop:17}}/>
        </>;})() : null}
        {screen==='practice' ? <>
          <ScreenTitle kicker="STEP 02 · APPLY YOUR SKILLS" title="Guided challenges" subtitle="No coding yet. Learn to understand, break down, and plan a solution."/>
          <Card style={{backgroundColor:C.purplePale,borderColor:'#E2D9FF'}}><Kicker>BEFORE YOU START</Kicker><T size={14} style={{marginTop:7}}>A good problem-solver doesn't jump straight to code. Every challenge follows our four-step method.</T><View style={[styles.row,{marginTop:13,flexWrap:'wrap',gap:7}]}>{STAGES.map(s=><Tag key={s.key}>{s.short}</Tag>)}</View></Card>
          <View style={styles.sectionHeader}><T size={20} bold>Choose a problem</T><T color={C.muted} size={12}>{problems.length} challenges</T></View>
          {problems.map((p,i)=>{const past=progress?.problems.find(x=>x.problemId===p.id);return <Pressable accessibilityRole="button" key={p.id} onPress={()=>openProblem(p.id)} style={styles.problemCard}>
            <View style={[styles.bigIcon,{backgroundColor:['#EEE9FF','#E7F7EE','#FFF1E8'][i]}]}><T size={27} color={C.navy} bold>{['◇','↗','∑'][i]}</T></View><View style={{flex:1}}><T color={C.purple} bold size={11}>{p.topic.toUpperCase()} · {p.difficulty}</T><T bold size={17} style={{marginTop:3}}>{p.title}</T><T color={C.muted} size={12} style={{marginTop:5}}>{p.description}</T><T color={past?.complete?C.green:C.purple} bold size={12} style={{marginTop:8}}>{past?.complete?`✓ Guided complete · ${past.firstAttemptTotal}/10 first try`:'Start guided practice →'}</T></View>
          </Pressable>})}
          {completedLessons.length<3?<Button label="Need a refresher? Learn the basics" variant="outline" onPress={()=>nav('foundations')} style={{marginTop:14}}/>:null}
        </> : null}
        {screen==='problemIntro'&&problem?<>
          <Pressable onPress={()=>nav('practice')} style={styles.back}><T color={C.purple} bold size={14}>← All challenges</T></Pressable>
          <Tag>{problem.topic.toUpperCase()} · {problem.difficulty.toUpperCase()}</Tag>
          <T size={30} bold style={{marginTop:15}}>{problem.title}</T><T color={C.muted} size={15} style={{marginTop:8}}>First understand the idea. Then practise the four-step method.</T>
          <Card style={{marginTop:23,backgroundColor:'#EFF0FF',borderColor:'#E4E0FF'}}><Kicker>BEFORE WE BEGIN</Kicker><T size={21} bold style={{marginTop:8}}>{problem.teaching?.concept}</T><T size={14} style={{marginTop:9}}>{problem.teaching?.why}</T></Card>
          <View style={styles.sectionHeader}><T bold size={20}>Connect it to real life</T></View>
          <Card><T size={15}>{problem.teaching?.realLife}</T></Card>
          <View style={styles.sectionHeader}><T bold size={20}>The way to think</T></View>
          <Card><T size={15}>{problem.teaching?.method}</T><View style={[styles.row,{marginTop:15,flexWrap:'wrap',gap:7}]}>{STAGES.map(s=><Tag key={s.key}>{s.short}</Tag>)}</View></Card>
          <Button label="I'm ready — guide me →" onPress={beginPractice} style={{marginTop:20}}/>
        </>:null}
        {screen==='lesson'&&problem?<>
          <Pressable style={styles.back} onPress={()=>setScreen('problemIntro')}><T color={C.purple} size={14} bold>← About this challenge</T></Pressable>
          <View style={[styles.row,{justifyContent:'space-between'}]}><Kicker>{problem.title.toUpperCase()}</Kicker><T color={C.muted} size={12}>STEP {stageIndex+1} OF 4</T></View>
          <View style={styles.steps}>{STAGES.map((s,i)=><View key={s.key} style={[styles.step,{backgroundColor:i<=stageIndex?C.purple:'#DFE3EF'}]}/>)}</View>
          <T size={27} bold style={{marginTop:3}}>{stage.title}</T><T color={C.muted} size={14} style={{marginTop:5,marginBottom:17}}>{stage.instruction}</T>
          <Card style={{backgroundColor:'#F0EEFF',borderColor:'#DDD9FF'}}><Kicker>WHY THIS STEP MATTERS</Kicker><T size={14} style={{marginTop:8}}>{stage.purpose}</T></Card>
          <Card style={{marginTop:14}}><Kicker>THE PROBLEM</Kicker><T size={15} style={{marginTop:8}}>{problem.description}</T><T color={C.muted} size={12} style={{marginTop:10}}>Example: {problem.examples[0].input} → {problem.examples[0].output}</T></Card>
          {stage.key==='understand'?problem.understand.map((q,qi)=><Card key={q.id} style={{marginTop:14}}><T bold size={15}>{qi+1}. {q.question}</T><View style={{marginTop:11}}>{q.options.map((choice,i)=><Option key={i} title={choice} number={String.fromCharCode(65+i)} selected={answers[q.id]===i} disabled={!!feedback} onPress={()=>setAnswers(prev=>({...prev,[q.id]:i}))}/>)}</View></Card>):null}
          {stage.key==='decompose'?<Card style={{marginTop:14}}><T bold size={15}>Which subtasks are necessary?</T><T size={12} color={C.muted} style={{marginVertical:8}}>Choose every step that contributes to the result.</T>{problem.decompose.map(item=><Option key={item.id} title={item.text} multi selected={selected.includes(item.id)} disabled={!!feedback} onPress={()=>setSelected(old=>old.includes(item.id)?old.filter(x=>x!==item.id):[...old,item.id])}/>)}</Card>:null}
          {stage.key==='puzzle'?<Card style={{marginTop:14}}><T bold size={16}>Arrange the steps</T><T color={C.muted} size={12} style={{marginTop:4,marginBottom:14}}>Use ↑ and ↓ to move each step. Start from the input and end with output.</T>{order.map((id,i)=>{const item=problem.puzzle.find(p=>p.id===id);return <View key={id} style={styles.puzzleRow}><View style={styles.puzzleNumber}><T size={12} bold color={C.purple}>{i+1}</T></View><View style={{flex:1}}><T size={13}>{item?.text}</T></View><View style={{gap:5}}><Pressable accessibilityLabel={`Move step ${i+1} up`} disabled={!!feedback||i===0} onPress={()=>move(i,-1)} style={styles.arrow}><T bold color={C.purple}>↑</T></Pressable><Pressable accessibilityLabel={`Move step ${i+1} down`} disabled={!!feedback||i===order.length-1} onPress={()=>move(i,1)} style={styles.arrow}><T bold color={C.purple}>↓</T></Pressable></View></View>;})}</Card>:null}
          {stage.key==='pseudocode'?<Card style={{marginTop:14}}><T bold size={16}>Complete the plan</T><T color={C.muted} size={12} style={{marginTop:5}}>Pseudocode is not a programming language. Use simple instructions.</T><View style={styles.codePanel}><Text style={styles.codeText}>{problem.pseudocode.lines.map(line=>line.replace(/{{(.*?)}}/g,(_,id)=>fields[id]||`[${id}]`)).join('\n')}</Text></View>{problem.pseudocode.fields.map(f=><View key={f.id} style={{marginTop:12}}><T size={13} bold>{f.prompt}</T><TextInput accessibilityLabel={f.prompt} editable={!feedback} style={styles.input} autoCapitalize="none" autoCorrect={false} value={fields[f.id]||''} onChangeText={v=>setFields(old=>({...old,[f.id]:v}))} placeholder={f.placeholder} placeholderTextColor="#9DA7BC"/></View>)}</Card>:null}
          <Card style={{marginTop:14,backgroundColor:fading?C.white:'#F4F1FF'}}><View style={[styles.row,{justifyContent:'space-between'}]}><T size={15} bold color={C.purple}>✦ Guided support</T><Tag>{fading?'FADING':'FULL'}</Tag></View><T color={C.muted} size={12} style={{marginTop:9}}>{fading?'Try independently first. Help is available when needed.':'Need a clue? Reveal one hint at a time. Every hint is optional.'}</T>
            {Array.from({length:hintCount},(_,i)=><View style={styles.hintBox} key={i}><T color={C.purple} size={11} bold>HINT {i+1}</T><T size={13} style={{marginTop:3}}>{problem.hints[stage.key][i]}</T></View>)}
            {!feedback&&hintCount<2?<Button label={`Reveal hint ${hintCount+1} of 2`} variant="outline" disabled={busy} onPress={openHint} style={{marginTop:12}}/>:null}
            {exampleOpen?<View style={styles.hintBox}><T bold color={C.purple} size={11}>WORKED EXAMPLE</T><T size={13} style={{marginTop:5}}>{problem.workedExample}</T></View>:null}
            {!feedback&&!exampleOpen?<Button label="View a worked example" variant="ghost" onPress={openExample} disabled={busy} style={{marginTop:4}}/>:null}
          </Card>
          {feedback?<Card style={{marginTop:15,backgroundColor:feedback.correct?C.greenBg:C.orangeBg,borderColor:feedback.correct?'#B5E7D1':'#FFE0BA'}}><T bold size={18} color={feedback.correct?C.green:C.orange}>{feedback.correct?'Great reasoning!':'Keep improving your plan'}</T><T bold size={24} style={{marginTop:4}}>{feedback.points} / {feedback.maxPoints} points</T><T size={13} style={{marginTop:6}}>{feedback.feedback}</T><T size={12} color={C.muted} style={{marginTop:8}}>Attempt {feedback.attemptNumber}. Your first score is preserved for transparent progress tracking.</T><Button label={stageIndex===3?'Finish guided practice →':'Continue to next step →'} onPress={nextStage} style={{marginTop:15}}/>{!feedback.correct?<Button variant="outline" label="Try this step again" onPress={()=>{setFeedback(null);begun.current=Date.now();}} style={{marginTop:10}}/>:null}</Card>:<Button label={busy?'Checking…':'Check my answer →'} onPress={checkStage} disabled={busy} style={{marginTop:18}}/>}
          {err?<T size={12} color={C.orange} style={{marginTop:9}}>{err}</T>:null}
        </>:null}
        {screen==='review'&&problem?<>
          <Pressable style={styles.back} onPress={()=>nav('practice')}><T color={C.purple} bold>← All challenges</T></Pressable>
          <Tag tone="green">GUIDED PRACTICE COMPLETED</Tag>
          <T size={29} bold style={{marginTop:15}}>You built a solution!</T><T color={C.muted} size={15} style={{marginTop:8}}>You practised problem analysis, decomposition, algorithm design and pseudocode.</T>
          <View style={[styles.hero,{marginTop:20}]}><T color="#D3DDFF" bold size={12}>FIRST-ATTEMPT SCORE</T><T color={C.white} size={39} bold style={{marginTop:8}}>{activeProgress?.firstAttemptTotal??0} / 10</T><T color="#D9E2FF" size={13}>Best attempts: {activeProgress?.bestTotal??0}/10 · Hints opened: {activeProgress?.hintsOpened??0}</T></View>
          <Card style={{marginTop:16}}><Kicker>THE FOUR-STEP RECAP</Kicker>{STAGES.map((s,i)=><View key={s.key} style={[styles.row,{marginTop:12}]}><View style={styles.smallNumber}><T color={C.purple} bold>{i+1}</T></View><View style={{flex:1}}><T bold size={14}>{s.short}</T><T size={12} color={C.muted}>{s.purpose}</T></View></View>)}</Card>
          <Card style={{marginTop:15}}><Kicker>OPTIONAL · SEE REAL CODE</Kicker><T size={14} style={{marginTop:6}}>The algorithm you planned can later be translated into many languages. Here's one illustration in Python.</T><Button label={pythonOpen?'Hide Python example':'Show Python example'} variant="outline" onPress={()=>setPythonOpen(p=>!p)} style={{marginTop:13}}/>{pythonOpen?<View style={styles.codePanel}><Text style={styles.codeText}>{problem.teaching?.python}</Text></View>:null}</Card>
          <View style={styles.sectionHeader}><T bold size={20}>Try without scaffolding</T><Tag tone="orange">TRANSFER PRACTICE</Tag></View>
          <Card><T size={14}>Now apply the same idea to a NEW example. This is independent practice — hints are not shown.</T><Button label={activeProgress?.independentAttempts?'Try the challenge again →':'Start independent challenge →'} onPress={openChallenge} style={{marginTop:14}}/></Card>
          <Button label="Back to problem list" variant="outline" onPress={()=>nav('practice')} style={{marginTop:12}}/>
        </>:null}
        {screen==='challenge'&&problem?<>
          <Pressable style={styles.back} onPress={()=>setScreen('review')}><T bold color={C.purple}>← Guided results</T></Pressable>
          <Tag>INDEPENDENT CHALLENGE</Tag><T bold size={29} style={{marginTop:14}}>Now it's your turn</T><T color={C.muted} size={14} style={{marginTop:6}}>A related problem. No prompts or hints — use the method on your own.</T>
          <Card style={{marginTop:22}}><Kicker>APPLY YOUR REASONING</Kicker><T bold size={17} style={{marginTop:8}}>{problem.independent.prompt}</T><T size={13} color={C.muted} style={{marginTop:7}}>{problem.independent.context}</T><View style={{marginTop:15}}>{problem.independent.options.map((o,i)=><Option key={i} title={o} selected={challengeChoice===i} disabled={!!challengeFeedback} number={String.fromCharCode(65+i)} onPress={()=>setChallengeChoice(i)}/>)}</View><Button label="Check independent answer" disabled={challengeChoice===null||busy||!!challengeFeedback} onPress={checkChallenge} style={{marginTop:15}}/></Card>
          {challengeFeedback?<Card style={{backgroundColor:challengeFeedback.correct?C.greenBg:C.orangeBg,marginTop:15}}><T bold size={18} color={challengeFeedback.correct?C.green:C.orange}>{challengeFeedback.correct?'Independent challenge solved!':'This one needs another look'}</T><T size={13} style={{marginTop:7}}>{challengeFeedback.explanation}</T><T size={12} color={C.muted} style={{marginTop:5}}>Your first independent attempt is retained separately from guided practice.</T><Button label="Try another attempt" onPress={openChallenge} variant="outline" style={{marginTop:15}}/><Button label="Back to my learning progress →" onPress={()=>refreshResults('progress')} style={{marginTop:10}}/></Card>:null}
          {err?<T color={C.orange} size={12} style={{marginTop:10}}>{err}</T>:null}
        </>:null}
        {screen==='progress' ? <>
          <ScreenTitle kicker="REFLECT & IMPROVE" title="Your progress" subtitle="See what you have practised — without comparing yourself to other students."/>
          <View style={styles.hero}><T bold color="#C9D3FF" size={12}>LEARNING SNAPSHOT</T><T bold color={C.white} size={33} style={{marginTop:8}}>{progress?.completed||0} / {progress?.total||3}</T><T color="#DDE4FF" size={13}>Guided problems completed</T><Meter value={100*(progress?.completed||0)/(progress?.total||3)} tint="#C6B8FF"/></View>
          <View style={styles.sectionHeader}><T bold size={20}>Foundation lessons</T><T color={C.muted} size={13}>{completedLessons.length} / 3</T></View>
          <Card>{FOUNDATION.map(lesson=><View key={lesson.id} style={[styles.row,{paddingVertical:7}]}><T color={completedLessons.includes(lesson.id)?C.green:C.muted} bold size={18}>{completedLessons.includes(lesson.id)?'✓':'○'}</T><View style={{flex:1}}><T size={14}>{lesson.title}</T></View></View>)}<Button label="Review lessons" variant="ghost" onPress={()=>nav('foundations')}/></Card>
          <View style={styles.sectionHeader}><T bold size={20}>Practice outcomes</T></View>
          {progress?.problems.map((p,i)=><Card key={p.problemId} style={{marginBottom:12}}><View style={[styles.row,{justifyContent:'space-between'}]}><View style={{flex:1}}><T bold size={16}>{p.title}</T><T color={C.muted} size={12}>{p.complete?'Guided steps completed':'Not completed yet'}</T></View><Tag tone={p.complete?'green':'purple'}>{p.firstAttemptTotal}/10</Tag></View><View style={[styles.row,{justifyContent:'space-between',marginTop:15}]}><View><T size={11} color={C.muted}>BEST SCORE</T><T bold>{p.bestTotal}/10</T></View><View><T size={11} color={C.muted}>HINTS</T><T bold>{p.hintsOpened}</T></View><View><T size={11} color={C.muted}>TIME</T><T bold>{formatTime(p.secondsSpent)}</T></View></View><View style={{marginTop:10}}><Meter value={p.firstAttemptTotal*10}/></View><T size={12} color={C.muted} style={{marginTop:12}}>Independent practice: {p.independentAttempts ? (p.independentFirstCorrect?'correct on first try':p.independentBestCorrect?'solved after retry':'not solved yet') : 'not attempted'}</T><Button label={p.complete?'Review this challenge':'Open guided challenge'} variant="outline" onPress={()=>openProblem(p.problemId)} style={{marginTop:12}}/></Card>)}
          <Card style={{backgroundColor:'#F4F1FF'}}><Kicker>HOW SCORES ARE USED</Kicker><T size={13} style={{marginTop:7}}>Scores here are formative feedback. They are NOT research pre-test/post-test scores. Study comparisons use separate, common assessments for both groups.</T></Card>
        </> : null}
      </ScrollView>
      {['home','foundations','practice','progress'].includes(screen)?<View style={styles.bottomNav}>{navTabs.map(([key,label,symbol])=><Pressable key={key} accessibilityRole="button" onPress={()=>nav(key)} style={[styles.navItem,screen===key&&styles.navActive]}><T size={20} color={screen===key?C.purple:C.muted}>{symbol}</T><T size={10} bold color={screen===key?C.purple:C.muted}>{label}</T></Pressable>)}</View>:null}
      {busy&&!['loading','lesson'].includes(screen)?<View style={styles.spinner}><ActivityIndicator color={C.purple}/></View>:null}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:C.bg},scroll:{paddingHorizontal:21,paddingTop:26,paddingBottom:48,flexGrow:1},
  kicker:{letterSpacing:1.2}, card:{backgroundColor:C.white,padding:19,borderRadius:22,borderColor:C.border,borderWidth:1},
  button:{backgroundColor:C.purple,minHeight:51,paddingHorizontal:15,borderRadius:15,alignItems:'center',justifyContent:'center'},
  outlineButton:{backgroundColor:C.white,borderWidth:1.3,borderColor:'#CEC5FF'},ghostButton:{backgroundColor:'transparent'},
  tag:{paddingVertical:6,paddingHorizontal:11,borderRadius:9,alignSelf:'flex-start'},
  row:{flexDirection:'row',alignItems:'center',gap:11},
  brandRow:{flexDirection:'row',alignItems:'center',gap:9,marginBottom:25},
  logo:{height:42,width:42,backgroundColor:C.purple,borderRadius:13,alignItems:'center',justifyContent:'center'},
  logoSmall:{height:32,width:32,backgroundColor:C.purple,borderRadius:10,alignItems:'center',justifyContent:'center'},
  welcomeHero:{marginBottom:18},welcomeVisual:{backgroundColor:'#ECEBFF',borderRadius:22,padding:19,flexDirection:'row',alignItems:'center',justifyContent:'space-around',marginTop:21},
  visualBubble:{backgroundColor:C.purple,borderRadius:14,paddingVertical:18,paddingHorizontal:11},smallNumber:{width:29,height:29,borderRadius:10,backgroundColor:C.purplePale,alignItems:'center',justifyContent:'center'},
  hero:{backgroundColor:C.navy,borderRadius:25,padding:23},heroOrb:{height:62,width:62,borderRadius:30,backgroundColor:'#4552A1',justifyContent:'center',alignItems:'center'},
  meter:{backgroundColor:'#E0E4F1',height:9,borderRadius:10,overflow:'hidden',marginTop:17},meterFill:{height:'100%',borderRadius:10},
  sectionHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:28,marginBottom:12,gap:8},
  nextCard:{padding:18,borderRadius:22,flexDirection:'row',gap:14,alignItems:'flex-start'},nextIcon:{backgroundColor:'#E3D9FF',width:54,height:54,borderRadius:16,alignItems:'center',justifyContent:'center'},
  twoCol:{flexDirection:'row',flexWrap:'wrap',gap:11},methodCard:{width:'48%',backgroundColor:C.white,borderRadius:18,borderColor:C.border,borderWidth:1,padding:14},methodIcon:{width:34,height:34,borderRadius:10,backgroundColor:C.purplePale,justifyContent:'center',alignItems:'center'},
  lessonCard:{backgroundColor:C.white,borderWidth:1,borderColor:C.border,borderRadius:22,padding:16,marginTop:13,flexDirection:'row',gap:14},lessonNumber:{height:47,width:47,backgroundColor:C.purplePale,borderRadius:14,alignItems:'center',justifyContent:'center'},
  infoRow:{flexDirection:'row',alignItems:'center',borderRadius:12,backgroundColor:'rgba(255,255,255,0.8)',padding:11},
  option:{backgroundColor:'#F8F9FD',borderWidth:1,borderColor:C.border,borderRadius:13,paddingVertical:12,paddingHorizontal:12,flexDirection:'row',alignItems:'center',gap:11,marginBottom:9},optionSelected:{backgroundColor:C.purplePale,borderColor:'#AFA1FF'},
  optionMark:{width:25,height:25,borderRadius:13,borderColor:'#C5CADA',borderWidth:1.5,justifyContent:'center',alignItems:'center'},optionMarkActive:{backgroundColor:C.purple,borderColor:C.purple},
  notice:{padding:14,borderRadius:14,marginTop:12},
  problemCard:{backgroundColor:C.white,borderWidth:1,borderColor:C.border,borderRadius:22,padding:15,marginBottom:12,flexDirection:'row',alignItems:'center',gap:13},bigIcon:{height:60,width:60,borderRadius:18,alignItems:'center',justifyContent:'center'},
  back:{paddingVertical:8,marginBottom:14,alignSelf:'flex-start'},steps:{flexDirection:'row',gap:6,marginTop:17,marginBottom:15},step:{height:7,borderRadius:10,flex:1},
  puzzleRow:{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:'#F7F8FC',borderColor:C.border,borderWidth:1,borderRadius:12,padding:10,marginTop:8},puzzleNumber:{height:29,width:29,borderRadius:10,backgroundColor:C.purplePale,alignItems:'center',justifyContent:'center'},
  arrow:{backgroundColor:C.purplePale,width:30,height:27,borderRadius:8,alignItems:'center',justifyContent:'center'},
  codePanel:{backgroundColor:'#192445',borderRadius:15,padding:15,marginTop:14},codeText:{color:'#F4F3FF',fontSize:12,lineHeight:22,fontFamily:Platform.OS==='ios'?'Menlo':'monospace'},
  input:{backgroundColor:'#FAFBFE',borderColor:'#D9DFEC',borderWidth:1,borderRadius:11,paddingHorizontal:13,paddingVertical:12,marginTop:7,color:C.ink,fontSize:14},
  hintBox:{backgroundColor:C.white,borderColor:'#DFDAFF',borderWidth:1,borderRadius:13,padding:13,marginTop:11},
  bottomNav:{flexDirection:'row',backgroundColor:C.white,borderTopColor:C.border,borderTopWidth:1,paddingHorizontal:10,paddingVertical:8},
  navItem:{flex:1,alignItems:'center',justifyContent:'center',gap:2,paddingVertical:6,borderRadius:14},navActive:{backgroundColor:'#F0EDFF'},
  center:{minHeight:400,alignItems:'center',justifyContent:'center'},spinner:{position:'absolute',top:5,right:10,backgroundColor:C.white,padding:8,borderRadius:20},
});
