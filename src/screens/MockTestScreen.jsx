// ─────────────────────────────────────────────
// MockTestScreen.jsx  — UI v8 (ExamNova Pro — Testbook/Adda247 style)
// All logic 100% identical to v7; only JSX/styling changed
// ─────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { generateCurrentAffairsQuestions } from '../services/aiService'
import { saveTestResult, saveMockResult, getMockHistory, getMockResultWithQuestions } from '../services/storageService'
import { getAvailableMockPapers, getMockPaperById, incrementAttemptCount, cacheCASectionInPaper, generateRandomMixPaper, checkAndGenerateMockPaper } from '../services/MockPaperService.js'
import { addMockPoints }    from '../services/leaderboardService'
import MOCK_CONFIG          from '../data/mockConfig'
import CUTOFFS              from '../data/cutoffs'
import ReportButton         from '../components/ReportButton'
import PointsReveal         from '../components/PointsReveal'
import ScoreCard            from '../components/ScoreCard'

const HINDI_OPTIONAL_EXAMS = [
  'SSC GD', 'SSC MTS', 'SSC CHSL',
  'RRB NTPC', 'RRB Group D', 'RRB ALP', 'State PSC'
]

// ── Inject CSS ──
function injectCSS() {
  if (document.getElementById('mock-palette-css')) return
  const style = document.createElement('style')
  style.id = 'mock-palette-css'
  style.textContent = `
    .mock-exam-palette { display: flex !important; flex-direction: column; }
    .mock-palette-mobile-btn { display: none !important; }
    @media (max-width: 640px) {
      .mock-exam-palette { display: none !important; }
      .mock-palette-mobile-btn { display: flex !important; }
    }

    .mock-paper-card {
      transition: transform 0.18s ease, box-shadow 0.18s ease !important;
      cursor: pointer;
    }
    .mock-paper-card:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 24px rgba(0,0,0,.18) !important;
    }
    .mock-paper-card:active { transform: scale(0.99) !important; }

    .mock-option { transition: all 0.12s ease !important; }
    .mock-option:active { transform: scale(0.99) !important; }

    .mock-pal-btn { transition: transform 0.1s ease !important; }
    .mock-pal-btn:hover { transform: scale(1.12) !important; }
    .mock-pal-btn:active { transform: scale(0.9) !important; }

    .mock-section-tab { position: relative; transition: all 0.15s ease !important; }
    .mock-section-tab.active::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 3px;
      background: var(--accent);
      border-radius: 3px 3px 0 0;
    }

    @keyframes scoreIn {
      from { transform: scale(0.75); opacity: 0; }
      to   { transform: scale(1);   opacity: 1; }
    }
    .score-ring { animation: scoreIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .slide-up   { animation: slideUp 0.32s ease both; }
    .slide-up-1 { animation: slideUp 0.32s 0.06s ease both; }
    .slide-up-2 { animation: slideUp 0.32s 0.12s ease both; }
    .slide-up-3 { animation: slideUp 0.32s 0.18s ease both; }
    .slide-up-4 { animation: slideUp 0.32s 0.24s ease both; }

    @keyframes fillBar {
      from { width: 0%; }
    }
    .fill-bar { animation: fillBar 0.7s 0.3s ease both; }

    @keyframes timerPulse {
      0%,100% { opacity: 1; }
      50% { opacity: 0.55; }
    }
    .timer-pulse { animation: timerPulse 0.9s ease infinite; }

    .no-scroll::-webkit-scrollbar { display: none; }
    .no-scroll { scrollbar-width: none; }

    @keyframes shimmer {
      from { background-position: -400px 0; }
      to   { background-position: 400px 0; }
    }
    .mock-tricolor {
      height: 3px;
      background: linear-gradient(90deg, #FF9933 33%, #ffffff 33%, #ffffff 66%, #138808 66%);
      border-radius: 2px;
    }
  `
  document.head.appendChild(style)
}

function MockRetryButton({ onRetry }) {
  const [retrying, setRetrying] = useState(false)
  return (
    <div style={{ textAlign: 'center' }}>
      {retrying ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
          <div className="spinner" style={{ width: 20, height: 20 }} />
          <span style={{ color: 'var(--muted2)', fontSize: 14 }}>Trying...</span>
        </div>
      ) : (
        <button className="btn btn-primary" onClick={() => { setRetrying(true); onRetry() }}>Try Again</button>
      )}
    </div>
  )
}

