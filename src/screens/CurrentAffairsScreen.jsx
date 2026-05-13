// ─────────────────────────────────────────────
// CurrentAffairsScreen.jsx  —  Professional UI v2
// Testbook / Adda247 style — mobile first
// ALL logic identical — only UI redesigned
// ─────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react'
import { saveTestResult } from '../services/storageService'

const TOPICS = [
  { id: 'schemes',       name: 'Government Schemes & Policies', hindi: 'सरकारी योजनाएँ',     icon: '🏛️', color: '#FF9933' },
  { id: 'sports',        name: 'Sports & Games',                hindi: 'खेल-कूद',             icon: '🏆', color: '#3b82f6' },
  { id: 'awards',        name: 'Awards & Honours',              hindi: 'पुरस्कार एवं सम्मान', icon: '🎖️', color: '#138808' },
  { id: 'science',       name: 'Science & Space',               hindi: 'विज्ञान एवं अंतरिक्ष',icon: '🚀', color: '#a855f7' },
  { id: 'economy',       name: 'Economy & Banking',             hindi: 'अर्थव्यवस्था',        icon: '💰', color: '#22c55e' },
  { id: 'international', name: 'International Relations',       hindi: 'अंतर्राष्ट्रीय संबंध',icon: '🌍', color: '#3b82f6' },
  { id: 'environment',   name: 'Environment & Climate',         hindi: 'पर्यावरण एवं जलवायु', icon: '🌱', color: '#138808' },
  { id: 'appointments',  name: 'Appointments & Elections',      hindi: 'नियुक्तियाँ एवं चुनाव',icon: '👤', color: '#FF9933' },
  { id: 'defence',       name: 'Defence & Security',            hindi: 'रक्षा एवं सुरक्षा',   icon: '🛡️', color: '#ef4444' },
  { id: 'culture',       name: 'Art & Culture',                 hindi: 'कला एवं संस्कृति',    icon: '🎭', color: '#a855f7' },
]

const YEARS = [
  { label: '2025-2026', value: '2025 2026' },
  { label: '2024-2025', value: '2024 2025' },
  { label: '2023-2024', value: '2023 2024' },
  { label: '2022-2023', value: '2022 2023' },
]

