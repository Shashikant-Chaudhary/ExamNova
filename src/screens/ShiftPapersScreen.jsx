// ─────────────────────────────────────────────
// ShiftPapersScreen.jsx
// Real exam experience — fullscreen, section-wise,
// optional subject selector, mobile + desktop
// ─────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { getShiftsByExam, analyseShift } from '../services/shiftService'

// Responsive CSS — palette always visible on desktop, hidden on mobile
const injectCSS = () => {
  if (document.getElementById('exam-palette-css')) return
  const style = document.createElement('style')
  style.id = 'exam-palette-css'
  style.textContent = `
    .exam-palette { display: flex !important; flex-direction: column; }
    .palette-toggle-mobile { display: none !important; }
    @media (max-width: 640px) {
      .exam-palette { display: none !important; }
      .palette-toggle-mobile { display: flex !important; }
    }
  `
  document.head.appendChild(style)
}

const EXAMS = [
  'SSC CGL', 'SSC CHSL', 'SSC MTS', 'SSC GD',
  'RRB NTPC', 'RRB Group D', 'RRB ALP',
  'IBPS PO', 'IBPS Clerk', 'SBI PO', 'SBI Clerk',
  'UPSC Prelims', 'UPSC CDS', 'State PSC',
]

const OPTIONAL_SUBJECT_EXAMS = ['SSC GD', 'SSC MTS', 'SSC CHSL', 'RRB NTPC', 'RRB Group D', 'RRB ALP', 'State PSC']

const EXAM_DURATIONS = {
  'SSC CGL': 60, 'SSC CHSL': 60, 'SSC MTS': 90, 'SSC GD': 60,
  'RRB NTPC': 90, 'RRB Group D': 90, 'RRB ALP': 60,
  'IBPS PO': 60, 'IBPS Clerk': 60, 'SBI PO': 60, 'SBI Clerk': 60,
  'UPSC Prelims': 120, 'UPSC CDS': 120, 'State PSC': 120,
}

const SECTION_NAMES = {
  'Part-A': 'Part A — Reasoning',
  'Part-B': 'Part B — G.K.',
  'Part-C': 'Part C — Maths',
  'Part-D': 'Part D — English',
  'Part-E': 'Part E — Hindi',
}

