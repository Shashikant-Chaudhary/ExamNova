// ─────────────────────────────────────────────
// MockHistoryScreen.jsx
// Analytics view for all mock test history
// Comparison across attempts of same paper
// Works with new mockPaperId system
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { getMockHistory, getMockResultWithQuestions } from '../services/storageService'
import CUTOFFS from '../data/cutoffs'

const EXAMS = [
  'SSC CGL', 'SSC CHSL', 'SSC MTS', 'SSC GD',
  'RRB NTPC', 'RRB Group D', 'RRB ALP',
  'IBPS PO', 'IBPS Clerk', 'SBI PO', 'SBI Clerk',
  'UPSC Prelims', 'UPSC CDS', 'State PSC',
]

export default function MockHistoryScreen({ user, navigate, language }) {

  const [selectedExam,   setSelectedExam]   = useState(null)
  const [history,        setHistory]        = useState([])
  const [loading,        setLoading]        = useState(false)
  const [activeTest,     setActiveTest]     = useState(null)
  const [fullTest,       setFullTest]       = useState(null)   // test with questions loaded
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [activeTab,      setActiveTab]      = useState('analytics') // analytics | list
  const [retryMode,      setRetryMode]      = useState(false)
  const [retryQuestion,  setRetryQuestion]  = useState(0)
  const [retryAnswers,   setRetryAnswers]   = useState({})
  const [retryRevealed,  setRetryRevealed]  = useState({})
  const [retryDone,      setRetryDone]      = useState(false)

  useEffect(() => {
    if (selectedExam) loadHistory()
  }, [selectedExam])

  // load questions when opening a test for review
  useEffect(() => {
    if (!activeTest) { setFullTest(null); return }
    setQuestionsLoading(true)
    getMockResultWithQuestions(activeTest).then(full => {
      setFullTest(full)
      setQuestionsLoading(false)
    }).catch(() => { setFullTest(activeTest); setQuestionsLoading(false) })
  }, [activeTest])

  const loadHistory = async () => {
    setLoading(true)
    setActiveTest(null)
    setFullTest(null)
    const results = await getMockHistory(selectedExam)
    setHistory(results)
    setLoading(false)
  }

  const formatDate  = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const formatTime  = (secs) => { const m = Math.floor(secs/60).toString().padStart(2,'0'); const s = (secs%60).toString().padStart(2,'0'); return `${m}:${s}` }
  const scoreColor  = (p) => p >= 70 ? 'var(--green)' : p >= 50 ? 'var(--accent)' : 'var(--red)'
  const scoreBg     = (p) => p >= 70 ? 'rgba(34,197,94,.1)' : p >= 50 ? 'rgba(245,158,11,.1)' : 'rgba(239,68,68,.1)'

  const paperLabel  = (test) => test?.mockPaperId?.includes('__mix')
    ? '🎲 Random Mix'
    : `Mock Paper #${test?.mockPaperId?.split('__').pop() || '?'}`

  // group history by mockPaperId for comparison
  const grouped = history.reduce((acc, test) => {
    const key = test.mockPaperId || 'unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(test)
    return acc
  }, {})

  const getWrongQuestions = () => {
    if (!fullTest?.questions) return []
    return fullTest.questions.filter(q => q.userAnswer !== q.correct && q.userAnswer !== null)
  }

  const startRetry = () => {
    setRetryMode(true); setRetryQuestion(0)
    setRetryAnswers({}); setRetryRevealed({}); setRetryDone(false)
    window.scrollTo(0, 0)
  }

  const wrongQuestions = fullTest ? getWrongQuestions() : []

  // ── RETRY DONE ──
  if (retryMode && retryDone) {
    const correct = wrongQuestions.filter((q, i) => retryAnswers[i] === q.correct).length
    const pct     = Math.round((correct / wrongQuestions.length) * 100)
    return (
      <div className="page" style={{ maxWidth: 600, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Retry Complete!</h2>
        <div style={{ fontSize: 48, fontWeight: 800, color: scoreColor(pct), marginBottom: 8 }}>{pct}%</div>
        <p style={{ color: 'var(--muted2)', marginBottom: 24 }}>{correct} out of {wrongQuestions.length} correct this time</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={startRetry}>Retry Again</button>
          <button className="btn btn-ghost" onClick={() => setRetryMode(false)}>Back to Review</button>
        </div>
      </div>
    )
  }

  // ── RETRY MODE ──
  if (retryMode && !retryDone) {
    const q          = wrongQuestions[retryQuestion]
    const isAnswered = retryRevealed[retryQuestion]
    const userAnswer = retryAnswers[retryQuestion]
    return (
      <div className="page" style={{ maxWidth: 760 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button className="btn btn-ghost" onClick={() => setRetryMode(false)}>← Back to Review</button>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Retry Wrong — {retryQuestion+1}/{wrongQuestions.length}</div>
        </div>
        <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((retryQuestion+1)/wrongQuestions.length)*100}%`, background: 'var(--accent)', borderRadius: 2 }} />
        </div>
        {q.sectionName && <div style={{ marginBottom: 12 }}><span className="tag tag-orange">{q.sectionName}</span></div>}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <p style={{ fontSize: 16, lineHeight: 1.7, fontWeight: 500 }}>{q.question}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {q.options.map((opt, oi) => {
            let border = 'var(--border)', bg = 'var(--surface)', col = 'var(--text)'
            if (isAnswered) {
              if (oi === q.correct)    { border = 'var(--green)'; bg = 'rgba(34,197,94,.08)'; col = 'var(--green)' }
              else if (oi === userAnswer) { border = 'var(--red)'; bg = 'rgba(239,68,68,.08)'; col = 'var(--red)' }
            }
            return (
              <div key={oi} onClick={() => { if (!isAnswered) { setRetryAnswers(p => ({...p,[retryQuestion]:oi})); setRetryRevealed(p => ({...p,[retryQuestion]:true})) } }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 10, border: `1px solid ${border}`, background: bg, color: col, cursor: isAnswered ? 'default' : 'pointer', transition: 'all 0.15s' }}>
                <span style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, color: 'var(--muted2)' }}>{['A','B','C','D'][oi]}</span>
                <span style={{ fontSize: 14, lineHeight: 1.5 }}>{opt}</span>
              </div>
            )
          })}
        </div>
        {isAnswered && q.explanation && (
          <div style={{ background: 'rgba(34,197,94,.05)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 10, padding: '14px 18px', marginBottom: 24 }}>
            <div style={{ color: 'var(--green)', fontWeight: 700, fontSize: 14, marginBottom: 10 }}>📖 Explanation</div>
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{q.explanation}</div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn btn-ghost" onClick={() => setRetryQuestion(r => r-1)} disabled={retryQuestion === 0}>← Previous</button>
          {retryQuestion === wrongQuestions.length - 1
            ? <button className="btn btn-primary" onClick={() => setRetryDone(true)}>Finish Retry ✓</button>
            : <button className="btn btn-primary" onClick={() => setRetryQuestion(r => r+1)}>Next →</button>
          }
        </div>
      </div>
    )
  }

  // ── TEST DETAIL VIEW ──
  if (activeTest) {
    const cd           = CUTOFFS[activeTest.exam]
    const prevCutoff   = cd?.previousYear?.cutoffs?.[activeTest.category] || 0
    const expCutoff    = cd?.expectedCurrentYear?.cutoffs?.[activeTest.category] || 0
    const totalMarks   = cd?.totalMarks || 100
    const userMarks    = Math.round((activeTest.percent / 100) * totalMarks)
    const qualifyExp   = userMarks >= expCutoff

    // all attempts of same paper for comparison
    const sameAttempts = (grouped[activeTest.mockPaperId] || []).sort((a,b) => new Date(a.date) - new Date(b.date))

    return (
      <div className="page" style={{ maxWidth: 800 }}>
        <button className="btn btn-ghost" style={{ marginBottom: 20 }} onClick={() => setActiveTest(null)}>← Back to History</button>

        {/* Header */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{activeTest.exam} · {paperLabel(activeTest)}</h1>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>
              {formatDate(activeTest.date)} · {activeTest.level === 'hard' ? 'Hard Level' : 'Standard Level'} · {activeTest.category}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: scoreColor(activeTest.percent) }}>{activeTest.percent}%</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>{activeTest.score?.toFixed(1)}/{activeTest.maxScore} marks</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Correct', val: activeTest.correct || 0, col: 'var(--green)' },
            { label: 'Wrong',   val: activeTest.wrong || 0,   col: 'var(--red)'   },
            { label: 'Skipped', val: activeTest.skipped || 0, col: 'var(--muted)' },
            { label: 'Time',    val: formatTime(activeTest.timeTaken || 0), col: 'var(--accent)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.col }}>{s.val}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Same paper comparison */}
        {sameAttempts.length >= 2 && (
          <div style={{ background: 'var(--surface)', border: '1.5px solid rgba(59,130,246,.3)', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)', marginBottom: 14 }}>
              📊 All Attempts — {paperLabel(activeTest)}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(sameAttempts.length, 4)}, 1fr)`, gap: 8 }}>
              {sameAttempts.slice(-4).map((attempt, i) => {
                const isThis = attempt.id === activeTest.id
                const prev   = i > 0 ? sameAttempts.slice(-4)[i-1] : null
                const diff   = prev ? attempt.percent - prev.percent : null
                return (
                  <div key={attempt.id} style={{ background: isThis ? scoreBg(attempt.percent) : 'var(--surface2)', border: `1.5px solid ${isThis ? scoreColor(attempt.percent) : 'var(--border)'}`, borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4, fontWeight: 700 }}>
                      Attempt {sameAttempts.indexOf(attempt)+1}{isThis ? ' ✦' : ''}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: scoreColor(attempt.percent) }}>{attempt.percent}%</div>
                    {diff !== null && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: diff > 0 ? 'var(--green)' : diff < 0 ? 'var(--red)' : 'var(--muted)', marginTop: 4 }}>
                        {diff > 0 ? `▲ +${diff}` : diff < 0 ? `▼ ${diff}` : '→ same'}
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{formatDate(attempt.date)}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Cutoff */}
        {cd && (
          <div style={{ background: 'var(--surface)', border: `2px solid ${qualifyExp ? 'var(--green)' : 'var(--red)'}`, borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: qualifyExp ? 'var(--green)' : 'var(--red)', marginBottom: 8 }}>
              {qualifyExp ? '✅ Would have qualified!' : `❌ ${expCutoff - userMarks} marks below expected cutoff`}
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--muted)', flexWrap: 'wrap' }}>
              <span>Your score: <strong style={{ color: 'var(--text)' }}>{userMarks}/{totalMarks}</strong></span>
              <span>{cd.previousYear.year} cutoff: <strong style={{ color: 'var(--text)' }}>{prevCutoff}</strong></span>
              <span>{cd.expectedCurrentYear.year} expected: <strong style={{ color: 'var(--text)' }}>{expCutoff}</strong></span>
            </div>
          </div>
        )}

        {/* Section wise */}
        {activeTest.sections?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={styles.sectionTitle}>Section Wise Performance</h2>
            <div style={styles.sectionGrid}>
              {activeTest.sections.map(s => (
                <div key={s.name} style={styles.sectionCard}>
                  <div style={styles.sectionName}>{s.name}</div>
                  <div style={{ ...styles.sectionScore, color: scoreColor(s.percent) }}>{s.raw}/{s.total}</div>
                  <div style={styles.sectionBar}>
                    <div style={{ ...styles.sectionBarFill, width: `${s.percent}%`, background: scoreColor(s.percent) }} />
                  </div>
                  <div style={styles.sectionMeta}>✓{s.correct} ✗{s.wrong} —{s.skipped} · {s.percent}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Retry wrong */}
        {!questionsLoading && wrongQuestions.length > 0 && (
          <div style={{ background: 'rgba(249,115,22,.06)', border: '1px solid rgba(249,115,22,.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>🔄 Retry Wrong Questions</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>You got {wrongQuestions.length} questions wrong</div>
            </div>
            <button className="btn btn-primary" onClick={startRetry}>Start Retry</button>
          </div>
        )}

        {/* Answer review */}
        <h2 style={styles.sectionTitle}>Answer Review</h2>
        {questionsLoading ? (
          <div style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : !fullTest?.questions ? (
          <div style={{ color: 'var(--muted)', fontSize: 13, padding: 20, textAlign: 'center' }}>Question data not available for this attempt.</div>
        ) : (
          fullTest.questions.map((q, i) => {
            const isCorrect = q.userAnswer === q.correct
            const answered  = q.userAnswer !== null && q.userAnswer !== undefined
            return (
              <div key={i} style={{ background: 'var(--surface)', border: `1px solid ${answered ? isCorrect ? 'var(--green)' : 'var(--red)' : 'var(--border)'}`, borderRadius: 12, padding: 16, marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, background: !answered ? 'var(--surface2)' : isCorrect ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)', color: !answered ? 'var(--muted)' : isCorrect ? 'var(--green)' : 'var(--red)' }}>{i+1}</span>
                  <div style={{ flex: 1 }}>
                    {q.sectionName && <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 4 }}>{q.sectionName}</div>}
                    <span style={{ fontSize: 14, lineHeight: 1.6 }}>{q.question}</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: q.explanation ? 10 : 0 }}>
                  {q.options?.map((opt, oi) => (
                    <div key={oi} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 10px', borderRadius: 6, border: `1px solid ${oi === q.correct ? 'var(--green)' : oi === q.userAnswer && !isCorrect ? 'var(--red)' : 'var(--border)'}`, background: oi === q.correct ? 'rgba(34,197,94,.08)' : oi === q.userAnswer && !isCorrect ? 'rgba(239,68,68,.08)' : 'transparent', fontSize: 12, color: oi === q.correct ? 'var(--green)' : oi === q.userAnswer && !isCorrect ? 'var(--red)' : 'var(--muted2)' }}>
                      <span style={{ fontWeight: 700, flexShrink: 0 }}>{['A','B','C','D'][oi]}</span>{opt}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, padding: '10px 14px', background: 'rgba(34,197,94,.05)', borderRadius: 8, border: '1px solid rgba(34,197,94,.15)' }}>
                    📖 {q.explanation}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    )
  }

  // ──────────────────────────────────────────
  // MAIN — History + Analytics
  // ──────────────────────────────────────────
  return (
    <div className="page">
      <h1 style={styles.pageTitle}>Mock Test History</h1>
      <p style={styles.pageSub}>Review past tests and track improvement</p>

      {/* Exam selector */}
      <div style={styles.examSelectorBox}>
        <div style={styles.examSelectorLabel}>Select Exam</div>
        <div style={styles.examGrid}>
          {EXAMS.map(exam => (
            <button key={exam}
              style={{ ...styles.examBtn, borderColor: selectedExam === exam ? 'var(--accent)' : 'var(--border)', background: selectedExam === exam ? 'rgba(249,115,22,.1)' : 'var(--surface)', color: selectedExam === exam ? 'var(--accent)' : 'var(--muted2)' }}
              onClick={() => setSelectedExam(exam)}>
              {exam}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ color: 'var(--muted)', marginTop: 12 }}>Loading history...</p>
        </div>
      )}

      {!loading && selectedExam && history.length === 0 && (
        <div style={styles.emptyBox}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
          <h2 style={{ marginBottom: 8 }}>No Mock Tests Yet</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
            You have not taken any mock tests for {selectedExam} yet.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('mock')}>Take Mock Test →</button>
        </div>
      )}

      {!loading && history.length > 0 && (
        <>
          {/* Summary stats */}
          <div style={styles.summaryGrid}>
            <div style={styles.summaryCard}>
              <div style={styles.summaryVal}>{history.length}</div>
              <div style={styles.summaryLabel}>Total Tests</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={{ ...styles.summaryVal, color: 'var(--accent)' }}>
                {Math.round(history.reduce((a,t) => a + t.percent, 0) / history.length)}%
              </div>
              <div style={styles.summaryLabel}>Average</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={{ ...styles.summaryVal, color: 'var(--green)' }}>
                {Math.max(...history.map(t => t.percent))}%
              </div>
              <div style={styles.summaryLabel}>Best Score</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={{ ...styles.summaryVal, color: scoreColor(history[0]?.percent) }}>
                {history[0]?.percent}%
              </div>
              <div style={styles.summaryLabel}>Last Score</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
            {[{ id: 'analytics', label: '📊 Analytics' }, { id: 'list', label: '📋 All Tests' }].map(t => (
              <button key={t.id}
                style={{ padding: '10px 20px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: activeTab === t.id ? 700 : 400, borderBottom: `2px solid ${activeTab === t.id ? 'var(--accent)' : 'transparent'}`, color: activeTab === t.id ? 'var(--accent)' : 'var(--muted)', transition: 'all 0.15s' }}
                onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── ANALYTICS TAB ── */}
          {activeTab === 'analytics' && (
            <div>
              {/* Score trend */}
              <div style={styles.graphBox}>
                <h2 style={styles.sectionTitle}>Score Trend (All Tests)</h2>
                <div style={styles.graph}>
                  {[...history].reverse().map((test, i) => (
                    <div key={test.id} style={styles.graphBar}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: scoreColor(test.percent), marginBottom: 2 }}>{test.percent}%</div>
                      <div style={styles.graphBarWrap}>
                        <div style={{ ...styles.graphBarFill, height: `${test.percent}%`, background: scoreColor(test.percent) }} />
                      </div>
                      <div style={styles.graphDate}>{new Date(test.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Per-paper comparison */}
              <h2 style={styles.sectionTitle}>Paper-wise Progress</h2>
              {Object.entries(grouped).map(([pid, attempts]) => {
                const sorted  = [...attempts].sort((a,b) => new Date(a.date) - new Date(b.date))
                const best    = Math.max(...sorted.map(a => a.percent))
                const latest  = sorted[sorted.length - 1]
                const isRandom = pid.includes('__mix')
                const label   = isRandom ? '🎲 Random Mix' : `Mock Paper #${pid.split('__').pop()}`
                const trend   = sorted.length >= 2 ? sorted[sorted.length-1].percent - sorted[0].percent : null

                return (
                  <div key={pid} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{label}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                          {sorted.length} attempt{sorted.length > 1 ? 's' : ''} · Best: <span style={{ color: scoreColor(best), fontWeight: 700 }}>{best}%</span>
                          {trend !== null && (
                            <span style={{ marginLeft: 8, color: trend > 0 ? 'var(--green)' : trend < 0 ? 'var(--red)' : 'var(--muted)', fontWeight: 700 }}>
                              {trend > 0 ? `▲ +${trend}` : trend < 0 ? `▼ ${trend}` : '→ same'} overall
                            </span>
                          )}
                        </div>
                      </div>
                      <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setActiveTest(latest)}>View Latest →</button>
                    </div>

                    {/* Mini comparison bars */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 60 }}>
                      {sorted.map((attempt, i) => (
                        <div key={attempt.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1, cursor: 'pointer' }} onClick={() => setActiveTest(attempt)}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: scoreColor(attempt.percent) }}>{attempt.percent}%</div>
                          <div style={{ width: '100%', height: `${Math.max(attempt.percent * 0.45, 4)}px`, background: scoreColor(attempt.percent), borderRadius: '3px 3px 0 0', opacity: 0.85 }} />
                          <div style={{ fontSize: 8, color: 'var(--muted)' }}>A{i+1}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {/* Section weakness across all tests */}
              {(() => {
                const sectionMap = {}
                history.forEach(test => {
                  (test.sections || []).forEach(s => {
                    if (!sectionMap[s.name]) sectionMap[s.name] = []
                    sectionMap[s.name].push(s.percent)
                  })
                })
                const sectionAvgs = Object.entries(sectionMap).map(([name, scores]) => ({
                  name,
                  avg: Math.round(scores.reduce((a,b) => a+b, 0) / scores.length),
                  tests: scores.length,
                })).sort((a,b) => a.avg - b.avg)

                if (sectionAvgs.length === 0) return null

                return (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
                    <h2 style={{ ...styles.sectionTitle, marginBottom: 16 }}>Section-wise Average</h2>
                    {sectionAvgs.map(s => (
                      <div key={s.name} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600 }}>{s.name}</span>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{s.tests} test{s.tests > 1 ? 's' : ''}</span>
                            <span style={{ fontWeight: 700, color: scoreColor(s.avg) }}>{s.avg}%</span>
                            {s.avg < 50 && <span style={{ fontSize: 10, padding: '1px 6px', background: 'rgba(239,68,68,.1)', color: 'var(--red)', borderRadius: 4, fontWeight: 700 }}>Weak</span>}
                            {s.avg >= 70 && <span style={{ fontSize: 10, padding: '1px 6px', background: 'rgba(34,197,94,.1)', color: 'var(--green)', borderRadius: 4, fontWeight: 700 }}>Strong</span>}
                          </div>
                        </div>
                        <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${s.avg}%`, background: scoreColor(s.avg), borderRadius: 3 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          )}

          {/* ── ALL TESTS TAB ── */}
          {activeTab === 'list' && (
            <div>
              {history.map((test, i) => (
                <div key={test.id} style={styles.testCard} onClick={() => setActiveTest(test)}>
                  <div style={styles.testCardLeft}>
                    <div style={styles.testCardNum}>#{history.length - i}</div>
                    <div>
                      <div style={styles.testCardTitle}>
                        {test.exam} · {paperLabel(test)}
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: test.level === 'hard' ? 'rgba(249,115,22,.1)' : 'rgba(59,130,246,.1)', color: test.level === 'hard' ? 'var(--accent)' : 'var(--blue)', fontWeight: 600 }}>
                          {test.level === 'hard' ? '🔥 Hard' : '⭐ Std'}
                        </span>
                      </div>
                      <div style={styles.testCardMeta}>
                        {formatDate(test.date)} · {test.category} · ⏱ {formatTime(test.timeTaken || 0)}
                      </div>
                    </div>
                  </div>
                  <div style={styles.testCardRight}>
                    <div style={{ ...styles.testCardScore, color: scoreColor(test.percent) }}>{test.percent}%</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{test.score?.toFixed(1)}/{test.maxScore}</div>
                    <span style={{ color: 'var(--muted)', fontSize: 18 }}>→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

const styles = {
  pageTitle:        { fontSize: 28, fontWeight: 700, marginBottom: 6 },
  pageSub:          { fontSize: 14, color: 'var(--muted2)', marginBottom: 24 },
  examSelectorBox:  { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', marginBottom: 24 },
  examSelectorLabel:{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 },
  examGrid:         { display: 'flex', flexWrap: 'wrap', gap: 8 },
  examBtn:          { padding: '6px 14px', borderRadius: 8, border: '1px solid', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.15s' },
  emptyBox:         { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '60px 40px', textAlign: 'center' },
  summaryGrid:      { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 },
  summaryCard:      { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, textAlign: 'center' },
  summaryVal:       { fontSize: 24, fontWeight: 800, marginBottom: 4 },
  summaryLabel:     { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  graphBox:         { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 24 },
  graph:            { display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, paddingBottom: 4, overflowX: 'auto' },
  graphBar:         { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 44, flex: 1, height: '100%', justifyContent: 'flex-end' },
  graphBarWrap:     { width: '100%', height: 70, display: 'flex', alignItems: 'flex-end', background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' },
  graphBarFill:     { width: '100%', borderRadius: 4, transition: 'height 0.3s', minHeight: 4 },
  graphDate:        { fontSize: 9, color: 'var(--muted)', textAlign: 'center' },
  sectionTitle:     { fontSize: 13, fontWeight: 600, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 },
  sectionGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 10, marginBottom: 20 },
  sectionCard:      { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 },
  sectionName:      { fontSize: 12, fontWeight: 600, marginBottom: 6 },
  sectionScore:     { fontSize: 18, fontWeight: 700, marginBottom: 6 },
  sectionBar:       { height: 4, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
  sectionBarFill:   { height: '100%', borderRadius: 2 },
  sectionMeta:      { fontSize: 11, color: 'var(--muted)' },
  testCard:         { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.15s', gap: 12 },
  testCardLeft:     { display: 'flex', alignItems: 'center', gap: 14 },
  testCardNum:      { width: 36, height: 36, borderRadius: 8, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 },
  testCardTitle:    { fontSize: 14, fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  testCardMeta:     { fontSize: 12, color: 'var(--muted)' },
  testCardRight:    { display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 },
  testCardScore:    { fontSize: 20, fontWeight: 800 },
}