export default function CurrentAffairsScreen({ user, navigate, onLogout, selectedExam, onSelectExam, language, onLanguageChange }) {
  const [phase,         setPhase]         = useState('select')
  const [activeTopic,   setActiveTopic]   = useState(null)
  const [activeYear,    setActiveYear]    = useState(YEARS[0])
  const [questions,     setQuestions]     = useState([])
  const [current,       setCurrent]       = useState(0)
  const [answers,       setAnswers]       = useState({})
  const [revealed,      setRevealed]      = useState({})
  const [timeLeft,      setTimeLeft]      = useState(0)
  const [error,         setError]         = useState('')
  const [localExam,     setLocalExam]     = useState(selectedExam)
  const [showExamPicker,setShowExamPicker]= useState(!selectedExam)
  const timerRef = useRef(null)

  const activeExam = localExam || selectedExam

  const handleExamSelect = (exam) => {
    setLocalExam(exam)
    onSelectExam && onSelectExam(exam, false)
  }

  const handleStart = async () => {
    if (!activeTopic) return
    if (!selectedExam) {
      setError('Please select an exam from Home screen first')
      return
    }
    try {
      setPhase('loading')
      setError('')
      const { getCAQuestions }                  = await import('../services/caService.js')
      const { generateCurrentAffairsQuestions } = await import('../services/aiService.js')
      const qs = await getCAQuestions({
        exam:     activeExam || 'General',
        topic:    activeTopic.name,
        year:     activeYear.value,
        count:    15,
        language: language,
        generateFn: ({ exam, topic, year, count, language }) =>
          generateCurrentAffairsQuestions({ exam, topic, year, count, language }),
      })
      setQuestions(qs)
      setCurrent(0)
      setAnswers({})
      setRevealed({})
      setTimeLeft(15 * 60)
      setPhase('test')
    } catch (e) {
      setError('Failed to load questions. Please try again.')
      setPhase('select')
    }
  }

  useEffect(() => {
    if (phase === 'test') {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); finishTest(); return 0 }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [phase])

  const selectAnswer = (optIndex) => {
    if (revealed[current]) return
    setAnswers(prev  => ({ ...prev, [current]: optIndex }))
    setRevealed(prev => ({ ...prev, [current]: true }))
  }

  const finishTest = async () => {
    const score = questions.filter((q, i) => answers[i] === q.correct).length
    await saveTestResult({
      exam: selectedExam, topic: 'Current Affairs', subtopic: activeTopic.name,
      level: 'same', score, total: questions.length, timeTaken: 15 * 60 - timeLeft,
    })
    setPhase('result')
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const scoreColor = (pct) => pct >= 70 ? '#22c55e' : pct >= 50 ? '#f97316' : '#ef4444'
  const scoreBg    = (pct) => pct >= 70 ? 'rgba(34,197,94,.08)' : pct >= 50 ? 'rgba(249,115,22,.08)' : 'rgba(239,68,68,.08)'

  // ════════════════════════════════════════════
  // PHASE: SELECT
  // ════════════════════════════════════════════
  if (phase === 'select') {
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

    return (
      <div className="page">
        <style>{`
          @keyframes caFadeUp    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
          @keyframes caChakra    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          @keyframes caShimmer   { 0%{background-position:200%} 100%{background-position:-200%} }
          @keyframes caMarquee   { from{transform:translateX(0)} to{transform:translateX(-50%)} }
          @keyframes caPulse     { 0%,100%{opacity:1} 50%{opacity:.6} }
          .ca-topic-card  { transition:all .18s ease; cursor:pointer; }
          .ca-topic-card:hover { background:rgba(255,255,255,.04) !important; }
          .ca-topic-card:active { transform:scale(.98); }
          .ca-year-btn    { transition:all .15s ease; }
          .ca-year-btn:hover { border-color:var(--accent) !important; color:var(--accent) !important; }
          .ca-start-btn:hover { filter:brightness(1.08); transform:translateY(-1px); }
          .ca-exam-btn    { transition:all .15s; }
          .ca-exam-btn:hover { border-color:var(--accent) !important; color:var(--accent) !important; }
          /* Ashoka chakra spokes */
          .chakra-svg { animation:caChakra 12s linear infinite; transform-origin:center; }
        `}</style>

        {/* ── TRICOLOR TOP STRIP (Govt of India style) ── */}
        <div style={{ display:'flex', height:5, borderRadius:'4px 4px 0 0', overflow:'hidden', marginBottom:0 }}>
          <div style={{ flex:1, background:'#FF9933' }} />
          <div style={{ flex:1, background:'white',   opacity:.6 }} />
          <div style={{ flex:1, background:'#138808' }} />
        </div>

        {/* ── GOVERNMENT HEADER BANNER ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #1a2f5e 60%, #0d1e40 100%)',
          borderRadius: '0 0 20px 20px', padding: 'clamp(16px,4vw,24px)',
          marginBottom: 16, color: 'white',
          position: 'relative', overflow: 'hidden',
          animation: 'caFadeUp .4s ease both',
          border: '1px solid rgba(255,153,51,.15)',
          borderTop: 'none',
        }}>
          {/* Subtle saffron glow top-right */}
          <div style={{ position:'absolute', top:-50, right:-50, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,153,51,.12) 0%,transparent 65%)', pointerEvents:'none' }} />
          {/* Green glow bottom-left */}
          <div style={{ position:'absolute', bottom:-40, left:-20, width:150, height:150, borderRadius:'50%', background:'radial-gradient(circle,rgba(19,136,8,.1) 0%,transparent 65%)', pointerEvents:'none' }} />

          <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'flex-start', gap:16 }}>

            {/* Ashoka Chakra SVG */}
            <div style={{ flexShrink:0, width:54, height:54 }}>
              <svg viewBox="0 0 54 54" className="chakra-svg" style={{ width:54, height:54 }}>
                {/* Outer circle */}
                <circle cx="27" cy="27" r="25" fill="none" stroke="rgba(255,153,51,.6)" strokeWidth="1.5"/>
                {/* Inner circle */}
                <circle cx="27" cy="27" r="8" fill="none" stroke="rgba(255,153,51,.5)" strokeWidth="1"/>
                {/* 24 spokes */}
                {Array.from({length:24}).map((_,i) => {
                  const a  = (i * 15 * Math.PI) / 180
                  const x1 = 27 + 9  * Math.cos(a)
                  const y1 = 27 + 9  * Math.sin(a)
                  const x2 = 27 + 23 * Math.cos(a)
                  const y2 = 27 + 23 * Math.sin(a)
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,153,51,.45)" strokeWidth="1"/>
                })}
                {/* Center dot */}
                <circle cx="27" cy="27" r="3" fill="rgba(255,153,51,.7)"/>
              </svg>
            </div>

            {/* Text block */}
            <div style={{ flex:1, minWidth:0 }}>
              {/* Bilingual header */}
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'1.5px', color:'rgba(255,153,51,.9)', textTransform:'uppercase', marginBottom:4 }}>
                भारत सरकार &nbsp;|&nbsp; Government of India
              </div>
              <h1 style={{ fontSize:'clamp(18px,4vw,26px)', fontWeight:900, lineHeight:1.2, marginBottom:6, letterSpacing:'-0.3px' }}>
                Current Affairs Quiz
                <span style={{ display:'block', fontSize:'clamp(12px,2.5vw,15px)', fontWeight:500, color:'rgba(255,255,255,.65)', letterSpacing:'0.2px', marginTop:3 }}>
                  सामयिक मामले क्विज़
                </span>
              </h1>
              <p style={{ fontSize:12, color:'rgba(255,255,255,.7)', lineHeight:1.65, marginBottom:14, maxWidth:420 }}>
                Daily · Weekly · Monthly — Live news + AI questions for SSC, Railway, Banking & UPSC
              </p>

              {/* Stats row */}
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                {[
                  { icon:'❓', val:'15 प्रश्न', sub:'Questions' },
                  { icon:'⏱', val:'15 मिनट',   sub:'Minutes'   },
                  { icon:'🌐', val:'Live News',  sub:'Real-time' },
                  { icon:'🆓', val:'निःशुल्क',  sub:'Free'      },
                ].map(s => (
                  <div key={s.val} style={{ display:'flex', flexDirection:'column', alignItems:'center', background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'7px 12px', minWidth:58 }}>
                    <span style={{ fontSize:16, marginBottom:2 }}>{s.icon}</span>
                    <span style={{ fontSize:10, fontWeight:800, color:'#FF9933', lineHeight:1 }}>{s.val}</span>
                    <span style={{ fontSize:9,  color:'rgba(255,255,255,.5)', marginTop:1 }}>{s.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Satyamev Jayate motto strip */}
          <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
            <div style={{ fontSize:11, color:'rgba(255,153,51,.8)', fontStyle:'italic', letterSpacing:'0.5px' }}>
              सत्यमेव जयते &nbsp;— &nbsp;Truth Alone Triumphs
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <div style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:5, background:'rgba(19,136,8,.2)', border:'1px solid rgba(19,136,8,.4)', color:'#4ade80' }}>
                🆓 FREE ACCESS
              </div>
              {activeExam && (
                <div style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:5, background:'rgba(255,153,51,.15)', border:'1px solid rgba(255,153,51,.35)', color:'#FF9933' }}>
                  {activeExam}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SCROLLING NOTICE BAR (NIC portal style) ── */}
        <div style={{ background:'rgba(255,153,51,.06)', border:'1px solid rgba(255,153,51,.2)', borderRadius:10, padding:'8px 0', marginBottom:18, display:'flex', alignItems:'center', overflow:'hidden', animation:'caFadeUp .4s ease .04s both' }}>
          <div style={{ background:'rgba(255,153,51,.15)', borderRight:'1px solid rgba(255,153,51,.2)', padding:'0 12px', fontSize:10, fontWeight:800, color:'#c2410c', textTransform:'uppercase', letterSpacing:'0.5px', flexShrink:0, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:5, alignSelf:'stretch' }}>
            📢 NOTICE
          </div>
          <div style={{ overflow:'hidden', flex:1, paddingLeft:12 }}>
            <div style={{ display:'inline-block', fontSize:11, color:'var(--muted2)', whiteSpace:'nowrap', animation:'caMarquee 25s linear infinite' }}>
              Questions based on latest {activeYear.label} news &nbsp;·&nbsp; Tailored for {activeExam||'Government Exams'} &nbsp;·&nbsp; AI-verified with actual news sources &nbsp;·&nbsp; 100% Free — निःशुल्क &nbsp;·&nbsp; Questions based on latest {activeYear.label} news &nbsp;·&nbsp; Tailored for {activeExam||'Government Exams'} &nbsp;·&nbsp; AI-verified with actual news sources &nbsp;·&nbsp; 100% Free — निःशुल्क
            </div>
          </div>
        </div>

        {/* ── TODAY'S DATE CARD (official gazette style) ── */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '12px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 10,
          animation: 'caFadeUp .4s ease .06s both',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Left saffron accent */}
          <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:'linear-gradient(180deg,#FF9933,#138808)' }} />
          <div style={{ paddingLeft:8, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,153,51,.1)', border:'1px solid rgba(255,153,51,.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
              📋
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:700 }}>Daily Current Affairs Quiz</div>
              <div style={{ fontSize:11, color:'var(--muted)', display:'flex', alignItems:'center', gap:6 }}>
                <span>📅 {today}</span>
                <span>·</span>
                <span style={{ color:'var(--green)', fontWeight:600 }}>● Live</span>
              </div>
            </div>
          </div>
          {/* Right badges */}
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <div style={{ fontSize:10, fontWeight:800, padding:'4px 10px', borderRadius:6, background:'rgba(19,136,8,.08)', border:'1px solid rgba(19,136,8,.25)', color:'#16a34a', letterSpacing:'0.3px' }}>
              FREE · निःशुल्क
            </div>
          </div>
        </div>

        {/* ── EXAM SELECTOR ── */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'16px 18px', marginBottom:20, animation:'caFadeUp .4s ease .1s both' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: showExamPicker ? 14 : 0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:9, background:'rgba(249,115,22,.1)', border:'1px solid rgba(249,115,22,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>🎯</div>
              <div>
                <div style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:2 }}>Target Exam</div>
                {activeExam
                  ? <div style={{ fontSize:14, fontWeight:700, color:'var(--accent)' }}>{activeExam}</div>
                  : <div style={{ fontSize:13, color:'var(--muted)' }}>Select for targeted questions</div>
                }
              </div>
            </div>
            <button className="ca-exam-btn"
              onClick={() => setShowExamPicker(p => !p)}
              style={{ padding:'6px 12px', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted2)', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              {showExamPicker ? '▲ Hide' : '▼ Change'}
            </button>
          </div>

          {showExamPicker && (
            <div style={{ paddingTop:14, borderTop:'1px solid var(--border)' }}>
              {[
                { group:'🚂 Railway', color:'#3b82f6', exams:['RRB NTPC','RRB Group D','RRB ALP'] },
                { group:'📋 SSC',     color:'#f97316', exams:['SSC CGL','SSC CHSL','SSC MTS','SSC GD'] },
                { group:'🏦 Banking', color:'#22c55e', exams:['IBPS PO','IBPS Clerk','SBI PO','SBI Clerk'] },
                { group:'🎯 UPSC',    color:'#a855f7', exams:['UPSC Prelims','UPSC CDS'] },
                { group:'🏛️ State',   color:'#eab308', exams:['State PSC'] },
              ].map(g => (
                <div key={g.group} style={{ marginBottom:12 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:7 }}>{g.group}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {g.exams.map(exam => (
                      <button key={exam}
                        style={{ padding:'5px 12px', borderRadius:7, border:`1px solid ${activeExam===exam?g.color:'var(--border)'}`, background:activeExam===exam?`${g.color}12`:'var(--surface2)', color:activeExam===exam?g.color:'var(--muted2)', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .15s' }}
                        onClick={() => { handleExamSelect(exam); setShowExamPicker(false) }}>
                        {exam}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── TIME PERIOD ── */}
        <div style={{ marginBottom:24, animation:'caFadeUp .4s ease .15s both' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <div style={{ width:4, height:18, borderRadius:2, background:'var(--blue)' }} />
            <span style={{ fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.6px' }}>Select Time Period</span>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {YEARS.map(year => (
              <button key={year.value} className="ca-year-btn"
                onClick={() => setActiveYear(year)}
                style={{
                  padding:'9px 18px', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer',
                  border:`1.5px solid ${activeYear.value===year.value?'var(--accent)':'var(--border)'}`,
                  background: activeYear.value===year.value?'rgba(249,115,22,.08)':'var(--surface)',
                  color: activeYear.value===year.value?'var(--accent)':'var(--muted2)',
                  transition:'all .15s',
                }}>
                {year.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── TOPIC CARDS — Testbook style list ── */}
        <div style={{ marginBottom:28, animation:'caFadeUp .4s ease .2s both' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <div style={{ width:4, height:18, borderRadius:2, background:'var(--accent)' }} />
            <span style={{ fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.6px' }}>Select Topic</span>
          </div>

          {/* List style — govt portal official list */}
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
            {TOPICS.map((topic, i) => {
              const isActive = activeTopic?.id === topic.id
              return (
                <div key={topic.id}
                  className="ca-topic-card"
                  onClick={() => setActiveTopic(topic)}
                  style={{
                    display:'flex', alignItems:'center', gap:14, padding:'13px 16px',
                    borderBottom: i < TOPICS.length-1 ? '1px solid var(--border)' : 'none',
                    background: isActive ? `${topic.color}08` : 'transparent',
                    borderLeft: `3px solid ${isActive ? topic.color : 'transparent'}`,
                    transition:'all .18s',
                  }}
                >
                  {/* Tricolor mini bar + icon */}
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <div style={{ width:44, height:44, borderRadius:'50%', background:isActive?`${topic.color}18`:`${topic.color}10`, border:`1.5px solid ${isActive?topic.color:`${topic.color}30`}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                      {topic.icon}
                    </div>
                    {isActive && (
                      <div style={{ position:'absolute', bottom:-2, right:-2, width:14, height:14, borderRadius:'50%', background:topic.color, border:'2px solid var(--surface)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontSize:7, color:'white', fontWeight:900 }}>✓</span>
                      </div>
                    )}
                  </div>

                  {/* Bilingual text */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:isActive?700:600, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {topic.name}
                    </div>
                    <div style={{ fontSize:11, color:isActive?topic.color:'var(--muted)', fontWeight:isActive?600:400 }}>
                      {topic.hindi}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:3, flexWrap:'wrap' }}>
                      <span style={{ fontSize:9, color:'var(--muted)' }}>15 Questions · {activeYear.label}</span>
                      <span style={{ fontSize:9, fontWeight:700, color:'#16a34a', background:'rgba(19,136,8,.08)', border:'1px solid rgba(19,136,8,.2)', borderRadius:3, padding:'1px 5px' }}>FREE</span>
                    </div>
                  </div>

                  {/* Right */}
                  {isActive ? (
                    <div style={{ padding:'5px 12px', borderRadius:7, background:topic.color, color:'white', fontSize:11, fontWeight:700, flexShrink:0 }}>
                      Selected ✓
                    </div>
                  ) : (
                    <span style={{ fontSize:20, color:'var(--muted)', flexShrink:0 }}>›</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background:'rgba(239,68,68,.06)', border:'1px solid rgba(239,68,68,.25)', borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:13, color:'var(--red)', display:'flex', alignItems:'center', gap:8 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── STICKY START BUTTON — saffron govt style ── */}
        <div style={{ position:'sticky', bottom:16, zIndex:10, marginTop:24 }}>
          <button className="ca-start-btn"
            onClick={handleStart}
            disabled={!activeTopic}
            style={{
              width:'100%', padding:'15px', borderRadius:14,
              background: activeTopic
                ? 'linear-gradient(135deg, #FF9933 0%, #f97316 50%, #FF9933 100%)'
                : 'var(--surface2)',
              border:`1px solid ${activeTopic?'rgba(255,153,51,.5)':'var(--border)'}`,
              color: activeTopic ? 'white' : 'var(--muted)',
              fontSize:15, fontWeight:800,
              cursor: activeTopic ? 'pointer' : 'not-allowed',
              boxShadow: activeTopic ? '0 6px 24px rgba(255,153,51,.4)' : 'none',
              transition:'all .2s',
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              letterSpacing:'0.2px',
            }}>
            {activeTopic ? (
              <>
                <span style={{ fontSize:18 }}>{activeTopic.icon}</span>
                <span>
                  Start Quiz — {activeTopic.name}
                  <span style={{ display:'block', fontSize:11, opacity:.85, fontWeight:500 }}>{activeTopic.hindi} · {activeYear.label}</span>
                </span>
              </>
            ) : (
              '↑ ऊपर से विषय चुनें — Select a topic above'
            )}
          </button>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════
  // PHASE: LOADING
  // ════════════════════════════════════════════
  if (phase === 'loading') {
    return (
      <div className="page">
        <style>{`
          @keyframes caSpinPulse { 0%{transform:rotate(0deg) scale(1)} 50%{transform:rotate(180deg) scale(1.05)} 100%{transform:rotate(360deg) scale(1)} }
          @keyframes caDot { 0%,80%,100%{transform:scale(0);opacity:.3} 40%{transform:scale(1);opacity:1} }
        `}</style>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', textAlign:'center', padding:'0 20px' }}>
          {/* Animated icon */}
          <div style={{ width:80, height:80, borderRadius:'50%', background:`${activeTopic?.color || 'var(--accent)'}15`, border:`2px solid ${activeTopic?.color || 'var(--accent)'}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, marginBottom:24, animation:'caSpinPulse 2s ease-in-out infinite' }}>
            {activeTopic?.icon || '📰'}
          </div>

          {/* Loading dots */}
          <div style={{ display:'flex', gap:6, marginBottom:20 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width:10, height:10, borderRadius:'50%', background:activeTopic?.color||'var(--accent)', animation:`caDot 1.4s ease-in-out ${i*0.16}s infinite` }} />
            ))}
          </div>

          <h2 style={{ fontSize:18, fontWeight:800, marginBottom:10 }}>Searching Latest News...</h2>

          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'16px 20px', maxWidth:340, width:'100%' }}>
            {[
              { icon:'🌐', text:`Fetching ${activeYear.label} events` },
              { icon:'🤖', text:`Generating 15 exam questions` },
              { icon:'🎯', text:`Tailoring for ${activeExam || 'your exam'}` },
            ].map((s, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', fontSize:13, color:'var(--muted2)' }}>
                <span style={{ fontSize:16 }}>{s.icon}</span>
                {s.text}
                <div style={{ marginLeft:'auto', width:16, height:16, borderRadius:'50%', border:'2px solid var(--border)', borderTopColor:'var(--accent)', animation:'spin .8s linear infinite' }} />
              </div>
            ))}
          </div>

          <p style={{ fontSize:12, color:'var(--muted)', marginTop:16, lineHeight:1.6 }}>
            This takes 10-15 seconds<br />Questions are fresh from today's news
          </p>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════
  // PHASE: RESULT
  // ════════════════════════════════════════════
  if (phase === 'result') {
    const score   = questions.filter((q, i) => answers[i] === q.correct).length
    const percent = Math.round((score / questions.length) * 100)
    const col     = scoreColor(percent)
    const msg     = percent >= 70 ? 'Excellent! Well prepared on this topic.' : percent >= 50 ? 'Good effort! Review the wrong answers below.' : 'Keep practicing! Focus on the explanations.'

    return (
      <div className="page" style={{ maxWidth:720 }}>
        <style>{`@keyframes caScoreIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}`}</style>

        {/* Score card */}
        <div style={{ background:'var(--surface)', border:`2px solid ${col}30`, borderRadius:20, padding:'clamp(24px,5vw,40px)', textAlign:'center', marginBottom:20, position:'relative', overflow:'hidden', animation:'caFadeUp .5s ease both' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,${col},${col}88)` }} />

          {/* Big score circle */}
          <div style={{ width:96, height:96, borderRadius:'50%', border:`3px solid ${col}`, background:`${col}10`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', animation:'caScoreIn .6s ease both' }}>
            <span style={{ fontSize:28, fontWeight:900, color:col, lineHeight:1 }}>{percent}%</span>
          </div>

          <div style={{ fontSize:20, fontWeight:800, marginBottom:6 }}>{score}/{questions.length} Correct</div>
          <div style={{ fontSize:13, color:'var(--muted2)', marginBottom:10 }}>
            {activeTopic?.name} · {activeYear.label} · {selectedExam}
          </div>
          <div style={{ fontSize:14, color:'var(--muted2)', fontStyle:'italic' }}>{msg}</div>

          {/* Mini stats */}
          <div style={{ display:'flex', justifyContent:'center', gap:12, marginTop:18, flexWrap:'wrap' }}>
            {[
              { val:score,                     label:'Correct', col:'var(--green)' },
              { val:questions.length-score,    label:'Wrong',   col:'var(--red)'   },
              { val:questions.length-Object.keys(answers).length, label:'Skipped', col:'var(--muted)' },
            ].map(s => (
              <div key={s.label} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 18px', textAlign:'center' }}>
                <div style={{ fontSize:20, fontWeight:900, color:s.col }}>{s.val}</div>
                <div style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:28 }}>
          <button onClick={() => { setPhase('select'); setQuestions([]); setAnswers({}); setRevealed({}) }}
            style={{ flex:1, padding:'11px 16px', background:'linear-gradient(135deg,var(--accent),#ea580c)', border:'none', borderRadius:12, color:'white', fontSize:13, fontWeight:700, cursor:'pointer', minWidth:140 }}>
            📚 Practice Another
          </button>
          <button onClick={handleStart}
            style={{ flex:1, padding:'11px 16px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, color:'var(--text)', fontSize:13, fontWeight:600, cursor:'pointer', minWidth:120 }}>
            🔄 Retry Same
          </button>
          <button onClick={() => navigate('dashboard')}
            style={{ padding:'11px 16px', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:12, color:'var(--muted2)', fontSize:13, cursor:'pointer' }}>
            📊 Progress
          </button>
        </div>

        {/* Answer review */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <div style={{ width:4, height:18, borderRadius:2, background:'var(--accent)' }} />
          <span style={{ fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.6px' }}>Answer Review</span>
        </div>

        {questions.map((q, i) => {
          const userAnswer = answers[i]
          const isCorrect  = userAnswer === q.correct
          const answered   = userAnswer !== undefined
          const bColor     = !answered ? 'var(--border)' : isCorrect ? 'rgba(34,197,94,.4)' : 'rgba(239,68,68,.4)'

          return (
            <div key={i} style={{ background:'var(--surface)', border:`1px solid ${bColor}`, borderRadius:14, padding:'16px 18px', marginBottom:12, borderLeft:`4px solid ${!answered?'var(--muted)':isCorrect?'var(--green)':'var(--red)'}` }}>
              {/* Q header */}
              <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:14 }}>
                <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, background:!answered?'var(--surface2)':isCorrect?'rgba(34,197,94,.12)':'rgba(239,68,68,.12)', color:!answered?'var(--muted)':isCorrect?'var(--green)':'var(--red)' }}>
                  {i+1}
                </div>
                <span style={{ fontSize:14, lineHeight:1.65, fontWeight:500 }}>{q.question}</span>
              </div>

              {/* Options grid */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:8, marginBottom:12 }}>
                {q.options.map((opt, oi) => {
                  const isCorrectOpt = oi === q.correct
                  const isUserWrong  = oi === userAnswer && !isCorrect
                  return (
                    <div key={oi} style={{ display:'flex', gap:8, alignItems:'center', padding:'8px 12px', borderRadius:9, border:`1px solid ${isCorrectOpt?'var(--green)':isUserWrong?'var(--red)':'var(--border)'}`, background:isCorrectOpt?'rgba(34,197,94,.07)':isUserWrong?'rgba(239,68,68,.07)':'transparent', fontSize:13, color:isCorrectOpt?'var(--green)':isUserWrong?'var(--red)':'var(--muted2)' }}>
                      <span style={{ width:22, height:22, borderRadius:6, background:'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, flexShrink:0, color:'var(--muted)' }}>
                        {['A','B','C','D'][oi]}
                      </span>
                      {opt}
                      {isCorrectOpt && <span style={{ marginLeft:'auto', fontSize:12 }}>✓</span>}
                      {isUserWrong  && <span style={{ marginLeft:'auto', fontSize:12 }}>✗</span>}
                    </div>
                  )
                })}
              </div>

              {/* Explanation */}
              <div style={{ background:'rgba(34,197,94,.05)', border:'1px solid rgba(34,197,94,.2)', borderRadius:10, padding:'12px 14px' }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--green)', marginBottom:6 }}>📖 Explanation</div>
                <div style={{ fontSize:13, color:'var(--text)', lineHeight:1.75, whiteSpace:'pre-line' }}>{q.explanation}</div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // ════════════════════════════════════════════
  // PHASE: TEST
  // ════════════════════════════════════════════
  const q          = questions[current]
  const isAnswered = revealed[current]
  const userAnswer = answers[current]
  const progress   = ((current + 1) / questions.length) * 100
  const urgentTime = timeLeft < 60

  return (
    <div className="page" style={{ maxWidth:760 }}>
      <style>{`
        @keyframes caOptIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        @keyframes caTimerPulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .ca-option { transition:all .15s ease; cursor:pointer; }
        .ca-option:hover:not([disabled]) { transform:translateX(4px); }
        .ca-option:active:not([disabled]) { transform:scale(.98); }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, background:`${activeTopic.color}12`, border:`1px solid ${activeTopic.color}30`, borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:700, color:activeTopic.color }}>
            <span>{activeTopic.icon}</span> {activeTopic.name}
          </div>
          <div style={{ fontSize:11, padding:'4px 10px', borderRadius:20, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--muted2)', fontWeight:600 }}>
            {activeYear.label}
          </div>
          {activeExam && (
            <div style={{ fontSize:11, padding:'4px 10px', borderRadius:20, background:'rgba(249,115,22,.08)', border:'1px solid rgba(249,115,22,.2)', color:'var(--accent)', fontWeight:600 }}>
              {activeExam}
            </div>
          )}
        </div>

        {/* Timer */}
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:10, background:urgentTime?'rgba(239,68,68,.08)':'var(--surface)', border:`1px solid ${urgentTime?'rgba(239,68,68,.35)':'var(--border)'}`, fontSize:15, fontWeight:800, color:urgentTime?'var(--red)':'var(--text)', animation:urgentTime?'caTimerPulse 1s infinite':'none' }}>
          <span style={{ fontSize:14 }}>⏱</span> {formatTime(timeLeft)}
        </div>
      </div>

      {/* ── PROGRESS ── */}
      <div style={{ marginBottom:20 }}>
        <div style={{ height:5, background:'var(--surface2)', borderRadius:3, overflow:'hidden', marginBottom:6 }}>
          <div style={{ height:'100%', width:`${progress}%`, background:`linear-gradient(90deg,${activeTopic.color},${activeTopic.color}cc)`, borderRadius:3, transition:'width .4s ease' }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:12, color:'var(--muted)' }}>Question {current+1} of {questions.length}</span>
          <span style={{ fontSize:11, fontWeight:700, color:activeTopic.color }}>{Math.round(progress)}% done</span>
        </div>
      </div>

      {/* ── QUESTION DOTS NAV ── */}
      <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:20, justifyContent:'center' }}>
        {questions.map((_, i) => (
          <div key={i}
            onClick={() => setCurrent(i)}
            style={{ width:28, height:28, borderRadius:7, fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s',
              background: i === current
                ? activeTopic.color
                : revealed[i]
                  ? (answers[i] === questions[i].correct ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)')
                  : 'var(--surface2)',
              color: i === current ? 'white' : revealed[i] ? (answers[i] === questions[i].correct ? 'var(--green)' : 'var(--red)') : 'var(--muted)',
              border: `1px solid ${i===current?activeTopic.color:revealed[i]?(answers[i]===questions[i].correct?'rgba(34,197,94,.3)':'rgba(239,68,68,.3)'):'var(--border)'}`,
            }}>
            {i+1}
          </div>
        ))}
      </div>

      {/* ── QUESTION CARD ── */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'clamp(16px,4vw,24px)', marginBottom:14, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${activeTopic.color},${activeTopic.color}66)` }} />
        <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
          <div style={{ width:30, height:30, borderRadius:9, background:`${activeTopic.color}15`, border:`1px solid ${activeTopic.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:activeTopic.color, flexShrink:0 }}>
            {current+1}
          </div>
          <p style={{ fontSize:15, lineHeight:1.75, fontWeight:500, margin:0 }}>{q.question}</p>
        </div>
      </div>

      {/* ── OPTIONS ── */}
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
        {q.options.map((opt, oi) => {
          const isCorrectOpt = oi === q.correct
          const isSelected   = userAnswer === oi
          const isWrong      = isSelected && !isCorrectOpt

          let bg     = 'var(--surface)'
          let border = 'var(--border)'
          let color  = 'var(--text)'
          let lblBg  = 'var(--surface2)'
          let lblCol = 'var(--muted2)'

          if (isAnswered) {
            if (isCorrectOpt) { bg='rgba(34,197,94,.08)'; border='var(--green)'; color='var(--green)'; lblBg='rgba(34,197,94,.2)'; lblCol='var(--green)' }
            else if (isWrong) { bg='rgba(239,68,68,.08)'; border='var(--red)';   color='var(--red)';   lblBg='rgba(239,68,68,.2)'; lblCol='var(--red)' }
            else { color='var(--muted)'; border='var(--border)' }
          }

          return (
            <div key={oi} className="ca-option"
              onClick={() => !isAnswered && selectAnswer(oi)}
              style={{ display:'flex', alignItems:'center', gap:14, padding:'clamp(12px,3vw,16px) clamp(14px,3vw,18px)', borderRadius:12, border:`1.5px solid ${border}`, background:bg, color, animation:`caOptIn .25s ease ${oi*0.06}s both` }}>
              <div style={{ width:32, height:32, borderRadius:8, background:lblBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:lblCol, flexShrink:0, transition:'all .15s' }}>
                {['A','B','C','D'][oi]}
              </div>
              <span style={{ fontSize:14, lineHeight:1.5, fontWeight:500 }}>{opt}</span>
              {isAnswered && isCorrectOpt && <span style={{ marginLeft:'auto', fontSize:18, flexShrink:0 }}>✅</span>}
              {isAnswered && isWrong      && <span style={{ marginLeft:'auto', fontSize:18, flexShrink:0 }}>❌</span>}
            </div>
          )
        })}
      </div>

      {/* ── EXPLANATION ── */}
      {isAnswered && (
        <div style={{ background:'rgba(34,197,94,.05)', border:'1px solid rgba(34,197,94,.2)', borderRadius:12, padding:'14px 18px', marginBottom:20, animation:'caFadeUp .3s ease both' }}>
          <div style={{ fontSize:12, fontWeight:800, color:'var(--green)', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
            <span>📖</span> Explanation
          </div>
          <div style={{ fontSize:13, color:'var(--text)', lineHeight:1.8, whiteSpace:'pre-line' }}>{q.explanation}</div>
        </div>
      )}

      {/* ── NAV BUTTONS ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:10 }}>
        <button onClick={() => current > 0 && setCurrent(c => c-1)}
          disabled={current === 0}
          style={{ padding:'10px 20px', borderRadius:10, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--muted2)', fontSize:13, fontWeight:600, cursor:current===0?'not-allowed':'pointer', opacity:current===0?0.4:1, transition:'all .15s' }}>
          ← Prev
        </button>

        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent(c => c+1)}
            style={{ flex:1, maxWidth:200, padding:'11px 20px', borderRadius:10, background:`linear-gradient(135deg,${activeTopic.color},${activeTopic.color}cc)`, border:'none', color:'white', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:`0 3px 12px ${activeTopic.color}35` }}>
            Next →
          </button>
        ) : (
          <button onClick={finishTest}
            style={{ flex:1, maxWidth:200, padding:'11px 20px', borderRadius:10, background:'linear-gradient(135deg,var(--green),#16a34a)', border:'none', color:'white', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 3px 12px rgba(34,197,94,.35)' }}>
            ✅ Submit Quiz
          </button>
        )}
      </div>

    </div>
  )
}