export default function MockTestScreen({ user, navigate, selectedExam, onLogout, language, onLanguageChange }) {

  const config = MOCK_CONFIG[selectedExam]

  // ── Core state ──
  const [phase,            setPhase]            = useState('intro')
  const [error,            setError]            = useState('')

  // ── Mock paper state ──
  const [mockLevel,        setMockLevel]        = useState('same')
  const [mockLanguage,     setMockLanguage]     = useState('english')
  const [mockPapers,       setMockPapers]       = useState([])
  const [papersLoaded,     setPapersLoaded]     = useState(false)
  const [selectedPaper,    setSelectedPaper]    = useState(null)
  const [paperForReview,   setPaperForReview]   = useState(null)
  const [paperLoading,     setPaperLoading]     = useState(false)

  // ── Config modal ──
  const [showMockConfig,   setShowMockConfig]   = useState(false)
  const [pendingPaper,     setPendingPaper]     = useState(null)
  const [category,         setCategory]         = useState('General')
  const [optionalSubject,  setOptionalSubject]  = useState('hindi')

  // ── TEST state ──
  const [testQuestions,    setTestQuestions]    = useState([])
  const [loadingMsg,       setLoadingMsg]       = useState('')
  const [answers,          setAnswers]          = useState({})
  const [marked,           setMarked]           = useState({})
  const [currentQ,         setCurrentQ]         = useState(0)
  const [activeSection,    setActiveSection]    = useState(null)
  const [showPalette,      setShowPalette]      = useState(false)
  const [timeLeft,         setTimeLeft]         = useState(0)
  const [submitted,        setSubmitted]        = useState(false)
  const [showSubmitModal,  setShowSubmitModal]  = useState(false)
  const [pointsResult,     setPointsResult]     = useState(null)

  // ── History state ──
  const [mockHistory,      setMockHistory]      = useState([])
  const [historyLoaded,    setHistoryLoaded]    = useState(false)
  const [activeHistTest,   setActiveHistTest]   = useState(null)
  const [retryMode,        setRetryMode_h]      = useState(false)
  const [retryQ,           setRetryQ]           = useState(0)
  const [retryAnswers,     setRetryAnswers_h]   = useState({})
  const [retryRevealed,    setRetryRevealed_h]  = useState({})
  const [retryDone,        setRetryDone_h]      = useState(false)

  const timerRef  = useRef(null)
  const hasLoaded = useRef(false)

  useEffect(() => { injectCSS() }, [])

  // ── Load history ──
  useEffect(() => {
    if (selectedExam && !historyLoaded) {
      getMockHistory(selectedExam).then(h => {
        setMockHistory(h || [])
        setHistoryLoaded(true)
      }).catch(() => setHistoryLoaded(true))
    }
  }, [selectedExam])

  // ── Load mock papers + auto-check bank ──
  useEffect(() => {
    if (!selectedExam) return
    setPapersLoaded(false)
    setMockPapers([])
    getAvailableMockPapers(selectedExam, mockLevel, mockLanguage).then(async papers => {
      setMockPapers(papers)
      try {
        const newPaper = await checkAndGenerateMockPaper(selectedExam, mockLevel, mockLanguage)
        if (newPaper) {
          const updated = await getAvailableMockPapers(selectedExam, mockLevel, mockLanguage)
          setMockPapers(updated)
        }
      } catch(e) {}
      setPapersLoaded(true)
    }).catch(() => setPapersLoaded(true))
  }, [selectedExam, mockLevel, mockLanguage])

  // ── Load paper questions for history review ──
  useEffect(() => {
    if (!activeHistTest) { setPaperForReview(null); return }
    setPaperLoading(true)
    getMockResultWithQuestions(activeHistTest).then(full => {
      setPaperForReview(full)
      setPaperLoading(false)
    }).catch(() => { setPaperForReview(activeHistTest); setPaperLoading(false) })
  }, [activeHistTest])

  // ── Timer ──
  useEffect(() => {
    if (phase === 'test' && selectedPaper) {
      setTimeLeft(selectedPaper.duration * 60)
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0 }
          return t - 1
        })
      }, 1000)
      // Enter fullscreen when test begins
      const el = document.documentElement
      if (el.requestFullscreen)             el.requestFullscreen().catch(() => {})
      else if (el.webkitRequestFullscreen)  el.webkitRequestFullscreen()
    }
    return () => {
      clearInterval(timerRef.current)
      // Exit fullscreen when leaving test phase
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen)            document.exitFullscreen().catch(() => {})
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
      }
    }
  }, [phase])

  // ── Active sections ──
  const getActiveSections = () => {
    if (!config) return []
    return config.sections.filter(s => {
      if (!s.optional) return true
      if (s.questions === 0) return false
      return s.optional === optionalSubject
    })
  }

  // ── Start test ──
  const startMockTest = async (paperToUse) => {
    const paper = paperToUse || selectedPaper
    if (hasLoaded.current || !paper) return
    hasLoaded.current = true

    if (paperToUse) setSelectedPaper(paperToUse)

    try {
      setPhase('loading')
      setError('')

      const activeSections = getActiveSections()
      const flat = []

      for (let si = 0; si < activeSections.length; si++) {
        const section      = activeSections[si]
        const paperSection = paper.sections.find(s => s.topic === section.topic)
        if (!paperSection) continue

        let qs = paperSection.questions || []

        if (section.type === 'current_affairs') {
          if (qs.length === 0) {
            setLoadingMsg(`Generating ${section.name}...`)
            const currentYear = new Date().getFullYear()
            const yearString  = `${currentYear}_${currentYear + 1}`
            qs = await generateCurrentAffairsQuestions({
              exam: selectedExam, topic: section.topic,
              year: yearString, count: section.questions, language: mockLanguage,
            })
            const pIdx = paper.sections.findIndex(s => s.topic === section.topic)
            if (pIdx !== -1) cacheCASectionInPaper(paper.id, pIdx, qs).catch(() => {})
          } else {
            setLoadingMsg(`Loading ${section.name}...`)
          }
        } else {
          setLoadingMsg(`Loading ${section.name}...`)
        }

        qs.forEach(q => flat.push({ ...q, sectionName: section.name, sectionTopic: section.topic }))
      }

      if (flat.length === 0) throw new Error('No questions loaded')

      setTestQuestions(flat)
      setCurrentQ(0)
      setActiveSection(flat[0]?.sectionName || null)
      setAnswers({})
      setMarked({})
      setSubmitted(false)
      setPhase('test')
      incrementAttemptCount(paper.id).catch(() => {})

    } catch (e) {
      console.error('startMockTest error:', e)
      setError('RATE_LIMIT')
      setPhase('error')
      hasLoaded.current = false
    }
  }

  // ── Navigate to question ──
  const goToQ = (idx) => {
    setCurrentQ(idx)
    if (testQuestions[idx]) setActiveSection(testQuestions[idx].sectionName)
  }

  // ── Section names ──
  const sections = [...new Set(testQuestions.map(q => q.sectionName).filter(Boolean))]

  // ── Questions per section ──
  const getSectionQs = (sec) => testQuestions.filter(q => q.sectionName === sec)

  // ── Section stats ──
  const sectionStats = sections.map(sec => {
    const qs      = getSectionQs(sec)
    const ansCount = qs.filter((q, i) => answers[testQuestions.indexOf(q)] !== undefined).length
    return { sec, answered: ansCount, notAnsw: qs.length - ansCount, total: qs.length }
  })

  // ── Calculate score ──
  const calcScore = () => {
    let correct = 0, wrong = 0, skipped = 0, raw = 0
    testQuestions.forEach((q, gi) => {
      const answer = answers[gi]
      if (answer === undefined) skipped++
      else if (answer === q.correct) { correct++; raw += config.marking.correct }
      else { wrong++; raw += config.marking.wrong }
    })
    const maxRaw  = testQuestions.length * config.marking.correct
    const percent = maxRaw > 0 ? Math.round((Math.max(0, raw) / maxRaw) * 100) : 0
    return { correct, wrong, skipped, raw: Math.max(0, parseFloat(raw.toFixed(2))), maxRaw, percent }
  }

  const calcSectionScores = () => {
    return sections.map(sec => {
      const qs = getSectionQs(sec)
      let correct = 0, wrong = 0, skipped = 0, raw = 0
      qs.forEach(q => {
        const gi = testQuestions.indexOf(q)
        const answer = answers[gi]
        if (answer === undefined) skipped++
        else if (answer === q.correct) { correct++; raw += config.marking.correct }
        else { wrong++; raw += config.marking.wrong }
      })
      const maxRaw  = qs.length * config.marking.correct
      const percent = maxRaw > 0 ? Math.round((Math.max(0, raw) / maxRaw) * 100) : 0
      return { name: sec, correct, wrong, skipped, total: qs.length, raw: Math.max(0, parseFloat(raw.toFixed(2))), percent }
    })
  }

  // ── Submit ──
  const handleSubmit = async (autoSubmit = false) => {
    if (submitted) return
    clearInterval(timerRef.current)
    // Exit fullscreen on submit
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen)            document.exitFullscreen().catch(() => {})
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
    }
    setSubmitted(true)

    const score         = calcScore()
    const sectionScores = calcSectionScores()

    await saveMockResult({
      exam:        selectedExam,
      level:       mockLevel,
      language:    mockLanguage,
      category,
      mockPaperId: selectedPaper?.id,
      answers,
      score:       score.raw,
      maxScore:    score.maxRaw,
      percent:     score.percent,
      correct:     score.correct,
      wrong:       score.wrong,
      skipped:     score.skipped,
      timeTaken:   (selectedPaper?.duration || config.duration) * 60 - timeLeft,
      sections:    sectionScores,
    })

    await saveTestResult({
      exam: selectedExam, topic: 'Mock Test', subtopic: null, level: mockLevel,
      score: score.correct, total: testQuestions.length,
      timeTaken: (selectedPaper?.duration || config.duration) * 60 - timeLeft,
    })

    const pr = await addMockPoints({ exam: selectedExam, percent: score.percent, userName: user?.name || 'Student' })
    if (pr) setPointsResult(pr)

    try { const h = await getMockHistory(selectedExam); setMockHistory(h || []) } catch(e) {}
    setPhase('result')
  }

  // ── Helpers ──
  const formatTime  = (secs) => { const h = Math.floor(secs/3600); const m = Math.floor((secs%3600)/60).toString().padStart(2,'0'); const s = (secs%60).toString().padStart(2,'0'); return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}` }
  const scoreColor  = (p) => p >= 70 ? 'var(--green)' : p >= 50 ? 'var(--accent)' : 'var(--red)'
  const fmtDate     = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const fmtT        = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`
  const sColor      = (p) => p >= 70 ? 'var(--green)' : p >= 50 ? '#f59e0b' : 'var(--red)'
  const sBg         = (p) => p >= 70 ? 'rgba(34,197,94,.08)' : p >= 50 ? 'rgba(245,158,11,.08)' : 'rgba(239,68,68,.08)'

  const checkQualified = (test) => {
    const cd = CUTOFFS[selectedExam]
    if (!cd) return false
    const cutoff = cd.expectedCurrentYear?.cutoffs?.[test.category] || cd.previousYear?.cutoffs?.[test.category]
    return cutoff ? test.score >= cutoff : test.percent >= 70
  }

  const getSamePaperAttempts = (paperId) =>
    mockHistory.filter(h => h.mockPaperId === paperId).sort((a,b) => new Date(a.date) - new Date(b.date))

  const getMixPaperId = () =>
    `${selectedExam}__${mockLevel}__mix__${mockLanguage}`.replace(/\s+/g,'_').replace(/[^a-zA-Z0-9_]/g,'_')

  // UI label only changed — logic ID unchanged
  const paperLabel = (test) => test?.mockPaperId?.includes('__mix')
    ? '⚡ New Mock Test'
    : `Mock Paper #${test?.mockPaperId?.split('__').pop() || ''}`

  // ── RETRY MODE ──
  const getWrongQs = () => (paperForReview?.questions || []).filter(q => q.userAnswer !== q.correct && q.userAnswer !== null)

  // ─────────────────────────────────────────────
  // RETRY DONE
  // ─────────────────────────────────────────────
  if (retryMode && paperForReview) {
    const wrongQs  = getWrongQs()
    if (retryDone) {
      const correct = wrongQs.filter((q,i) => retryAnswers[i] === q.correct).length
      const pct = Math.round(correct / wrongQs.length * 100)
      return (
        <div className="page" style={{ maxWidth: 560, textAlign: 'center', padding: 'clamp(24px,5vw,48px) 20px' }}>
          <div style={{ fontSize: 64, marginBottom: 12, lineHeight: 1 }}>{pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, color: 'var(--text)' }}>Retry Complete!</h2>
          <div style={{ fontSize: 52, fontWeight: 900, color: sColor(pct), marginBottom: 6, lineHeight: 1 }}>{pct}%</div>
          <p style={{ color: 'var(--muted)', marginBottom: 32, fontSize: 14 }}>{correct}/{wrongQs.length} correct this time</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => { setRetryQ(0); setRetryAnswers_h({}); setRetryRevealed_h({}); setRetryDone_h(false) }}>Retry Again</button>
            <button className="btn btn-ghost" onClick={() => { setRetryMode_h(false); setRetryDone_h(false) }}>Back to Review</button>
          </div>
        </div>
      )
    }
    const q = wrongQs[retryQ]
    const answered = retryRevealed[retryQ]
    const userAns  = retryAnswers[retryQ]
    return (
      <div className="page" style={{ maxWidth: 760 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => setRetryMode_h(false)}>← Back to Review</button>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '6px 16px', fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>
            💪 Wrong Q · <span style={{ color: 'var(--accent)' }}>{retryQ + 1}</span>/{wrongQs.length}
          </div>
        </div>
        <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((retryQ + 1) / wrongQs.length) * 100}%`, background: 'linear-gradient(90deg, var(--accent), var(--blue))', borderRadius: 3, transition: 'width 0.3s ease' }} />
        </div>
        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 16, padding: '18px 20px', marginBottom: 14 }}>
          {q.sectionName && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 11, padding: '3px 10px', background: 'rgba(249,115,22,.12)', borderRadius: 6, color: 'var(--accent)', fontWeight: 700 }}>{q.sectionName}</span>
            </div>
          )}
          <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.75, color: 'var(--text)', margin: 0 }}>{q.question}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {q.options.map((opt, oi) => {
            let border = 'var(--border)', bg = 'var(--surface2)', col = 'var(--text)'
            if (answered) {
              if (oi === q.correct)    { border = 'var(--green)'; bg = 'rgba(34,197,94,.08)'; col = 'var(--green)' }
              else if (oi === userAns) { border = 'var(--red)';   bg = 'rgba(239,68,68,.08)'; col = 'var(--red)' }
            }
            return (
              <div key={oi} onClick={() => { if (!answered) { setRetryAnswers_h(p => ({...p,[retryQ]:oi})); setRetryRevealed_h(p => ({...p,[retryQ]:true})) } }}
                style={{ padding: '12px 16px', borderRadius: 12, border: `2px solid ${border}`, background: bg, cursor: answered ? 'default' : 'pointer', display: 'flex', gap: 12, alignItems: 'center', transition: 'all 0.15s' }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: answered && (oi === q.correct || oi === userAns) ? 'white' : col, flexShrink: 0, background: answered && oi === q.correct ? 'var(--green)' : answered && oi === userAns ? 'var(--red)' : 'transparent' }}>
                  {['A','B','C','D'][oi]}
                </span>
                <span style={{ fontSize: 14, color: col, lineHeight: 1.5, flex: 1 }}>{opt}</span>
                {answered && oi === q.correct && <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 16 }}>✓</span>}
              </div>
            )
          })}
        </div>
        {answered && q.explanation && (
          <div style={{ padding: '14px 16px', background: 'rgba(34,197,94,.06)', border: '1.5px solid rgba(34,197,94,.2)', borderRadius: 12, marginBottom: 20 }}>
            <div style={{ color: 'var(--green)', fontWeight: 700, marginBottom: 6, fontSize: 13 }}>📖 Explanation</div>
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8 }}>{q.explanation}</div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => setRetryQ(r => r - 1)} disabled={retryQ === 0}>← Previous</button>
          {retryQ === wrongQs.length - 1
            ? <button className="btn btn-primary" onClick={() => setRetryDone_h(true)}>Finish ✓</button>
            : <button className="btn btn-primary" onClick={() => setRetryQ(r => r + 1)}>Next →</button>
          }
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────
  // HISTORY DETAIL VIEW
  // ─────────────────────────────────────────────
  if (activeHistTest) {
    const test       = paperForReview || activeHistTest
    const cd         = CUTOFFS[activeHistTest.exam]
    const prevCutoff = cd?.previousYear?.cutoffs?.[activeHistTest.category] || 0
    const expCutoff  = cd?.expectedCurrentYear?.cutoffs?.[activeHistTest.category] || 0
    const totalMarks = cd?.totalMarks || 100
    const userMarks  = Math.round((activeHistTest.percent / 100) * totalMarks)
    const qualifyExp = userMarks >= expCutoff
    const wrongQs    = getWrongQs()
    const allAttempts = getSamePaperAttempts(activeHistTest.mockPaperId)

    return (
      <div className="page" style={{ maxWidth: 800 }}>
        {/* Back */}
        <button className="btn btn-ghost" style={{ marginBottom: 20 }} onClick={() => setActiveHistTest(null)}>← Back to Mock Tests</button>

        {/* Score Hero */}
        <div style={{ background: 'var(--surface)', border: `1.5px solid var(--border)`, borderRadius: 18, marginBottom: 16, overflow: 'hidden' }} className="slide-up">
          {/* Top accent strip */}
          <div style={{ height: 4, background: `linear-gradient(90deg, ${sColor(activeHistTest.percent)}, ${sColor(activeHistTest.percent)}80)` }} />
          <div style={{ padding: 'clamp(16px,4vw,24px)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 16, right: 16, width: 90, height: 90, borderRadius: '50%', background: `${sColor(activeHistTest.percent)}08`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: activeHistTest.level === 'hard' ? 'rgba(249,115,22,.12)' : 'rgba(59,130,246,.12)', border: `1px solid ${activeHistTest.level === 'hard' ? 'rgba(249,115,22,.25)' : 'rgba(59,130,246,.25)'}`, borderRadius: 8, padding: '3px 10px', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: activeHistTest.level === 'hard' ? 'var(--accent)' : 'var(--blue)' }}>{activeHistTest.level === 'hard' ? '🔥 Hard Level' : '⭐ Standard Level'}</span>
                </div>
                <h1 style={{ fontSize: 'clamp(15px,4vw,19px)', fontWeight: 800, margin: '0 0 4px', color: 'var(--text)' }}>{activeHistTest.exam} · {paperLabel(activeHistTest)}</h1>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>{fmtDate(activeHistTest.date)} · {activeHistTest.category}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 'clamp(34px,10vw,46px)', fontWeight: 900, color: sColor(activeHistTest.percent), lineHeight: 1 }}>{activeHistTest.percent}%</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{activeHistTest.score?.toFixed(1)}/{activeHistTest.maxScore} marks</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }} className="slide-up-1">
          {[
            { label: 'Correct',  val: activeHistTest.correct || 0,         col: 'var(--green)',  bg: 'rgba(34,197,94,.08)',  icon: '✓' },
            { label: 'Wrong',    val: activeHistTest.wrong || 0,           col: 'var(--red)',    bg: 'rgba(239,68,68,.08)',  icon: '✗' },
            { label: 'Skipped',  val: activeHistTest.skipped || 0,         col: 'var(--muted)',  bg: 'var(--surface)',       icon: '—' },
            { label: 'Time',     val: fmtT(activeHistTest.timeTaken || 0), col: 'var(--accent)', bg: 'rgba(249,115,22,.08)', icon: '⏱' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: '1px solid var(--border)', borderRadius: 12, padding: 'clamp(10px,2vw,14px) 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(16px,4vw,22px)', fontWeight: 800, color: s.col }}>{s.val}</div>
              <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Attempts comparison */}
        {allAttempts.length >= 2 && (
          <div style={{ background: 'var(--surface)', border: '1.5px solid rgba(59,130,246,.2)', borderRadius: 14, padding: '16px 18px', marginBottom: 16 }} className="slide-up-2">
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', marginBottom: 12 }}>📊 Attempts Comparison — {paperLabel(activeHistTest)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(allAttempts.length, 4)}, 1fr)`, gap: 8 }}>
              {allAttempts.slice(-4).map((attempt, i) => {
                const isThis = attempt.id === activeHistTest.id
                const prev   = i > 0 ? allAttempts.slice(-4)[i-1] : null
                const diff   = prev ? attempt.percent - prev.percent : null
                return (
                  <div key={attempt.id} style={{ background: isThis ? sBg(attempt.percent) : 'var(--surface2)', border: `2px solid ${isThis ? sColor(attempt.percent) : 'var(--border)'}`, borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 5, fontWeight: 700 }}>Attempt {allAttempts.indexOf(attempt) + 1}{isThis ? ' ★' : ''}</div>
                    <div style={{ fontSize: 'clamp(18px,4vw,22px)', fontWeight: 900, color: sColor(attempt.percent) }}>{attempt.percent}%</div>
                    {diff !== null && <div style={{ fontSize: 11, fontWeight: 700, color: diff > 0 ? 'var(--green)' : diff < 0 ? 'var(--red)' : 'var(--muted)', marginTop: 4 }}>{diff > 0 ? `▲ +${diff}` : diff < 0 ? `▼ ${diff}` : '→ same'}</div>}
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{fmtDate(attempt.date)}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Cutoff analysis */}
        {cd && (() => {
          const prevDiff = userMarks - prevCutoff
          const expDiff  = userMarks - expCutoff
          const qualPrev = prevDiff >= 0
          return (
            <div style={{ background: 'var(--surface)', border: `1.5px solid ${qualifyExp ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)'}`, borderRadius: 14, padding: '16px 18px', marginBottom: 16 }} className="slide-up-3">
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: 'var(--text)' }}>🎯 Cutoff Analysis — {activeHistTest.category}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
                {[
                  { label: 'Your Score',                        val: userMarks,  sub: `/${totalMarks}`,                                               col: 'var(--accent)' },
                  { label: `${cd.previousYear.year} Cutoff`,    val: prevCutoff, sub: qualPrev ? `+${prevDiff} above` : `${prevCutoff-userMarks} below`, col: qualPrev ? 'var(--green)' : 'var(--red)' },
                  { label: `${cd.expectedCurrentYear.year} Exp`,val: expCutoff,  sub: qualifyExp ? `+${expDiff} above` : `${expCutoff-userMarks} below`, col: qualifyExp ? 'var(--green)' : 'var(--red)' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--surface2)', borderRadius: 10, padding: 'clamp(10px,2vw,14px) 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 'clamp(16px,4vw,20px)', fontWeight: 800, color: s.col }}>{s.val}</div>
                    <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 3, fontWeight: 600, lineHeight: 1.3 }}>{s.label}</div>
                    <div style={{ fontSize: 10, color: s.col, fontWeight: 700, marginTop: 2 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '11px 14px', background: qualifyExp ? 'rgba(34,197,94,.08)' : 'rgba(239,68,68,.08)', border: `1.5px solid ${qualifyExp ? 'var(--green)' : 'var(--red)'}`, borderRadius: 10, fontSize: 13, color: qualifyExp ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
                {qualifyExp ? '✅ Would qualify in expected cutoff!' : `❌ Need ${expCutoff - userMarks} more marks`}
              </div>
              {cd.sectionWiseCutoff && (
                <div style={{ marginTop: 14 }}>
                  <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10, fontWeight: 700 }}>Section Performance</p>
                  {activeHistTest.sections?.map(s => {
                    const secCutoff = cd.sectionWiseCutoff?.[s.name]
                    return (
                      <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{s.name}</div>
                          {secCutoff && <div style={{ fontSize: 11, color: 'var(--muted)' }}>Min: {secCutoff.min} | Good: {secCutoff.good} | Excellent: {secCutoff.excellent}</div>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: scoreColor(s.percent) }}>{s.raw}/{s.total}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.percent}%</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })()}

        {/* Section performance */}
        {activeHistTest.sections?.length > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>Section Performance</div>
            {activeHistTest.sections.map(s => (
              <div key={s.name} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{s.name}</span>
                  <div style={{ display: 'flex', gap: 8, fontSize: 12, alignItems: 'center' }}>
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓{s.correct}</span>
                    <span style={{ color: 'var(--red)', fontWeight: 700 }}>✗{s.wrong}</span>
                    <span style={{ background: sBg(s.percent), color: sColor(s.percent), fontWeight: 800, padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{s.percent}%</span>
                  </div>
                </div>
                <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div className="fill-bar" style={{ height: '100%', width: `${s.percent}%`, background: `linear-gradient(90deg, ${sColor(s.percent)}, ${sColor(s.percent)}cc)`, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => {
            setActiveHistTest(null)
            const paper = mockPapers.find(p => p.id === activeHistTest.mockPaperId) || null
            hasLoaded.current = false
            setTestQuestions([]); setAnswers({}); setMarked({}); setCurrentQ(0); setSubmitted(false)
            startMockTest(paper)
          }}>🔄 Retake This Paper</button>
          {!paperLoading && wrongQs.length > 0 && (
            <button onClick={() => { setRetryMode_h(true); setRetryQ(0); setRetryAnswers_h({}); setRetryRevealed_h({}); setRetryDone_h(false) }}
              style={{ padding: '11px 18px', borderRadius: 12, border: '1.5px solid rgba(99,102,241,.3)', fontSize: 14, fontWeight: 700, cursor: 'pointer', background: 'rgba(99,102,241,.08)', color: 'var(--accent)' }}>
              💪 Retry {wrongQs.length} Wrong Q's
            </button>
          )}
        </div>

        {/* Answer review */}
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>Answer Review</div>
        {paperLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          test.questions?.map((q, qi) => {
            const isCorrect = q.userAnswer === q.correct
            const answered  = q.userAnswer !== null && q.userAnswer !== undefined
            return (
              <div key={qi} style={{ background: 'var(--surface)', border: `1.5px solid ${answered ? isCorrect ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.25)' : 'var(--border)'}`, borderLeft: `4px solid ${answered ? isCorrect ? 'var(--green)' : 'var(--red)' : 'var(--border)'}`, borderRadius: 12, padding: '14px 16px', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', background: 'var(--surface2)', padding: '2px 8px', borderRadius: 5 }}>Q{qi + 1}</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: answered ? isCorrect ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)' : 'var(--surface2)', color: answered ? isCorrect ? 'var(--green)' : 'var(--red)' : 'var(--muted)', fontWeight: 700 }}>
                    {answered ? isCorrect ? '✓ Correct' : '✗ Wrong' : '— Skipped'}
                  </span>
                  {q.sectionName && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: 'rgba(249,115,22,.08)', color: 'var(--accent)', fontWeight: 600 }}>{q.sectionName}</span>}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.65, marginBottom: 10, color: 'var(--text)' }}>{q.question}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: q.explanation ? 10 : 0 }}>
                  {q.options?.map((opt, oi) => (
                    <div key={oi} style={{ padding: '6px 10px', borderRadius: 8, fontSize: 12, background: oi === q.correct ? 'rgba(34,197,94,.08)' : oi === q.userAnswer && !isCorrect ? 'rgba(239,68,68,.08)' : 'var(--surface2)', border: `1px solid ${oi === q.correct ? 'var(--green)' : oi === q.userAnswer && !isCorrect ? 'var(--red)' : 'var(--border)'}`, color: oi === q.correct ? 'var(--green)' : oi === q.userAnswer && !isCorrect ? 'var(--red)' : 'var(--muted2)', display: 'flex', gap: 6 }}>
                      <span style={{ fontWeight: 700, flexShrink: 0 }}>{['A','B','C','D'][oi]}.</span>{opt}
                    </div>
                  ))}
                </div>
                {q.explanation && <div style={{ padding: '8px 12px', background: 'rgba(34,197,94,.05)', border: '1px solid rgba(34,197,94,.15)', borderRadius: 8, fontSize: 11, color: 'var(--text)', lineHeight: 1.6 }}>📖 {q.explanation}</div>}
              </div>
            )
          })
        )}
      </div>
    )
  }

  // ─────────────────────────────────────────────
  // PHASE: INTRO
  // ─────────────────────────────────────────────
  if (phase === 'intro') {
    const bestScore   = mockHistory.length ? Math.max(...mockHistory.map(t => t.percent)) : 0
    const avgScore    = mockHistory.length ? Math.round(mockHistory.reduce((a,t) => a + t.percent, 0) / mockHistory.length) : 0
    const mixPaperId  = getMixPaperId()
    const mixAttempts = getSamePaperAttempts(mixPaperId)
    const bestMix     = mixAttempts.length ? Math.max(...mixAttempts.map(a => a.percent)) : null

    return (
      <div className="page" style={{ maxWidth: 860 }}>

        {/* ── PAGE HEADER ── */}
        <div style={{ marginBottom: 20 }} className="slide-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <button onClick={() => navigate('examhub')}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', fontSize: 12, padding: '6px 12px', fontWeight: 700, borderRadius: 8 }}>
              ← Back
            </button>
          </div>
          {/* Title with tricolor accent */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 4, height: 48, background: 'linear-gradient(180deg, #FF9933 33%, #ffffff 33%, #ffffff 66%, #138808 66%)', borderRadius: 2, flexShrink: 0, marginTop: 2 }} />
            <div>
              <h1 style={{ fontSize: 'clamp(18px,5vw,22px)', fontWeight: 800, margin: '0 0 3px', color: 'var(--text)' }}>
                Mock Tests <span style={{ color: 'var(--muted)', fontWeight: 500, fontSize: '0.75em' }}>मॉक टेस्ट</span>
              </h1>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>{selectedExam} · Full length practice papers</p>
            </div>
          </div>
        </div>

        {/* ── STATS ROW (if history) ── */}
        {mockHistory.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }} className="slide-up">
            {[
              { label: 'Tests Taken',   labelHi: 'कुल टेस्ट',  val: mockHistory.length,  col: '#3b82f6', bg: 'rgba(59,130,246,.1)',  icon: '📋' },
              { label: 'Best Score',    labelHi: 'सर्वश्रेष्ठ', val: `${bestScore}%`,     col: 'var(--green)', bg: 'rgba(34,197,94,.1)',  icon: '🏆' },
              { label: 'Avg Score',     labelHi: 'औसत स्कोर',  val: `${avgScore}%`,      col: 'var(--accent)', bg: 'rgba(249,115,22,.1)',icon: '📊' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, border: `1.5px solid ${s.col}25`, borderRadius: 14, padding: 'clamp(10px,3vw,16px) 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 'clamp(18px,5vw,22px)', fontWeight: 900, color: s.col, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, marginTop: 4, lineHeight: 1.3 }}>
                  {s.label}<br/><span style={{ fontSize: 9, color: 'var(--muted)' }}>{s.labelHi}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── FILTER ROW: Language + Difficulty ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }} className="slide-up-1">

          {/* Language */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
              Language <span style={{ fontWeight: 500 }}>भाषा</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { id: 'english', flag: '🇬🇧', label: 'English', sub: 'English Medium' },
                { id: 'hindi',   flag: '🇮🇳', label: 'हिंदी',   sub: 'Hindi Medium'  },
              ].map(l => {
                const isSel = mockLanguage === l.id
                return (
                  <button key={l.id} onClick={() => setMockLanguage(l.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: `2px solid ${isSel ? 'var(--accent)' : 'var(--border)'}`, background: isSel ? 'rgba(249,115,22,.08)' : 'var(--surface2)', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' }}>
                    <span style={{ fontSize: 17 }}>{l.flag}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: isSel ? 700 : 500, color: isSel ? 'var(--accent)' : 'var(--text)', lineHeight: 1 }}>{l.label}</div>
                    </div>
                    {isSel && <span style={{ marginLeft: 'auto', width: 16, height: 16, background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'white', fontWeight: 900, flexShrink: 0 }}>✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Difficulty */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
              Difficulty <span style={{ fontWeight: 500 }}>कठिनाई</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { id: 'same', emoji: '⭐', label: 'Standard',  sub: 'Real exam level',  col: '#3b82f6' },
                { id: 'hard', emoji: '🔥', label: 'Hard',      sub: 'Above exam level', col: 'var(--accent)' },
              ].map(l => {
                const isSel = mockLevel === l.id
                return (
                  <button key={l.id} onClick={() => setMockLevel(l.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: `2px solid ${isSel ? l.col : 'var(--border)'}`, background: isSel ? `${l.col}12` : 'var(--surface2)', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' }}>
                    <span style={{ fontSize: 17 }}>{l.emoji}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: isSel ? 700 : 500, color: isSel ? l.col : 'var(--text)', lineHeight: 1 }}>{l.label}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{l.sub}</div>
                    </div>
                    {isSel && <span style={{ marginLeft: 'auto', width: 16, height: 16, background: l.col, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'white', fontWeight: 900, flexShrink: 0 }}>✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── SECTION LABEL ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }} className="slide-up-2">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 3, height: 18, background: 'var(--accent)', borderRadius: 2 }} />
            <h2 style={{ fontSize: 13, fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text)' }}>
              Mock Papers — मॉक पेपर
            </h2>
          </div>
          {papersLoaded && mockPapers.length > 0 && (
            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '3px 10px' }}>
              {mockPapers.length} available
            </span>
          )}
        </div>

        {/* ── PAPER CARDS (Adda247 list style on mobile, grid on desktop) ── */}
        {!papersLoaded ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '40px 24px', textAlign: 'center', marginBottom: 20 }}>
            <div className="spinner" style={{ margin: '0 auto 14px', width: 28, height: 28 }} />
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>Loading papers...</p>
          </div>
        ) : mockPapers.length === 0 ? (
          <div style={{ background: 'var(--surface)', border: '2px dashed var(--border)', borderRadius: 14, padding: '40px 24px', textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>📭</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>No Papers Yet</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 340, margin: '0 auto' }}>
              Papers are auto-generated once the {mockLanguage === 'hindi' ? 'Hindi' : 'English'} question bank has enough questions. Ask admin to add questions for {selectedExam}.
            </p>
          </div>
        ) : (
          /* ── MOBILE: list-style / DESKTOP: grid ── */
          <div style={{ marginBottom: 20 }}>
            {/* Mobile list layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mockPapers.map((paper, i) => {
                const myAttempts  = getSamePaperAttempts(paper.id)
                const bestAttempt = myAttempts.length ? Math.max(...myAttempts.map(a => a.percent)) : null
                const diffColor   = mockLevel === 'hard' ? 'var(--accent)' : '#3b82f6'
                const isAttempted = myAttempts.length > 0

                return (
                  <div key={paper.id} className="mock-paper-card"
                    onClick={() => { setPendingPaper(paper); setShowMockConfig(true) }}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderLeft: `4px solid ${isAttempted ? sColor(bestAttempt) : diffColor}`,
                      borderRadius: 14,
                      padding: 'clamp(14px,3vw,18px)',
                      position: 'relative',
                      overflow: 'hidden',
                      animation: `slideUp 0.32s ${i * 0.05}s ease both`
                    }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>

                      {/* Left: icon + info */}
                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                        {/* Icon */}
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: isAttempted ? sBg(bestAttempt) : `${diffColor}12`, border: `1.5px solid ${isAttempted ? sColor(bestAttempt) + '40' : diffColor + '30'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                          📝
                        </div>
                        {/* Text */}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 3 }}>
                            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>Mock #{paper.mockNumber}</span>
                            <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 20, background: mockLevel === 'hard' ? 'rgba(249,115,22,.15)' : 'rgba(59,130,246,.15)', color: diffColor, fontWeight: 700 }}>
                              {mockLevel === 'hard' ? '🔥 Hard' : '⭐ Std'}
                            </span>
                          </div>
                          {/* Meta */}
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>📝 {paper.totalQuestions}Q</span>
                            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>⏱ {paper.duration}m</span>
                            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>👥 {paper.attemptCount || 0} taken</span>
                          </div>
                          {/* Attempt info */}
                          {isAttempted && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: sColor(bestAttempt), background: sBg(bestAttempt), border: `1px solid ${sColor(bestAttempt)}30`, padding: '2px 8px', borderRadius: 6 }}>Best: {bestAttempt}%</span>
                              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{myAttempts.length}x attempted</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: CTA button */}
                      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <div style={{ padding: '9px 16px', borderRadius: 10, background: isAttempted ? 'transparent' : `linear-gradient(135deg, ${diffColor}, ${diffColor}cc)`, border: isAttempted ? `1.5px solid ${diffColor}` : 'none', color: isAttempted ? diffColor : 'white', fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap', textAlign: 'center', minWidth: 80 }}>
                          {isAttempted ? 'Retake' : 'Attempt'}
                        </div>
                      </div>
                    </div>

                    {/* Not attempted pill */}
                    {!isAttempted && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: diffColor, display: 'inline-block' }} />
                        Not attempted yet — be the first!
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── NEW MOCK TEST CARD (was "Random Mix") ── */}
        {papersLoaded && mockPapers.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            {/* Section label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 3, height: 18, background: '#6366f1', borderRadius: 2 }} />
              <h2 style={{ fontSize: 13, fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text)' }}>
                New Mock Test — नया टेस्ट
              </h2>
            </div>

            <div className="mock-paper-card"
              onClick={async () => {
                setPapersLoaded(false)
                const mix = await generateRandomMixPaper(selectedExam, mockLevel, mockLanguage).catch(() => null)
                setPapersLoaded(true)
                if (mix) { setPendingPaper(mix); setShowMockConfig(true) }
              }}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '4px solid #6366f1', borderRadius: 14, padding: 'clamp(14px,3vw,18px)', position: 'relative', overflow: 'hidden' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                {/* Left */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99,102,241,.1)', border: '1.5px solid rgba(99,102,241,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    ⚡
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>New Mock Test</span>
                      <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 20, background: 'rgba(99,102,241,.12)', color: '#6366f1', fontWeight: 700 }}>New Every Time</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>Random questions from the full bank — unique every attempt</div>
                    {bestMix !== null && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: sColor(bestMix), background: sBg(bestMix), border: `1px solid ${sColor(bestMix)}30`, padding: '2px 8px', borderRadius: 6 }}>Best: {bestMix}%</span>
                        <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{mixAttempts.length}x attempted</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <div style={{ padding: '9px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: 'white', fontSize: 12, fontWeight: 800, flexShrink: 0, whiteSpace: 'nowrap' }}>
                  Start
                </div>
              </div>

              {bestMix === null && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 11, color: '#6366f1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
                  नया टेस्ट शुरू करें — Get a fresh question set every time
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ANALYTICS CTA ── */}
        {mockHistory.length >= 2 && (
          <div style={{ marginBottom: 22, padding: '14px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '4px solid #3b82f6', borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2, color: 'var(--text)' }}>📊 Progress Analytics</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Compare all your mock attempts — सभी प्रयास</div>
            </div>
            <button onClick={() => navigate('mockhistory')} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>View Analytics →</button>
          </div>
        )}

        {/* ── HISTORY LIST ── */}
        {mockHistory.length > 0 && (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 3, height: 18, background: 'var(--accent)', borderRadius: 2 }} />
                <h2 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', margin: 0, color: 'var(--text)' }}>
                  My History ({mockHistory.length})
                </h2>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 8, padding: '4px 10px', fontSize: 11, display: 'flex', gap: 5, alignItems: 'center' }}>
                  <span style={{ color: 'var(--green)', fontWeight: 800 }}>{bestScore}%</span>
                  <span style={{ color: 'var(--muted)', fontWeight: 600 }}>best</span>
                </div>
                <div style={{ background: 'rgba(249,115,22,.1)', border: '1px solid rgba(249,115,22,.2)', borderRadius: 8, padding: '4px 10px', fontSize: 11, display: 'flex', gap: 5, alignItems: 'center' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{avgScore}%</span>
                  <span style={{ color: 'var(--muted)', fontWeight: 600 }}>avg</span>
                </div>
              </div>
            </div>

            {/* Mini score chart */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', marginBottom: 14, display: 'flex', alignItems: 'flex-end', gap: 6, height: 80, overflowX: 'auto' }} className="no-scroll">
              {[...mockHistory].reverse().map((t, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 34 }}>
                  <div style={{ fontSize: 9, color: sColor(t.percent), fontWeight: 800 }}>{t.percent}%</div>
                  <div style={{ width: 22, height: `${Math.max(t.percent * 0.38, 8)}px`, background: `linear-gradient(180deg, ${sColor(t.percent)}, ${sColor(t.percent)}50)`, borderRadius: '3px 3px 0 0' }} />
                  <div style={{ fontSize: 7, color: 'var(--muted)', fontWeight: 600 }}>T{mockHistory.length - i}</div>
                </div>
              ))}
            </div>

            {/* History cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mockHistory.map((test, i) => {
                const isQualified = checkQualified(test)
                const statusColor = isQualified ? 'var(--green)' : 'var(--red)'
                return (
                  <div key={test.id || i} className="mock-paper-card" onClick={() => setActiveHistTest(test)}
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `4px solid ${statusColor}`, borderRadius: 12, padding: 'clamp(12px,3vw,16px)', animation: `slideUp 0.3s ${i * 0.04}s ease both` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      {/* Left */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 4 }}>
                          <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0, color: 'var(--text)' }}>{paperLabel(test)}</h3>
                          <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, background: test.level === 'hard' ? 'rgba(249,115,22,.15)' : 'rgba(59,130,246,.15)', color: test.level === 'hard' ? 'var(--accent)' : '#3b82f6', fontWeight: 700 }}>{test.level === 'hard' ? '🔥 Hard' : '⭐ Std'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
                          <span>📅 {fmtDate(test.createdAt || test.date)}</span>
                          <span>· {test.category}</span>
                          <span>· ⏱ {test.timeTaken ? fmtT(test.timeTaken) : '—'}</span>
                        </div>
                        {/* Stats inline */}
                        <div style={{ display: 'flex', gap: 10, marginTop: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>✓ {test.correct || 0}</span>
                          <span style={{ fontSize: 11, color: 'var(--red)', fontWeight: 700 }}>✗ {test.wrong || 0}</span>
                          <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>— {test.skipped || 0}</span>
                        </div>
                      </div>

                      {/* Right: score */}
                      <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        <div style={{ fontSize: 'clamp(22px,6vw,28px)', fontWeight: 900, color: sColor(test.percent), lineHeight: 1 }}>{test.percent}%</div>
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>{test.score?.toFixed(1)}/{test.maxScore}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: statusColor, marginTop: 6 }}>Analysis →</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── MOCK CONFIG MODAL (Bottom Sheet) ── */}
        {showMockConfig && pendingPaper && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}>
            <div style={{ background: 'var(--surface)', borderRadius: '22px 22px 0 0', maxWidth: 540, width: '100%', maxHeight: '92vh', overflowY: 'auto', border: '1px solid var(--border)', boxShadow: '0 -12px 40px rgba(0,0,0,.3)', padding: 'clamp(18px,5vw,26px)', paddingBottom: 32 }} className="no-scroll">

              {/* Tricolor strip at top */}
              <div className="mock-tricolor" style={{ width: 40, margin: '-8px auto 18px', borderRadius: 2 }} />

              {/* Title */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 10 }}>
                <div>
                  <h2 style={{ fontSize: 19, fontWeight: 800, margin: '0 0 4px', color: 'var(--text)' }}>
                    {pendingPaper.isRandomMix ? '⚡ New Mock Test' : `📝 Mock Paper #${pendingPaper.mockNumber}`}
                  </h2>
                  <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
                    {selectedExam} · {mockLevel === 'hard' ? 'Hard Level' : 'Standard Level'} · {mockLanguage === 'hindi' ? 'हिंदी माध्यम' : 'English Medium'}
                  </p>
                </div>
                <button onClick={() => setShowMockConfig(false)} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', width: 34, height: 34, borderRadius: 10, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', flexShrink: 0 }}>✕</button>
              </div>

              {/* Info chips */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                {[
                  { icon: '📝', val: `${pendingPaper.totalQuestions} Questions` },
                  { icon: '⏱️', val: `${pendingPaper.duration} mins` },
                  { icon: '✅', val: `+${pendingPaper.marking?.correct} correct` },
                  { icon: '❌', val: `${pendingPaper.marking?.wrong} wrong` },
                  { icon: mockLanguage === 'hindi' ? '🇮🇳' : '🇬🇧', val: mockLanguage === 'hindi' ? 'हिंदी' : 'English' },
                ].map(s => (
                  <div key={s.val} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 9, padding: '5px 11px', fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>{s.icon} {s.val}</div>
                ))}
              </div>

              {/* Category */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10, fontWeight: 700 }}>
                  Your Category <span style={{ fontWeight: 500 }}>श्रेणी</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['General','OBC','SC','ST','EWS'].map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)}
                      style={{ padding: '8px 16px', borderRadius: 10, border: `2px solid ${category === cat ? 'var(--accent)' : 'var(--border)'}`, background: category === cat ? 'rgba(249,115,22,.1)' : 'var(--surface)', color: category === cat ? 'var(--accent)' : 'var(--muted2)', cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.15s' }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional subject */}
              {HINDI_OPTIONAL_EXAMS.includes(selectedExam) && (
                <div style={{ background: 'var(--surface2)', border: '1.5px solid rgba(239,68,68,.2)', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, fontWeight: 700 }}>★ Optional Subject</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>Choose which optional section to appear — different from question language</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[{ id: 'hindi', label: 'हिंदी', flag: '🇮🇳', col: 'var(--red)' }, { id: 'english', label: 'English', flag: '🇬🇧', col: 'var(--green)' }].map(l => (
                      <button key={l.id} onClick={() => setOptionalSubject(l.id)}
                        style={{ flex: 1, padding: 12, borderRadius: 10, border: `2px solid ${optionalSubject === l.id ? l.col : 'var(--border)'}`, background: optionalSubject === l.id ? `${l.col}12` : 'var(--surface)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                        <div style={{ fontSize: 22, marginBottom: 5 }}>{l.flag}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: optionalSubject === l.id ? l.col : 'var(--text)' }}>{l.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowMockConfig(false)} style={{ flex: 1, padding: 14, borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => {
                  setShowMockConfig(false)
                  hasLoaded.current = false; setTestQuestions([]); setAnswers({}); setMarked({}); setCurrentQ(0); setSubmitted(false)
                  startMockTest(pendingPaper)
                }} style={{ flex: 2, padding: 14, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, var(--accent), #ea580c)', color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 20px rgba(249,115,22,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  🚀 Start Test — टेस्ट शुरू
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    )
  }

  // ─────────────────────────────────────────────
  // PHASE: LOADING
  // ─────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', padding: 40, maxWidth: 340 }}>
          {/* Animated ring */}
          <div style={{ width: 80, height: 80, margin: '0 auto 26px', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid var(--border)' }} />
            <div className="spinner" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📝</div>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>Preparing Your Test</h2>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>टेस्ट तैयार हो रहा है...</p>
          <div style={{ background: 'rgba(249,115,22,.08)', border: '1px solid rgba(249,115,22,.2)', borderRadius: 10, padding: '10px 20px', marginBottom: 10 }}>
            <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 14, margin: 0 }}>{loadingMsg || 'Loading questions...'}</p>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 12, margin: 0 }}>Please wait, this may take a moment</p>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────
  // PHASE: ERROR
  // ─────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 20, padding: 'clamp(28px,5vw,40px) clamp(20px,5vw,32px)', maxWidth: 380, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 14, lineHeight: 1 }}>⏳</div>
          <h2 style={{ marginBottom: 8, fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>Almost Ready!</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 28, lineHeight: 1.7, maxWidth: 260, margin: '0 auto 28px' }}>Our AI servers are busy right now. Please wait a moment and try again.</p>
          <MockRetryButton onRetry={() => { hasLoaded.current = false; startMockTest() }} />
          <button className="btn btn-ghost" style={{ marginTop: 14, display: 'block', margin: '14px auto 0' }} onClick={() => navigate('home')}>← Back to Home</button>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────
  // PHASE: RESULT
  // ─────────────────────────────────────────────
  if (phase === 'result') {
    const score         = calcScore()
    const sectionScores = calcSectionScores()
    const emoji = score.percent >= 80 ? '🏆' : score.percent >= 65 ? '🎉' : score.percent >= 50 ? '👍' : '💪'

    return (
      <div className="page" style={{ maxWidth: 900, padding: 'clamp(16px, 3vw, 28px)' }}>
        {pointsResult && <PointsReveal points={pointsResult.points} totalPoints={pointsResult.totalPoints} pointRow={pointsResult.pointRow} exam={selectedExam} onContinue={() => setPointsResult(null)} />}

        {/* Hero score card */}
        <div style={{ background: 'var(--surface)', border: `1.5px solid var(--border)`, borderRadius: 20, marginBottom: 20, overflow: 'hidden' }} className="score-ring">
          {/* Top strip */}
          <div style={{ height: 4, background: `linear-gradient(90deg, ${scoreColor(score.percent)}, ${scoreColor(score.percent)}80)` }} />
          <div style={{ padding: 'clamp(20px,5vw,36px)', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 16, right: 16, opacity: 0.06, fontSize: 100, lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>📝</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: 8 }}>
              {selectedExam} · {selectedPaper?.isRandomMix ? '⚡ New Mock Test' : `Mock Paper #${selectedPaper?.mockNumber}`}
            </div>
            <div style={{ fontSize: 56, marginBottom: 4, lineHeight: 1 }}>{emoji}</div>
            <div style={{ fontSize: 'clamp(48px,14vw,64px)', fontWeight: 900, color: scoreColor(score.percent), lineHeight: 1, marginBottom: 4 }}>{score.raw}</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 8 }}>/ {score.maxRaw} marks</div>
            <div style={{ display: 'inline-block', background: `${scoreColor(score.percent)}12`, border: `2px solid ${scoreColor(score.percent)}30`, borderRadius: 12, padding: '4px 20px', marginBottom: 22 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: scoreColor(score.percent) }}>{score.percent}%</span>
            </div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, maxWidth: 420, margin: '0 auto 14px' }}>
              {[
                { val: score.correct, label: 'Correct', labelHi: 'सही',    col: 'var(--green)'  },
                { val: score.wrong,   label: 'Wrong',   labelHi: 'गलत',   col: 'var(--red)'    },
                { val: score.skipped, label: 'Skipped', labelHi: 'छोड़े',  col: 'var(--muted)'  },
                { val: formatTime((selectedPaper?.duration || config.duration) * 60 - timeLeft), label: 'Time', labelHi: 'समय', col: 'var(--accent)' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '10px 6px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 'clamp(15px,4vw,20px)', fontWeight: 800, color: s.col }}>{s.val}</div>
                  <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 3, fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: 8, color: 'var(--muted)', marginTop: 1 }}>{s.labelHi}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--surface2)', padding: '5px 14px', borderRadius: 6, display: 'inline-block', border: '1px solid var(--border)' }}>
              +{config.marking.correct} correct · {config.marking.wrong} wrong · 0 skipped
            </div>
          </div>
        </div>

        {/* Cutoff analysis */}
        {CUTOFFS[selectedExam] && (() => {
          const cd = CUTOFFS[selectedExam]
          const prevCutoff = cd.previousYear.cutoffs[category] || 0
          const expCutoff  = cd.expectedCurrentYear.cutoffs[category] || 0
          const totalMarks = cd.totalMarks
          const userMarks  = Math.round((score.percent / 100) * totalMarks)
          const prevDiff   = userMarks - prevCutoff
          const expDiff    = userMarks - expCutoff
          const qualPrev   = prevDiff >= 0
          const qualifyExp = expDiff >= 0
          return (
            <div style={{ background: 'var(--surface)', border: `1.5px solid ${qualifyExp ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.25)'}`, borderRadius: 16, padding: 'clamp(14px,3vw,20px)', marginBottom: 18 }} className="slide-up-2">
              <h2 style={{ fontSize: 14, fontWeight: 800, marginBottom: 14, color: 'var(--text)' }}>🎯 Cutoff Analysis — {category} Category</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
                {[
                  { label: 'Your Score',                             val: userMarks,  sub: `out of ${totalMarks}`,                                               col: 'var(--accent)' },
                  { label: `${cd.previousYear.year} Cutoff`,         val: prevCutoff, sub: qualPrev ? `+${prevDiff} above` : `${prevCutoff-userMarks} below`, col: qualPrev ? 'var(--green)' : 'var(--red)' },
                  { label: `${cd.expectedCurrentYear.year} Expected`, val: expCutoff,  sub: qualifyExp ? `+${expDiff} above` : `${expCutoff-userMarks} below`, col: qualifyExp ? 'var(--green)' : 'var(--red)' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--surface2)', borderRadius: 12, padding: 'clamp(10px,2vw,14px) 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 'clamp(16px,4vw,22px)', fontWeight: 800, color: s.col }}>{s.val}</div>
                    <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 4, fontWeight: 600, lineHeight: 1.4 }}>{s.label}</div>
                    <div style={{ fontSize: 9, color: s.col, fontWeight: 700, marginTop: 2 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: qualifyExp ? 'rgba(34,197,94,.06)' : 'rgba(239,68,68,.06)', border: `1.5px solid ${qualifyExp ? 'var(--green)' : 'var(--red)'}`, borderRadius: 10, padding: '12px 16px', marginBottom: cd.sectionWiseCutoff ? 14 : 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: qualifyExp ? 'var(--green)' : 'var(--red)', marginBottom: 4 }}>{qualifyExp ? '✅ Likely to Qualify in 2026!' : `❌ Need ${Math.abs(expDiff)} more marks`}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{qualifyExp ? `Great! You scored ${expDiff} marks above the expected cutoff for ${category}.` : `You need to improve by ${Math.abs(expDiff)} marks to clear the expected cutoff.`}</div>
              </div>
              {cd.sectionWiseCutoff && (
                <div style={{ marginTop: 14 }}>
                  <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10, fontWeight: 700 }}>Section Performance</p>
                  {sectionScores.map(s => {
                    const secCutoff = cd.sectionWiseCutoff?.[s.name]
                    return (
                      <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{s.name}</div>
                          {secCutoff && <div style={{ fontSize: 11, color: 'var(--muted)' }}>Min: {secCutoff.min} | Good: {secCutoff.good} | Excellent: {secCutoff.excellent}</div>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: scoreColor(s.percent) }}>{s.raw}/{s.total * config.marking.correct}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.percent}%</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })()}

        {/* Section performance */}
        <div style={{ marginBottom: 20 }} className="slide-up-3">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Section Wise Performance</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
            {sectionScores.map(s => (
              <div key={s.name} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, color: 'var(--text)', lineHeight: 1.3 }}>{s.name}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: scoreColor(s.percent), marginBottom: 6, lineHeight: 1 }}>{s.raw}<span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)' }}>/{s.total * config.marking.correct}</span></div>
                <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                  <div className="fill-bar" style={{ height: '100%', width: `${s.percent}%`, background: scoreColor(s.percent), borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)', display: 'flex', gap: 6 }}>
                  <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓{s.correct}</span>
                  <span style={{ color: 'var(--red)', fontWeight: 700 }}>✗{s.wrong}</span>
                  <span>—{s.skipped}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }} className="slide-up-4">
          <button className="btn btn-primary" onClick={() => { hasLoaded.current = false; setTestQuestions([]); setAnswers({}); setMarked({}); setCurrentQ(0); setSubmitted(false); startMockTest(selectedPaper) }}>🔄 Retake This Paper</button>
          <button className="btn btn-secondary" onClick={() => { setPhase('intro'); setTestQuestions([]); setAnswers({}); setMarked({}); setCurrentQ(0); hasLoaded.current = false }}>← Back to Papers</button>
          <button className="btn btn-ghost" onClick={() => navigate('dashboard')}>📊 View Progress</button>
        </div>

        {/* Answer review */}
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>Answer Review</div>
        {sections.map(sec => {
          const qs = getSectionQs(sec)
          return (
            <div key={sec} style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', marginBottom: 10, padding: '5px 12px', background: 'rgba(249,115,22,.06)', borderRadius: 8, border: '1px solid rgba(249,115,22,.15)', display: 'inline-block' }}>{sec}</div>
              {qs.map((q, qi) => {
                const gi = testQuestions.indexOf(q)
                const userAnswer = answers[gi]
                const isCorrect  = userAnswer === q.correct
                const answered   = userAnswer !== undefined
                return (
                  <div key={qi} style={{ background: 'var(--surface)', border: `1.5px solid ${!answered ? 'var(--border)' : isCorrect ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.25)'}`, borderLeft: `4px solid ${!answered ? 'var(--border)' : isCorrect ? 'var(--green)' : 'var(--red)'}`, borderRadius: 12, padding: 14, marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                      <span style={{ width: 24, height: 24, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0, background: !answered ? 'var(--surface2)' : isCorrect ? 'rgba(34,197,94,.12)' : 'rgba(239,68,68,.12)', color: !answered ? 'var(--muted)' : isCorrect ? 'var(--green)' : 'var(--red)' }}>{qi + 1}</span>
                      <span style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text)' }}>{q.question}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: q.explanation ? 10 : 0 }}>
                      {q.options.map((opt, oi) => (
                        <div key={oi} style={{ display: 'flex', gap: 7, alignItems: 'center', padding: '6px 10px', borderRadius: 8, border: `1px solid ${oi === q.correct ? 'var(--green)' : oi === userAnswer && !isCorrect ? 'var(--red)' : 'var(--border)'}`, background: oi === q.correct ? 'rgba(34,197,94,.06)' : oi === userAnswer && !isCorrect ? 'rgba(239,68,68,.06)' : 'var(--surface2)', fontSize: 12, color: oi === q.correct ? 'var(--green)' : oi === userAnswer && !isCorrect ? 'var(--red)' : 'var(--muted2)' }}>
                          <span style={{ fontWeight: 800, flexShrink: 0, width: 14 }}>{['A','B','C','D'][oi]}</span>{opt}
                        </div>
                      ))}
                    </div>
                    {q.explanation && <div style={{ fontSize: 11, color: 'var(--text)', lineHeight: 1.7, padding: '9px 12px', background: 'rgba(34,197,94,.04)', borderRadius: 8, border: '1px solid rgba(34,197,94,.12)' }}>📖 {q.explanation}</div>}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }

  // ─────────────────────────────────────────────
  // PHASE: TEST (fullscreen)
  // ─────────────────────────────────────────────
  const q        = testQuestions[currentQ]
  const answered = Object.keys(answers).length

  const timerDanger  = timeLeft < 300
  const timerWarning = !timerDanger && timeLeft < 600
  const timerColor   = timerDanger ? '#ef4444' : timerWarning ? '#f59e0b' : '#22c55e'
  const timerBg      = timerDanger ? 'rgba(239,68,68,.15)' : timerWarning ? 'rgba(245,158,11,.12)' : 'rgba(34,197,94,.1)'

  if (!q) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── TOP HEADER ── */}
      <div style={{ flexShrink: 0, background: 'linear-gradient(135deg, #0f1e3d, #162d52)', color: 'white', padding: '0 14px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, boxShadow: '0 2px 12px rgba(0,0,0,.3)' }}>

        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>📝</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 'clamp(11px,3vw,13px)', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedExam}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.55)', marginTop: 1 }}>
              {selectedPaper?.isRandomMix ? '⚡ New' : `#${selectedPaper?.mockNumber}`} · {mockLevel === 'hard' ? '🔥 Hard' : '⭐ Std'} · {mockLanguage === 'hindi' ? 'हिंदी' : 'EN'}
            </div>
          </div>
        </div>

        {/* Timer */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: timerBg, border: `1.5px solid ${timerColor}40`, borderRadius: 10, padding: '4px 12px', flexShrink: 0 }} className={timerDanger ? 'timer-pulse' : ''}>
          <div style={{ fontSize: 8, color: timerDanger ? '#ef4444' : 'rgba(255,255,255,.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>TIME</div>
          <div style={{ fontSize: 'clamp(14px,4vw,18px)', fontWeight: 900, color: timerColor, fontVariantNumeric: 'tabular-nums', letterSpacing: 1, lineHeight: 1.1 }}>{formatTime(timeLeft)}</div>
        </div>

        {/* Submit */}
        <button onClick={() => setShowSubmitModal(true)}
          style={{ padding: '7px clamp(8px,2vw,14px)', borderRadius: 9, background: 'rgba(239,68,68,.8)', border: '1.5px solid rgba(239,68,68,.5)', color: 'white', fontSize: 12, fontWeight: 800, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
          Submit ✓
        </button>
      </div>

      {/* ── SECTION TABS ── */}
      {sections.length > 1 && (
        <div style={{ flexShrink: 0, background: 'var(--surface)', borderBottom: '1.5px solid var(--border)', display: 'flex', alignItems: 'stretch', overflowX: 'auto', overflowY: 'hidden' }} className="no-scroll">
          {sections.map(sec => {
            const isActive = activeSection === sec
            const secQs    = getSectionQs(sec)
            const secDone  = secQs.filter(q => answers[testQuestions.indexOf(q)] !== undefined).length
            return (
              <button key={sec}
                className={`mock-section-tab${isActive ? ' active' : ''}`}
                style={{ flexShrink: 0, padding: '9px 16px', background: isActive ? 'var(--surface2)' : 'transparent', border: 'none', color: isActive ? 'var(--accent)' : 'var(--muted)', fontSize: 12, fontWeight: isActive ? 800 : 600, cursor: 'pointer', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)', minHeight: 42, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
                onClick={() => {
                  setActiveSection(sec)
                  const secQs = getSectionQs(sec)
                  let lastAnswered = -1
                  secQs.forEach(q => { const gi = testQuestions.indexOf(q); if (answers[gi] !== undefined) lastAnswered = gi })
                  if (lastAnswered !== -1) {
                    const nextUnanswered = testQuestions.findIndex((q, i) => i > lastAnswered && q.sectionName === sec && answers[i] === undefined)
                    setCurrentQ(nextUnanswered !== -1 ? nextUnanswered : lastAnswered)
                  } else {
                    const first = testQuestions.findIndex(q => q.sectionName === sec)
                    if (first !== -1) setCurrentQ(first)
                  }
                }}>
                <span>{sec}</span>
                <span style={{ fontSize: 8, fontWeight: 600, color: isActive ? 'var(--accent)' : 'var(--muted)' }}>{secDone}/{secQs.length}</span>
              </button>
            )
          })}
          {/* Progress summary */}
          <div style={{ marginLeft: 'auto', padding: '0 12px', fontSize: 11, color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6, borderLeft: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text)', fontWeight: 800 }}>Q{currentQ + 1}</span>
            <span style={{ color: 'var(--border)' }}>|</span>
            <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓{answered}</span>
            <span style={{ color: 'var(--border)' }}>|</span>
            <span style={{ color: 'var(--red)', fontWeight: 700 }}>✗{testQuestions.length - answered}</span>
          </div>
        </div>
      )}

      {/* ── MAIN BODY ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

        {/* ── LEFT PALETTE — desktop ── */}
        <div style={{ width: 200, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }} className="mock-exam-palette no-scroll">

          {/* Legend */}
          <div style={{ padding: '10px 12px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Legend</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[
                { bg: 'var(--green)',   label: 'Answered',      border: 'none' },
                { bg: 'var(--accent)',  label: 'Current',       border: 'none' },
                { bg: '#8b5cf6',        label: 'Marked Review', border: 'none' },
                { bg: 'var(--surface2)', label: 'Not Answered', border: '1px solid var(--border)' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, background: l.bg, border: l.border, flexShrink: 0 }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Question palette by section */}
          {sections.map(sec => {
            const secQs = getSectionQs(sec)
            const stats = sectionStats.find(s => s.sec === sec)
            return (
              <div key={sec} style={{ borderBottom: '1px solid var(--border)' }}>
                <div style={{ padding: '7px 12px', background: 'linear-gradient(90deg, #0f1e3d, #162d52)', color: 'white', fontSize: 10, fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{sec}</span>
                  <span style={{ background: 'rgba(255,255,255,.15)', borderRadius: 5, padding: '1px 6px', fontSize: 9 }}>{stats?.answered}/{stats?.total}</span>
                </div>
                <div style={{ padding: '8px 10px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                  {secQs.map(sq => {
                    const gi       = testQuestions.indexOf(sq)
                    const isDone   = answers[gi] !== undefined
                    const isMark   = marked[gi]
                    const isCurr   = gi === currentQ
                    const localNum = secQs.indexOf(sq) + 1
                    let bg = 'var(--surface2)', border = 'var(--border)', color = 'var(--muted)'
                    if (isCurr)      { bg = 'var(--accent)'; border = 'var(--accent)'; color = 'white' }
                    else if (isMark) { bg = '#8b5cf6'; border = '#8b5cf6'; color = 'white' }
                    else if (isDone) { bg = 'var(--green)'; border = 'var(--green)'; color = 'white' }
                    return (
                      <button key={gi} onClick={() => goToQ(gi)}
                        className="mock-pal-btn"
                        style={{ width: '100%', aspectRatio: '1', borderRadius: 5, border: `1.5px solid ${border}`, background: bg, color, fontSize: 10, fontWeight: 800, cursor: 'pointer', padding: 0, boxShadow: isCurr ? '0 2px 8px rgba(249,115,22,.4)' : 'none' }}>
                        {localNum}
                      </button>
                    )
                  })}
                </div>
                <div style={{ padding: '3px 12px 8px', display: 'flex', gap: 10, fontSize: 9, fontWeight: 700 }}>
                  <span style={{ color: 'var(--green)' }}>✓ {stats?.answered}</span>
                  <span style={{ color: 'var(--red)' }}>✗ {stats?.notAnsw}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── RIGHT: QUESTION AREA ── */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', WebkitOverflowScrolling: 'touch' }} className="no-scroll">

          {/* Question header */}
          <div style={{ flexShrink: 0, background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '9px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', background: 'var(--surface2)', padding: '3px 10px', borderRadius: 8 }}>Q {currentQ + 1} / {testQuestions.length}</span>
              {q.sectionName && <span style={{ fontSize: 10, padding: '2px 9px', background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.2)', borderRadius: 6, color: '#3b82f6', fontWeight: 700 }}>{q.sectionName}</span>}
              {q.subtopic && <span style={{ fontSize: 10, color: 'var(--muted)', padding: '2px 9px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, fontWeight: 600 }}>{q.subtopic}</span>}
              {marked[currentQ] && <span style={{ fontSize: 10, padding: '2px 9px', background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 6, color: '#8b5cf6', fontWeight: 700 }}>🔖 Marked</span>}
            </div>
            <button onClick={() => setMarked(prev => ({ ...prev, [currentQ]: !prev[currentQ] }))}
              style={{ padding: '5px 11px', borderRadius: 8, border: `1.5px solid ${marked[currentQ] ? '#8b5cf6' : 'var(--border)'}`, background: marked[currentQ] ? 'rgba(139,92,246,.1)' : 'var(--surface2)', color: marked[currentQ] ? '#8b5cf6' : 'var(--muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
              {marked[currentQ] ? '🔖 Marked' : '🔖 Mark'}
            </button>
          </div>

          {/* Question content */}
          <div style={{ flex: 1, padding: 'clamp(12px,3vw,18px) clamp(12px,3vw,18px) 100px', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }} className="no-scroll">

            {/* Question card */}
            <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 14, padding: 'clamp(14px,3vw,20px)', marginBottom: 14 }}>
              <p style={{ fontSize: 'clamp(14px,3.5vw,16px)', lineHeight: 1.8, fontWeight: 500, margin: 0, color: 'var(--text)', wordBreak: 'break-word' }}>{q.question}</p>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {q.options?.map((opt, oi) => {
                const isSel = answers[currentQ] === oi
                const label = ['A','B','C','D'][oi]
                return (
                  <div key={oi} onClick={() => setAnswers(prev => ({ ...prev, [currentQ]: oi }))}
                    className="mock-option"
                    style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 'clamp(11px,2.5vw,14px) clamp(12px,3vw,16px)', borderRadius: 12, border: `2px solid ${isSel ? 'var(--accent)' : 'var(--border)'}`, background: isSel ? 'rgba(249,115,22,.07)' : 'var(--surface)', cursor: 'pointer', transition: 'all 0.12s', userSelect: 'none', boxShadow: isSel ? '0 0 0 3px rgba(249,115,22,.1)' : 'none' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, border: `2px solid ${isSel ? 'var(--accent)' : 'var(--border)'}`, background: isSel ? 'var(--accent)' : 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s', fontSize: 11, fontWeight: 900, color: isSel ? 'white' : 'var(--muted)' }}>
                      {label}
                    </div>
                    <span style={{ fontSize: 'clamp(13px,3.5vw,14px)', lineHeight: 1.7, color: isSel ? 'var(--accent)' : 'var(--text)', fontWeight: isSel ? 600 : 400, flex: 1 }}>{opt}</span>
                  </div>
                )
              })}
            </div>

            {/* Clear answer */}
            {answers[currentQ] !== undefined && (
              <button onClick={() => setAnswers(prev => { const n = {...prev}; delete n[currentQ]; return n })}
                style={{ marginTop: 12, padding: '7px 14px', borderRadius: 8, border: '1.5px solid rgba(239,68,68,.3)', background: 'rgba(239,68,68,.06)', color: 'var(--red)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                ✕ Clear Answer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--surface)', borderTop: '1.5px solid var(--border)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, zIndex: 10, boxShadow: '0 -4px 16px rgba(0,0,0,.1)' }}>

        {/* Previous */}
        <button disabled={currentQ === 0} onClick={() => goToQ(currentQ - 1)}
          style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${currentQ === 0 ? 'var(--border)' : 'var(--border)'}`, background: currentQ === 0 ? 'var(--surface2)' : 'var(--surface)', color: currentQ === 0 ? 'var(--muted)' : 'var(--text)', fontSize: 13, fontWeight: 700, cursor: currentQ === 0 ? 'not-allowed' : 'pointer', minWidth: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, opacity: currentQ === 0 ? 0.4 : 1 }}>
          ← Prev
        </button>

        {/* Mobile palette button */}
        <button onClick={() => setShowPalette(p => !p)}
          style={{ padding: '9px 12px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
          className="mock-palette-mobile-btn">
          🔢 <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 800 }}>{answered}/{testQuestions.length}</span>
        </button>

        {/* Next / Submit */}
        {currentQ === testQuestions.length - 1 ? (
          <button onClick={() => setShowSubmitModal(true)}
            style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,.3)', minWidth: 100 }}>
            Submit ✓
          </button>
        ) : (
          <button onClick={() => goToQ(currentQ + 1)}
            style={{ padding: '10px 18px', borderRadius: 10, background: 'linear-gradient(135deg, var(--accent), #ea580c)', border: 'none', color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer', minWidth: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, boxShadow: '0 4px 12px rgba(249,115,22,.3)' }}>
            Save & Next →
          </button>
        )}
      </div>

      {/* ── MOBILE PALETTE OVERLAY ── */}
      {showPalette && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(3px)' }} onClick={() => setShowPalette(false)}>
          <div style={{ width: 270, maxWidth: '85vw', background: 'var(--surface)', overflowY: 'auto', boxShadow: '6px 0 32px rgba(0,0,0,.2)' }} className="no-scroll" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ padding: '14px 16px', background: 'linear-gradient(90deg, #0f1e3d, #162d52)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>Question Palette</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', marginTop: 1 }}>{answered}/{testQuestions.length} answered</div>
              </div>
              <button onClick={() => setShowPalette(false)} style={{ background: 'rgba(255,255,255,.12)', border: 'none', color: 'white', width: 28, height: 28, borderRadius: 8, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* Legend */}
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { bg: 'var(--green)',    label: 'Done'    },
                { bg: 'var(--accent)',   label: 'Current' },
                { bg: '#8b5cf6',         label: 'Marked'  },
                { bg: 'var(--surface2)', label: 'Pending', border: 'var(--border)' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: l.bg, border: l.border ? `1px solid ${l.border}` : 'none', flexShrink: 0 }} />
                  {l.label}
                </div>
              ))}
            </div>

            {/* Sections */}
            {sections.map(sec => {
              const secQs = getSectionQs(sec)
              const stats = sectionStats.find(s => s.sec === sec)
              return (
                <div key={sec} style={{ borderBottom: '1px solid var(--border)' }}>
                  <div style={{ padding: '8px 14px', background: 'linear-gradient(90deg, #0f1e3d, #162d52)', color: 'white', fontSize: 10, fontWeight: 800, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{sec}</span>
                    <span style={{ background: 'rgba(255,255,255,.15)', borderRadius: 5, padding: '1px 6px', fontSize: 9 }}>{stats?.answered}/{stats?.total}</span>
                  </div>
                  <div style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 5 }}>
                    {secQs.map(sq => {
                      const gi = testQuestions.indexOf(sq)
                      const isDone = answers[gi] !== undefined, isMark = marked[gi], isCurr = gi === currentQ
                      const localNum = secQs.indexOf(sq) + 1
                      let bg = 'var(--surface2)', border = 'var(--border)', color = 'var(--muted)'
                      if (isCurr)      { bg = 'var(--accent)'; border = 'var(--accent)'; color = 'white' }
                      else if (isMark) { bg = '#8b5cf6'; border = '#8b5cf6'; color = 'white' }
                      else if (isDone) { bg = 'var(--green)'; border = 'var(--green)'; color = 'white' }
                      return (
                        <button key={gi} onClick={() => { goToQ(gi); setShowPalette(false) }}
                          className="mock-pal-btn"
                          style={{ width: '100%', aspectRatio: '1', borderRadius: 6, border: `1.5px solid ${border}`, background: bg, color, fontSize: 10, fontWeight: 800, cursor: 'pointer', padding: 0 }}>
                          {localNum}
                        </button>
                      )
                    })}
                  </div>
                  <div style={{ padding: '3px 14px 8px', display: 'flex', gap: 10, fontSize: 10, fontWeight: 700 }}>
                    <span style={{ color: 'var(--green)' }}>✓ {stats?.answered} Done</span>
                    <span style={{ color: 'var(--red)' }}>✗ {stats?.notAnsw} Left</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* —— Submit Confirmation Modal —— */}
      {showSubmitModal && (() => {
        const total       = testQuestions.length
        const attempted   = Object.keys(answers).length
        const unattempted = total - attempted
        const markedCount = Object.keys(marked).length
        return (
          <div onClick={() => setShowSubmitModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 16, padding: '28px 24px', maxWidth: 380, width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(249,115,22,0.15)', border: '2px solid rgba(249,115,22,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 12px' }}>📝</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Submit Exam?</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>This action cannot be undone</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 22 }}>
                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#22c55e' }}>{attempted}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>ATTEMPTED</div>
                </div>
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#ef4444' }}>{unattempted}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>SKIPPED</div>
                </div>
                <div style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#f97316' }}>{markedCount}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>MARKED</div>
                </div>
              </div>
              {unattempted > 0 && (
                <div style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>⚠️</span>
                  <span style={{ fontSize: 12, color: '#ca8a04', fontWeight: 600 }}>{unattempted} question{unattempted > 1 ? 's' : ''} still unattempted. You can go back and attempt them.</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowSubmitModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'var(--surface2)', border: '1.5px solid var(--border)', color: 'var(--text)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  ← Go Back
                </button>
                <button onClick={() => { setShowSubmitModal(false); handleSubmit(false) }} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.35)' }}>
                  Submit ✓
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}