export default function ShiftPapersScreen({
  user, navigate, selectedExam, onSelectExam, language,
}) {
  const [activeExam,     setActiveExam]     = useState(selectedExam || 'SSC CGL')
  const [shifts,         setShifts]         = useState([])
  const [loading,        setLoading]        = useState(false)
  const [activeShift,    setActiveShift]    = useState(null)
  const [activeView,     setActiveView]     = useState('papers')
  const [filterYear,     setFilterYear]     = useState('all')
  const [optionalSubject,setOptionalSubject]= useState('english')
  const [pendingShift,   setPendingShift]   = useState(null)
  const [testQuestions,  setTestQuestions]  = useState([])
  const [currentQ,       setCurrentQ]       = useState(0)
  const [answers,        setAnswers]        = useState({})
  const [marked,         setMarked]         = useState({})
  const [testSubmitted,  setTestSubmitted]  = useState(false)
  const [timeLeft,       setTimeLeft]       = useState(0)
  const [activeSection,  setActiveSection]  = useState(null)
  const [showPalette,    setShowPalette]    = useState(false)
  const timerRef = useRef(null)

  useEffect(() => { injectCSS() }, [])
  useEffect(() => { loadShifts() }, [activeExam])

  useEffect(() => {
    if (activeView === 'test' && !testSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current)
            setTestSubmitted(true)
            setActiveView('result')
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [activeView, testSubmitted])

  const loadShifts = async () => {
    setLoading(true)
    setActiveShift(null)
    setActiveView('papers')
    const data = await getShiftsByExam(activeExam)
    setShifts(data)
    setLoading(false)
  }

  const years = [...new Set(shifts.map(s => s.year))].sort((a, b) => b - a)
  const filteredShifts = filterYear === 'all' ? shifts : shifts.filter(s => String(s.year) === String(filterYear))

  const diffColor = (avg) => {
    if (!avg) return 'var(--muted)'
    if (avg <= 3) return 'var(--green)'
    if (avg <= 7) return '#f59e0b'
    return 'var(--red)'
  }
  const diffLabel = (avg) => {
    if (!avg) return 'Unknown'
    if (avg <= 3) return 'Easy'
    if (avg <= 7) return 'Medium'
    return 'Hard'
  }
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const getSections = (qs) => {
  const seen = []
  qs.forEach(q => {
    // try section field first, fall back to topic
    const sec = q.section || topicToSection(q.topic)
    if (sec && !seen.includes(sec)) seen.push(sec)
  })
  return seen
}

const topicToSection = (topic) => {
  if (!topic) return null
  const t = topic.toLowerCase()
  if (t.includes('reasoning') || t.includes('intelligence')) return 'Part-A'
  if (t.includes('general knowledge') || t.includes('awareness') || t.includes('general awareness')) return 'Part-B'
  if (t.includes('math') || t.includes('mathematics') || t.includes('quantitative') || t.includes('numerical')) return 'Part-C'
  if (t.includes('english')) return 'Part-D'
  if (t.includes('hindi')) return 'Part-E'
  return null
}
  const getSectionQs = (qs, section) =>
  qs.filter(q => (q.section || topicToSection(q.topic)) === section)

  const prepareQuestions = (shift, optional) => {
    const all = shift.questions || []
    if (!OPTIONAL_SUBJECT_EXAMS.includes(shift.exam)) return all
    return all.filter(q => {
  // check by section field
  if (q.section) {
    if (optional === 'hindi')   return q.section !== 'Part-D'
    if (optional === 'english') return q.section !== 'Part-E'
  }
  // fallback: check by topic field
  if (q.topic) {
    const t = q.topic.toLowerCase()
    if (optional === 'hindi')   return !t.includes('english')
    if (optional === 'english') return !t.includes('hindi')
  }
  return true
})
  }

  const openInstructions = (shift) => {
    setPendingShift(shift)
    setOptionalSubject('english')
    setActiveView('instructions')
    window.scrollTo(0, 0)
  }

  const startTest = () => {
    const shift = pendingShift
    const qs    = prepareQuestions(shift, optionalSubject)
    
    setTestQuestions(qs)
    setCurrentQ(0)
    setAnswers({})
    setMarked({})
    setTestSubmitted(false)
    setActiveShift(shift)
    setActiveView('test')
    const mins = shift.duration || EXAM_DURATIONS[shift.exam] || 60
    setTimeLeft(mins * 60)
    const sections = getSections(qs)
    setActiveSection(sections[0] || null)
    setShowPalette(false)
    window.scrollTo(0, 0)
  }

  const submitTest = () => {
    clearInterval(timerRef.current)
    setTestSubmitted(true)
    setActiveView('result')
    window.scrollTo(0, 0)
  }

  const calcScore = () => {
    let correct = 0
    testQuestions.forEach((q, i) => { if (answers[i] === q.correct) correct++ })
    return {
      correct,
      total:   testQuestions.length,
      wrong:   Object.keys(answers).filter(i => answers[Number(i)] !== testQuestions[Number(i)]?.correct).length,
      skipped: testQuestions.length - Object.keys(answers).length,
      percent: testQuestions.length ? Math.round((correct / testQuestions.length) * 100) : 0,
    }
  }

  const calcSectionScores = () => {
    return getSections(testQuestions).map(sec => {
      const qs = getSectionQs(testQuestions, sec)
      let correct = 0
      qs.forEach(q => { const gi = testQuestions.indexOf(q); if (answers[gi] === q.correct) correct++ })
      const attempted = qs.filter(q => answers[testQuestions.indexOf(q)] !== undefined).length
      return { section: sec, name: SECTION_NAMES[sec] || sec, correct, total: qs.length, attempted, percent: qs.length ? Math.round((correct / qs.length) * 100) : 0 }
    })
  }

  // ── INSTRUCTIONS ──────────────────────────────────────────────
  if (activeView === 'instructions' && pendingShift) {
    const shift       = pendingShift
    const hasOptional = OPTIONAL_SUBJECT_EXAMS.includes(shift.exam)
    const mins        = shift.duration || EXAM_DURATIONS[shift.exam] || 60
    const allQs       = shift.questions || []
    const sections    = getSections(allQs)

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px' }}>
        <div style={{ width: '100%', maxWidth: '580px' }}>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>📋</div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px' }}>{shift.exam}</h1>
            <p style={{ fontSize: '14px', color: 'var(--muted2)' }}>{shift.shift} · {shift.date}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: 'Questions', value: allQs.length,   icon: '📝' },
              { label: 'Duration',  value: `${mins} min`,  icon: '⏱' },
              { label: 'Marks',     value: allQs.length*2, icon: '🎯' },
              { label: 'Sections',  value: sections.length,icon: '📂' },
            ].map(item => (
              <div key={item.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent)', marginBottom: '2px' }}>{item.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{item.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Sections</div>
            {sections.map((sec, i) => {
              const secQs = getSectionQs(allQs, sec)
              const isOpt = sec === 'Part-D' || sec === 'Part-E'
              return (
                <div key={sec} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < sections.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{SECTION_NAMES[sec] || sec}</div>
                    {isOpt && <div style={{ fontSize: '10px', color: '#8b5cf6', marginTop: '1px' }}>Optional</div>}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent)', background: 'rgba(249,115,22,.1)', padding: '3px 10px', borderRadius: '6px' }}>
                    {secQs.length} Q
                  </span>
                </div>
              )
            })}
          </div>

          {hasOptional && (
            <div style={{ background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.2)', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--blue)', marginBottom: '6px' }}>📌 Select Optional Subject</div>
              <div style={{ fontSize: '12px', color: 'var(--muted2)', marginBottom: '12px', lineHeight: '1.5' }}>
                Attempt either Part D (English) or Part E (Hindi) — not both.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { val: 'english', label: 'English', sub: 'Part D', flag: '🇬🇧' },
                  { val: 'hindi',   label: 'हिंदी',   sub: 'Part E', flag: '🇮🇳' },
                ].map(opt => (
                  <button key={opt.val}
                    onClick={() => setOptionalSubject(opt.val)}
                    style={{ padding: '14px', borderRadius: '10px', border: '2px solid', borderColor: optionalSubject === opt.val ? 'var(--accent)' : 'var(--border)', background: optionalSubject === opt.val ? 'rgba(249,115,22,.1)' : 'var(--surface)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}
                  >
                    <div style={{ fontSize: '22px', marginBottom: '4px' }}>{opt.flag}</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: optionalSubject === opt.val ? 'var(--accent)' : 'var(--text)' }}>{opt.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{opt.sub}</div>
                    {optionalSubject === opt.val && <div style={{ marginTop: '5px', fontSize: '11px', color: 'var(--accent)', fontWeight: '700' }}>✓ Selected</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Instructions</div>
            {[
              `${allQs.length} questions · ${mins} minutes`,
              'Each correct answer = 2 marks. Wrong answer = -0.50 marks.',
              'Navigate freely between all sections and questions.',
              'Use question palette to jump to any question.',
              'Bookmark questions to review later.',
              'Timer auto-submits when time ends.',
              hasOptional ? `Optional: ${optionalSubject === 'hindi' ? 'Hindi (Part E) selected' : 'English (Part D) selected'}` : null,
            ].filter(Boolean).map((rule, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '7px', fontSize: '13px', lineHeight: '1.5', color: 'var(--muted2)' }}>
                <span style={{ color: 'var(--accent)', fontWeight: '700', flexShrink: 0 }}>{i + 1}.</span>
                {rule}
              </div>
            ))}
          </div>

          <button className="btn btn-primary" style={{ width: '100%', padding: '15px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', justifyContent: 'center' }} onClick={startTest}>
            Start Exam →
          </button>
          <button className="btn btn-ghost" style={{ width: '100%', marginTop: '10px', justifyContent: 'center' }} onClick={() => setActiveView('papers')}>
            ← Back
          </button>
        </div>
      </div>
    )
  }

  // ── TEST SCREEN — SSC Real Exam Style ────────────────────────
  if (activeView === 'test' && activeShift) {
    const sections    = getSections(testQuestions)
    const hasSections = sections.length > 1
    const q           = testQuestions[currentQ]
    if (!q) return null

    const answered   = Object.keys(answers).length
    const timerColor = timeLeft < 300 ? '#dc2626' : timeLeft < 600 ? '#d97706' : '#16a34a'
    const timerBg    = timeLeft < 300 ? '#fef2f2'  : timeLeft < 600 ? '#fffbeb'  : '#f0fdf4'

    const goToQ = (idx) => {
  setCurrentQ(idx)
  const q = testQuestions[idx]
  if (hasSections && q) {
    const sec = q.section || topicToSection(q.topic)
    if (sec) setActiveSection(sec)
  }
}

    // Section stats for palette footer
    const sectionStats = sections.map(sec => {
      const qs        = getSectionQs(testQuestions, sec)
      const answered  = qs.filter(q => answers[testQuestions.indexOf(q)] !== undefined).length
      const notAnsw   = qs.length - answered
      return { sec, answered, notAnsw, total: qs.length }
    })

    // Which section is active in palette (for mobile — show/hide)
    const activePalSection = q.section || sections[0]

    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: '#f1f5f9',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>

        {/* ── TOP HEADER BAR — like SSC portal ── */}
        <div style={{
          flexShrink: 0,
          background: '#1e3a5f',
          color: 'white',
          padding: '0 16px',
          height: '56px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
        }}>
          {/* Left: exam name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
              📋
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeShift.exam} — Online Exam
              </div>
              <div style={{ fontSize: '10px', color: '#93c5fd', whiteSpace: 'nowrap' }}>
                {activeShift.shift} · {activeShift.date}
              </div>
            </div>
          </div>

          {/* Center: timer — big like real SSC */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: timerBg, borderRadius: '8px', padding: '4px 14px', flexShrink: 0,
          }}>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time Left</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: timerColor, fontVariantNumeric: 'tabular-nums', letterSpacing: '2px', lineHeight: 1.1 }}>
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Right: submit */}
          <button
            onClick={() => { if (window.confirm(`Submit exam?\n${testQuestions.length - answered} questions unattempted.`)) submitTest() }}
            style={{ padding: '8px 16px', borderRadius: '6px', background: '#ef4444', border: 'none', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer', flexShrink: 0 }}
          >
            Submit
          </button>
        </div>

        {/* ── SECTION TABS — exactly like SSC portal ── */}
        {hasSections && (
          <div style={{
            flexShrink: 0,
            background: '#e2e8f0',
            borderBottom: '2px solid #cbd5e1',
            display: 'flex', alignItems: 'stretch',
            overflowX: 'auto', overflowY: 'hidden',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}>
            {sections.map(sec => {
              const isActive = activeSection === sec
              const secQs    = getSectionQs(testQuestions, sec)
              const secDone  = secQs.filter(q => answers[testQuestions.indexOf(q)] !== undefined).length
              return (
                <button key={sec}
                  style={{
                    flexShrink: 0, padding: '10px 18px',
                    background: isActive ? '#1e3a5f' : 'transparent',
                    border: 'none',
                    color: isActive ? 'white' : '#475569',
                    fontSize: '13px', fontWeight: '700',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    borderRight: '1px solid #cbd5e1',
                    transition: 'all 0.15s',
                  }}
                  onClick={() => {
  setActiveSection(sec)
  const secQs = getSectionQs(testQuestions, sec)
  
  // find last answered question in this section
  let lastAnswered = -1
  secQs.forEach(q => {
    const gi = testQuestions.indexOf(q)
    if (answers[gi] !== undefined) lastAnswered = gi
  })

  if (lastAnswered !== -1) {
    // go to question after last answered (next unanswered)
    const nextUnanswered = testQuestions.findIndex((q, i) =>
      i > lastAnswered && (q.section || topicToSection(q.topic)) === sec && answers[i] === undefined
    )
    setCurrentQ(nextUnanswered !== -1 ? nextUnanswered : lastAnswered)
  } else {
    // no answers yet — go to first question of section
    const first = testQuestions.findIndex(q => (q.section || topicToSection(q.topic)) === sec)
    if (first !== -1) setCurrentQ(first)
  }
}}
                >
                  {sec}
                  <span style={{ marginLeft: '6px', fontSize: '10px', opacity: 0.7 }}>({secDone}/{secQs.length})</span>
                </button>
              )
            })}
            {/* Question number info on right */}
            <div style={{ marginLeft: 'auto', padding: '10px 16px', fontSize: '12px', color: '#475569', fontWeight: '600', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Question : {currentQ + 1}</span>
              <span style={{ color: '#94a3b8' }}>|</span>
              <span style={{ color: '#16a34a' }}>Answered: {answered}</span>
              <span style={{ color: '#94a3b8' }}>|</span>
              <span style={{ color: '#dc2626' }}>Not Answered: {testQuestions.length - answered}</span>
            </div>
          </div>
        )}

        {/* ── MAIN BODY: PALETTE LEFT + QUESTION RIGHT ── */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

          {/* ── LEFT PALETTE — always visible on desktop, toggle on mobile ── */}
          <div style={{
            width: '220px',
            flexShrink: 0,
            background: 'white',
            borderRight: '1px solid #e2e8f0',
            overflowY: 'auto',
            display: 'flex', flexDirection: 'column',
            // Hide on very small screens — show on md+
            // We'll use a simple approach: hidden under 640px via inline media
          }}
          className="exam-palette"
          >
            {/* Legend */}
            <div style={{ padding: '10px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Symbols
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {[
                  { bg: '#22c55e', border: '#16a34a', label: 'Answered' },
                  { bg: '#f97316', border: '#ea580c', label: 'Current' },
                  { bg: '#8b5cf6', border: '#7c3aed', label: 'Marked for Review' },
                  { bg: '#f1f5f9', border: '#cbd5e1', label: 'Not Answered', text: '#475569' },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11px', color: '#475569' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '4px', background: l.bg, border: `1px solid ${l.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '9px', fontWeight: '700', color: l.text || 'white' }}>1</span>
                    </div>
                    {l.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Section-wise question numbers */}
            {sections.map(sec => {
              const secQs  = getSectionQs(testQuestions, sec)
              const stats  = sectionStats.find(s => s.sec === sec)
              return (
                <div key={sec} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  {/* Section header */}
                  <div style={{
                    padding: '8px 12px',
                    background: '#1e3a5f',
                    color: 'white',
                    fontSize: '11px', fontWeight: '700',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span>{sec}</span>
                    <span style={{ fontSize: '10px', opacity: 0.8 }}>{stats?.answered}/{stats?.total}</span>
                  </div>

                  {/* Question number grid */}
                  <div style={{ padding: '8px 10px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                    {secQs.map(sq => {
                      const gi      = testQuestions.indexOf(sq)
                      const isDone  = answers[gi] !== undefined
                      const isMark  = marked[gi]
                      const isCurr  = gi === currentQ

                      // local display number within section
                      const localNum = secQs.indexOf(sq) + 1

                      let bg     = '#f1f5f9'
                      let border = '#cbd5e1'
                      let color  = '#475569'

                      if (isCurr)       { bg = '#f97316'; border = '#ea580c'; color = 'white' }
                      else if (isMark)  { bg = '#8b5cf6'; border = '#7c3aed'; color = 'white' }
                      else if (isDone)  { bg = '#22c55e'; border = '#16a34a'; color = 'white' }

                      return (
                        <button key={gi}
                          onClick={() => goToQ(gi)}
                          style={{
                            width: '100%', aspectRatio: '1',
                            borderRadius: '4px',
                            border: `1.5px solid ${border}`,
                            background: bg, color,
                            fontSize: '11px', fontWeight: '700',
                            cursor: 'pointer', padding: 0,
                            transition: 'all 0.1s',
                          }}
                        >
                          {localNum}
                        </button>
                      )
                    })}
                  </div>

                  {/* Section mini stats */}
                  <div style={{ padding: '4px 12px 8px', display: 'flex', gap: '10px', fontSize: '10px' }}>
                    <span style={{ color: '#16a34a', fontWeight: '600' }}>✓ {stats?.answered} Answered</span>
                    <span style={{ color: '#dc2626', fontWeight: '600' }}>✗ {stats?.notAnsw} Remaining</span>
                  </div>
                </div>
              )
            })}

            {/* No sections fallback */}
            {!hasSections && (
              <div style={{ padding: '8px 10px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                {testQuestions.map((sq, gi) => {
                  const isDone = answers[gi] !== undefined, isMark = marked[gi], isCurr = gi === currentQ
                  let bg = '#f1f5f9', border = '#cbd5e1', color = '#475569'
                  if (isCurr)      { bg = '#f97316'; border = '#ea580c'; color = 'white' }
                  else if (isMark) { bg = '#8b5cf6'; border = '#7c3aed'; color = 'white' }
                  else if (isDone) { bg = '#22c55e'; border = '#16a34a'; color = 'white' }
                  return (
                    <button key={gi} onClick={() => goToQ(gi)}
                      style={{ width: '100%', aspectRatio: '1', borderRadius: '4px', border: `1.5px solid ${border}`, background: bg, color, fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0 }}>
                      {gi + 1}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── RIGHT: QUESTION AREA ── */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', WebkitOverflowScrolling: 'touch' }}>

            {/* Question header bar */}
            <div style={{ flexShrink: 0, background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                  Question : {currentQ + 1}
                </span>
                {q.section && (
                  <span style={{ fontSize: '11px', padding: '2px 8px', background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '4px', color: '#1d4ed8', fontWeight: '600' }}>
                    {q.section}
                  </span>
                )}
                {q.topic && (
                  <span style={{ fontSize: '11px', color: '#64748b', padding: '2px 8px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                    {q.topic}
                  </span>
                )}
                {marked[currentQ] && (
                  <span style={{ fontSize: '11px', padding: '2px 8px', background: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: '4px', color: '#7c3aed', fontWeight: '600' }}>
                    🔖 Marked for Review
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setMarked(prev => ({ ...prev, [currentQ]: !prev[currentQ] }))}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: `1px solid ${marked[currentQ] ? '#7c3aed' : '#cbd5e1'}`, background: marked[currentQ] ? '#ede9fe' : 'white', color: marked[currentQ] ? '#7c3aed' : '#475569', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {marked[currentQ] ? '🔖 Marked' : '🔖 Mark for Review'}
                </button>
              </div>
            </div>

            {/* Question content — scrollable */}
            <div style={{ flex: 1, padding: '20px 20px 100px', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>

              {/* Question text */}
              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px 20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
                <p style={{ fontSize: '15px', lineHeight: '1.8', fontWeight: '500', margin: 0, color: '#1e293b', wordBreak: 'break-word' }}>
                  {q.question}
                </p>
              </div>

              {/* Options — radio style like real SSC */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {q.options?.map((opt, oi) => {
                  const isSel = answers[currentQ] === oi
                  return (
                    <div key={oi}
                      onClick={() => setAnswers(prev => ({ ...prev, [currentQ]: oi }))}
                      style={{
                        display: 'flex', gap: '12px', alignItems: 'flex-start',
                        padding: '12px 16px', borderRadius: '8px',
                        border: `1.5px solid ${isSel ? '#1d4ed8' : '#e2e8f0'}`,
                        background: isSel ? '#eff6ff' : 'white',
                        cursor: 'pointer', transition: 'all 0.12s',
                        userSelect: 'none',
                        boxShadow: isSel ? '0 0 0 3px rgba(29,78,216,.1)' : '0 1px 2px rgba(0,0,0,.04)',
                      }}
                    >
                      {/* Radio circle */}
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, marginTop: '1px',
                        border: `2px solid ${isSel ? '#1d4ed8' : '#94a3b8'}`,
                        background: isSel ? '#1d4ed8' : 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.12s',
                      }}>
                        {isSel && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                      </div>
                      <span style={{ fontSize: '14px', lineHeight: '1.6', color: isSel ? '#1d4ed8' : '#334155', fontWeight: isSel ? '600' : '400' }}>
                        {opt}
                      </span>
                    </div>
                  )
                })}
              </div>

            </div>
          </div>
        </div>

        {/* ── BOTTOM NAV — Save & Next style ── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'white', borderTop: '2px solid #e2e8f0',
          padding: '10px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px',
          zIndex: 10,
        }}>
          <button
            disabled={currentQ === 0}
            onClick={() => goToQ(currentQ - 1)}
            style={{ padding: '9px 18px', borderRadius: '6px', border: '1px solid #cbd5e1', background: currentQ === 0 ? '#f1f5f9' : 'white', color: currentQ === 0 ? '#94a3b8' : '#475569', fontSize: '13px', fontWeight: '600', cursor: currentQ === 0 ? 'not-allowed' : 'pointer' }}
          >
            ← Previous
          </button>

          {/* Mobile palette toggle */}
          <button
            onClick={() => setShowPalette(p => !p)}
            style={{ padding: '9px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            className="palette-toggle-mobile"
          >
            🔢 Palette
          </button>

          {currentQ === testQuestions.length - 1 ? (
            <button
              onClick={() => { if (window.confirm(`Submit exam?\n${testQuestions.length - answered} unattempted.`)) submitTest() }}
              style={{ padding: '9px 18px', borderRadius: '6px', background: '#ef4444', border: 'none', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
            >
              Submit ✓
            </button>
          ) : (
            <button
              onClick={() => goToQ(currentQ + 1)}
              style={{ padding: '9px 18px', borderRadius: '6px', background: '#1e3a5f', border: 'none', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
            >
              Save & Next →
            </button>
          )}
        </div>

        {/* Mobile palette overlay */}
        {showPalette && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex' }} onClick={() => setShowPalette(false)}>
            <div style={{ width: '260px', maxWidth: '80vw', background: 'white', overflowY: 'auto', boxShadow: '4px 0 20px rgba(0,0,0,.15)' }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '12px 16px', background: '#1e3a5f', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '700' }}>Question Palette</span>
                <button onClick={() => setShowPalette(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}>×</button>
              </div>
              {sections.length === 0 && (
  <div style={{ padding: '8px 12px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
    {testQuestions.map((sq, gi) => {
      const isDone = answers[gi] !== undefined, isMark = marked[gi], isCurr = gi === currentQ
      let bg = '#f1f5f9', border = '#cbd5e1', color = '#475569'
      if (isCurr)      { bg = '#f97316'; border = '#ea580c'; color = 'white' }
      else if (isMark) { bg = '#8b5cf6'; border = '#7c3aed'; color = 'white' }
      else if (isDone) { bg = '#22c55e'; border = '#16a34a'; color = 'white' }
      return (
        <button key={gi} onClick={() => { goToQ(gi); setShowPalette(false) }}
          style={{ width: '100%', aspectRatio: '1', borderRadius: '4px', border: `1.5px solid ${border}`, background: bg, color, fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0 }}>
          {gi + 1}
        </button>
      )
    })}
  </div>
)}
              {sections.map(sec => {
                const secQs = getSectionQs(testQuestions, sec)
                const stats = sectionStats.find(s => s.sec === sec)
                return (
                  <div key={sec} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ padding: '8px 14px', background: '#1e3a5f', color: 'white', fontSize: '12px', fontWeight: '700', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{SECTION_NAMES[sec] || sec}</span>
                      <span style={{ opacity: 0.8 }}>{stats?.answered}/{stats?.total}</span>
                    </div>
                    <div style={{ padding: '8px 12px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
                      {secQs.map(sq => {
                        const gi = testQuestions.indexOf(sq)
                        const isDone = answers[gi] !== undefined, isMark = marked[gi], isCurr = gi === currentQ
                        const localNum = secQs.indexOf(sq) + 1
                        let bg = '#f1f5f9', border = '#cbd5e1', color = '#475569'
                        if (isCurr)      { bg = '#f97316'; border = '#ea580c'; color = 'white' }
                        else if (isMark) { bg = '#8b5cf6'; border = '#7c3aed'; color = 'white' }
                        else if (isDone) { bg = '#22c55e'; border = '#16a34a'; color = 'white' }
                        return (
                          <button key={gi} onClick={() => { goToQ(gi); setShowPalette(false) }}
                            style={{ width: '100%', aspectRatio: '1', borderRadius: '4px', border: `1.5px solid ${border}`, background: bg, color, fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0 }}>
                            {localNum}
                          </button>
                        )
                      })}
                    </div>
                    <div style={{ padding: '4px 14px 8px', display: 'flex', gap: '12px', fontSize: '10px' }}>
                      <span style={{ color: '#16a34a', fontWeight: '600' }}>✓ {stats?.answered}</span>
                      <span style={{ color: '#dc2626', fontWeight: '600' }}>✗ {stats?.notAnsw}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    )
  }

  // ── RESULT SCREEN ──────────────────────────────────────────────
  if (activeView === 'result' && activeShift) {
    const score         = calcScore()
    const sectionScores = calcSectionScores()

    return (
      <div className="page" style={{ maxWidth: '700px' }}>
        <div style={{ textAlign: 'center', padding: '28px 20px', background: 'var(--surface)', border: `2px solid ${score.percent >= 70 ? 'var(--green)' : score.percent >= 50 ? '#f59e0b' : 'var(--red)'}`, borderRadius: '16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>{score.percent >= 70 ? '🎉' : score.percent >= 50 ? '👍' : '💪'}</div>
          <div style={{ fontSize: '44px', fontWeight: '800', color: score.percent >= 70 ? 'var(--green)' : score.percent >= 50 ? '#f59e0b' : 'var(--red)', marginBottom: '6px', lineHeight: 1 }}>
            {score.percent}%
          </div>
          <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>{activeShift.exam} · {activeShift.shift}</p>
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>{activeShift.date}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Correct', value: score.correct, color: 'var(--green)' },
            { label: 'Wrong',   value: score.wrong,   color: 'var(--red)'   },
            { label: 'Skipped', value: score.skipped, color: 'var(--muted)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '26px', fontWeight: '800', color: s.color, marginBottom: '2px' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {sectionScores.length > 1 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px', marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>Section-wise Score</div>
            {sectionScores.map(s => (
              <div key={s.section} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{s.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: '8px' }}>{s.attempted}/{s.total} attempted</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: s.percent >= 70 ? 'var(--green)' : s.percent >= 40 ? '#f59e0b' : 'var(--red)' }}>
                    {s.correct}/{s.total}
                  </span>
                </div>
                <div style={{ height: '6px', background: 'var(--surface2)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '3px', width: `${s.percent}%`, background: s.percent >= 70 ? 'var(--green)' : s.percent >= 40 ? '#f59e0b' : 'var(--red)', transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', minWidth: '120px' }} onClick={() => openInstructions(activeShift)}>Retry →</button>
          <button className="btn btn-ghost"   style={{ flex: 1, justifyContent: 'center', minWidth: '120px' }} onClick={() => setActiveView('analysis')}>Analysis 📊</button>
          <button className="btn btn-ghost"   style={{ flex: 1, justifyContent: 'center', minWidth: '120px' }} onClick={() => { setActiveView('papers'); setActiveShift(null) }}>← Papers</button>
        </div>

        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Answer Review</div>
        {testQuestions.map((q, i) => {
          const status = answers[i] === q.correct ? 'correct' : answers[i] !== undefined ? 'wrong' : 'skipped'
          return (
            <div key={i} style={{ background: 'var(--surface)', border: `1px solid ${status === 'correct' ? 'var(--green)' : status === 'wrong' ? 'var(--red)' : 'var(--border)'}`, borderRadius: '12px', padding: '14px 16px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', background: status === 'correct' ? 'rgba(34,197,94,.1)' : status === 'wrong' ? 'rgba(239,68,68,.1)' : 'var(--surface2)', color: status === 'correct' ? 'var(--green)' : status === 'wrong' ? 'var(--red)' : 'var(--muted)', padding: '2px 7px', borderRadius: '4px' }}>
                  Q{i + 1} {status === 'correct' ? '✓' : status === 'wrong' ? '✗' : '—'}
                </span>
                {q.section && <span style={{ fontSize: '10px', color: 'var(--muted)', background: 'var(--surface2)', padding: '1px 6px', borderRadius: '3px', border: '1px solid var(--border)' }}>{q.section}</span>}
                {q.topic   && <span style={{ fontSize: '10px', color: 'var(--muted2)' }}>{q.topic}</span>}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '10px', lineHeight: '1.5' }}>{q.question}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                {q.options?.map((opt, oi) => (
                  <div key={oi} style={{ padding: '6px 9px', borderRadius: '6px', fontSize: '11px', background: oi === q.correct ? 'rgba(34,197,94,.08)' : oi === answers[i] && oi !== q.correct ? 'rgba(239,68,68,.08)' : 'var(--surface2)', border: `1px solid ${oi === q.correct ? 'var(--green)' : oi === answers[i] && oi !== q.correct ? 'var(--red)' : 'var(--border)'}`, color: oi === q.correct ? 'var(--green)' : oi === answers[i] && oi !== q.correct ? 'var(--red)' : 'var(--muted2)', display: 'flex', gap: '5px' }}>
                    <span style={{ fontWeight: '700', flexShrink: 0 }}>{['A','B','C','D'][oi]}.</span>
                    {opt}
                  </div>
                ))}
              </div>
              {q.explanation && (
                <div style={{ marginTop: '8px', padding: '7px 10px', background: 'rgba(34,197,94,.05)', border: '1px solid rgba(34,197,94,.15)', borderRadius: '7px', fontSize: '11px', color: 'var(--text)', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                  📖 {q.explanation}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // ── ANALYSIS VIEW ──────────────────────────────────────────────
  if (activeView === 'analysis' && activeShift) {
    const analysis = activeShift.analysis
    if (!analysis) return (
      <div className="page" style={{ maxWidth: '680px' }}>
        <button className="btn btn-ghost" style={{ marginBottom: '16px' }} onClick={() => setActiveView('papers')}>← Back</button>
        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
          <p style={{ color: 'var(--muted)' }}>No analysis available for this shift paper.</p>
          <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '6px' }}>Ask admin to run analysis from Admin Panel.</p>
        </div>
      </div>
    )

    const maxCount = Math.max(...(analysis.sortedTopics || []).map(t => t.count), 1)

    return (
      <div className="page" style={{ maxWidth: '760px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <button className="btn btn-ghost" onClick={() => setActiveView('papers')}>← Back</button>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '18px', fontWeight: '700' }}>{activeShift.exam} — {activeShift.shift}</h1>
            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{activeShift.date} · {activeShift.totalQuestions} questions</p>
          </div>
          <button className="btn btn-primary" style={{ fontSize: '13px' }} onClick={() => openInstructions(activeShift)}>Practice →</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Total Qs',      value: analysis.totalAnalyzed,              color: 'var(--accent)' },
            { label: 'Avg Difficulty',value: `${analysis.avgDifficulty}/10`,       color: diffColor(analysis.avgDifficulty) },
            { label: 'Easy',          value: analysis.difficultyBreakdown?.easy   || 0, color: 'var(--green)' },
            { label: 'Medium',        value: analysis.difficultyBreakdown?.medium || 0, color: '#f59e0b' },
            { label: 'Hard',          value: analysis.difficultyBreakdown?.hard   || 0, color: 'var(--red)' },
          ].map(card => (
            <div key={card.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: card.color, marginBottom: '4px' }}>{card.value}</div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>📊 Topic Breakdown</h2>
          {analysis.sortedTopics?.map(t => (
            <div key={t.topic} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>{t.topic}</span>
                <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '700' }}>{t.count}Q ({t.percent}%)</span>
              </div>
              <div style={{ height: '6px', background: 'var(--surface2)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '3px', width: `${(t.count / maxCount) * 100}%`, background: 'linear-gradient(90deg, var(--accent), #f97316)', transition: 'width 0.5s ease' }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>🎯 Difficulty Distribution</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[
              { label: 'Easy',   count: analysis.difficultyBreakdown?.easy   || 0, color: 'var(--green)' },
              { label: 'Medium', count: analysis.difficultyBreakdown?.medium || 0, color: '#f59e0b'      },
              { label: 'Hard',   count: analysis.difficultyBreakdown?.hard   || 0, color: 'var(--red)'   },
            ].map(d => (
              <div key={d.label} style={{ textAlign: 'center', padding: '14px', background: 'var(--surface2)', borderRadius: '10px', border: `1px solid ${d.color}30` }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: d.color, marginBottom: '4px' }}>{d.count}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{d.label}</div>
                <div style={{ fontSize: '11px', color: d.color, fontWeight: '600', marginTop: '2px' }}>
                  {analysis.totalAnalyzed ? Math.round((d.count / analysis.totalAnalyzed) * 100) : 0}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {analysis.keyTopics?.length > 0 && (
          <div style={{ background: 'rgba(249,115,22,.04)', border: '1px solid rgba(249,115,22,.15)', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>🎯 Key Insights</h2>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.6', marginBottom: '10px' }}>
              This shift focused on <strong>{analysis.keyTopics.join(', ')}</strong>. Overall difficulty: <strong style={{ color: diffColor(analysis.avgDifficulty) }}>{diffLabel(analysis.avgDifficulty)}</strong> ({analysis.avgDifficulty}/10).
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {analysis.keyTopics.map(t => (
                <span key={t} style={{ fontSize: '11px', padding: '3px 10px', background: 'rgba(249,115,22,.1)', border: '1px solid rgba(249,115,22,.25)', borderRadius: '5px', color: 'var(--accent)', fontWeight: '600' }}>{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── PAPERS LIST ────────────────────────────────────────────────
  return (
    <div className="page">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '4px' }}>📋 Shift Papers</h1>
        <p style={{ fontSize: '14px', color: 'var(--muted2)' }}>Real previous year papers — section-wise, timed practice</p>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Select Exam</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {EXAMS.map(e => (
            <button key={e}
              style={{ padding: '5px 12px', borderRadius: '7px', border: '1px solid', borderColor: activeExam === e ? 'var(--accent)' : 'var(--border)', background: activeExam === e ? 'rgba(249,115,22,.1)' : 'var(--surface2)', color: activeExam === e ? 'var(--accent)' : 'var(--muted2)', cursor: 'pointer', fontSize: '12px', fontWeight: activeExam === e ? '700' : '400', transition: 'all 0.15s' }}
              onClick={() => setActiveExam(e)}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {years.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)', marginRight: '4px' }}>Year:</span>
          {['all', ...years.map(String)].map(y => (
            <button key={y}
              style={{ padding: '4px 12px', borderRadius: '6px', border: '1px solid', borderColor: filterYear === y ? 'var(--accent)' : 'var(--border)', background: filterYear === y ? 'rgba(249,115,22,.1)' : 'transparent', color: filterYear === y ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
              onClick={() => setFilterYear(y)}>
              {y === 'all' ? 'All' : y}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--muted)' }}>Loading shift papers...</p>
        </div>
      ) : filteredShifts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No Shift Papers Yet</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6' }}>Shift papers for {activeExam} will be available soon.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {filteredShifts.map(s => (
            <div key={s.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', lineHeight: '1.3' }}>{s.shift}</div>
                  {s.analysis && (
                    <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '5px', flexShrink: 0, background: s.analysis.avgDifficulty <= 3 ? 'rgba(34,197,94,.1)' : s.analysis.avgDifficulty <= 7 ? 'rgba(245,158,11,.1)' : 'rgba(239,68,68,.1)', color: diffColor(s.analysis.avgDifficulty), border: `1px solid ${diffColor(s.analysis.avgDifficulty)}30` }}>
                      {diffLabel(s.analysis.avgDifficulty)}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <span>📅 {s.date}</span>
                  <span>📝 {s.totalQuestions}Q</span>
                  <span>📆 {s.year}</span>
                  {OPTIONAL_SUBJECT_EXAMS.includes(s.exam) && <span style={{ color: '#8b5cf6', fontWeight: '600' }}>EN/HI</span>}
                </div>
              </div>

              {s.analysis?.keyTopics?.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {s.analysis.keyTopics.map(t => (
                    <span key={t} style={{ fontSize: '10px', padding: '2px 7px', background: 'rgba(249,115,22,.06)', border: '1px solid rgba(249,115,22,.15)', borderRadius: '4px', color: 'var(--accent)' }}>{t}</span>
                  ))}
                </div>
              )}

              {!s.analysis && (
                <div style={{ fontSize: '11px', color: 'var(--muted)', padding: '5px 8px', background: 'var(--surface2)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  📊 Analysis not available yet
                </div>
              )}

              <div style={{ display: 'flex', gap: '7px', marginTop: 'auto' }}>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: '12px', padding: '8px' }}
                  onClick={() => { setActiveShift(s); setActiveView('analysis') }}>
                  📊 Analysis
                </button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '12px', padding: '8px' }}
                  onClick={() => openInstructions(s)}>
                  ✏️ Practice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}