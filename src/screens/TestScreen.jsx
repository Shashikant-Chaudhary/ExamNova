// ─────────────────────────────────────────────
// TestScreen.jsx
// AI generates questions based on topic + level
// Friendly errors, real exam feel, govt portal style
// ─────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { generateQuestions }           from '../services/aiService'
import { getQuestionsForTest } from '../services/questionBankService'
import { generateForBank } from '../services/aiService'
import { saveTestResult }              from '../services/storageService'
import ReportButton from '../components/ReportButton'
import ScoreCard   from '../components/ScoreCard'
import { saveBookmark, removeBookmark, checkBookmark } from '../services/bookmarkService'

// ── Auto retry button ──────────────────────────
function RetryButton({ onRetry }) {
  const [retrying, setRetrying] = useState(false)
  return (
    <div style={{ textAlign: 'center' }}>
      {retrying ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', color: 'var(--muted2)', fontSize: 14 }}>
          <div className="spinner" style={{ width: 20, height: 20 }} />
          Trying again...
        </div>
      ) : (
        <button className="btn btn-primary" onClick={() => { setRetrying(true); onRetry() }}>
          Try Again
        </button>
      )}
    </div>
  )
}

// ── Rotating loading messages ──────────────────
function LoadingMessages() {
  const [idx,  setIdx]  = useState(0)
  const [secs, setSecs] = useState(0)

  const messages = [
    '🔍 Checking question bank...',
    '📚 Fetching questions from database...',
    '🤖 AI is generating fresh questions...',
    '✍️ Preparing exam pattern questions...',
    '🎯 Matching difficulty level...',
    '📝 Almost ready...',
    '⚡ Just a few more seconds...',
  ]

  useEffect(() => {
    const t1 = setInterval(() => setIdx(i => (i + 1) % messages.length), 3000)
    const t2 = setInterval(() => setSecs(s => s + 1), 1000)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])

  return (
    <div style={{ textAlign: 'center', marginTop: 20 }}>
      <p style={{ fontSize: 15, color: 'var(--text)', fontWeight: 500, marginBottom: 6, minHeight: 24 }}>
        {messages[idx]}
      </p>
      <p style={{ fontSize: 13, color: 'var(--muted)' }}>
        Time elapsed: {secs}s
      </p>
    </div>
  )
}

// ── Main component ──────────────────────────────
export default function TestScreen({ user, navigate, topic, level, selectedExam, language, onLanguageChange, onLogout }) {

  const [phase,        setPhase]        = useState('loading')
  const [questions,    setQuestions]    = useState([])
  const [current,      setCurrent]      = useState(0)
  const [answers,      setAnswers]      = useState({})
  const [revealed,     setRevealed]     = useState({})
  const [timeLeft,     setTimeLeft]     = useState(600)
  const [error,        setError]        = useState('')
  const [showScoreCard,setShowScoreCard]= useState(false)
  const timerRef   = useRef(null)
  const hasLoaded  = useRef(false)
  const [bookmarked, setBookmarked] = useState({})  // { qIndex: bookmarkId }

  useEffect(() => {
    if (hasLoaded.current) return
    hasLoaded.current = true
    loadQuestions()
    return () => clearInterval(timerRef.current)
  }, [])

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

  const loadQuestions = async () => {
    try {
      setPhase('loading')
      setError('')
      const qs = await getQuestionsForTest({
  exam:      selectedExam || user?.exam,
  topic:     topic?.name,
  subtopics: topic?.subtopics || [],
  level,
  language:  topic?.language || language || 'english',
  count:     10,
  generateFn: generateForBank,
})
      setQuestions(qs)
      setPhase('test')
    } catch (e) {
      setError(e.message === 'RATE_LIMIT' ? 'RATE_LIMIT' : 'ERROR')
      setPhase('loading')
    }
  }

  const toggleBookmark = async (qIndex) => {
    const q = questions[qIndex]
    if (!q) return
    if (bookmarked[qIndex]) {
      await removeBookmark(bookmarked[qIndex])
      setBookmarked(prev => { const n = {...prev}; delete n[qIndex]; return n })
    } else {
      const id = await saveBookmark(q, {
        exam:     selectedExam || user?.exam,
        topic:    topic?.name,
        level,
        language: language || topic?.language || 'english',
      })
      if (id) setBookmarked(prev => ({ ...prev, [qIndex]: id }))
    }
  }

  const selectAnswer = (qIndex, optIndex) => {
    if (revealed[qIndex]) return
    setAnswers(prev  => ({ ...prev, [qIndex]: optIndex }))
    setRevealed(prev => ({ ...prev, [qIndex]: true }))
  }

  const nextQuestion = () => {
    if (current < questions.length - 1) setCurrent(c => c + 1)
    else finishTest()
  }

  const prevQuestion = () => { if (current > 0) setCurrent(c => c - 1) }

  const finishTest = async () => {
    clearInterval(timerRef.current)
    const score = questions.filter((q, i) => answers[i] === q.correct).length
    await saveTestResult({
      exam:      selectedExam || user?.exam,
      topic:     topic?.name,
      subtopic:  topic?.subtopic || null,
      level,
      score,
      total:     questions.length,
      timeTaken: 600 - timeLeft,
    })
    setPhase('result')
    setShowScoreCard(true)
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const scoreColor = (pct) => pct >= 70 ? 'var(--green)' : pct >= 50 ? 'var(--accent)' : 'var(--red)'
  const scoreBg    = (pct) => pct >= 70 ? 'rgba(34,197,94,.1)' : pct >= 50 ? 'rgba(249,115,22,.1)' : 'rgba(239,68,68,.1)'

  // ────────────────────────────────────────────
  // PHASE: LOADING / ERROR
  // ────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 16 }}>

        {error === 'RATE_LIMIT' ? (
          /* ── RATE LIMIT — friendly waiting screen ── */
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 'clamp(28px,5vw,48px)', textAlign: 'center', maxWidth: 480, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>⏳</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
              Preparing Your Questions...
            </h2>
            <p style={{ color: 'var(--muted2)', fontSize: 14, marginBottom: 20, lineHeight: 1.7 }}>
              Our AI is working hard to create fresh questions for you.
              This happens when many students practice at the same time.
              Please wait a moment and try again.
            </p>

            {/* Tips while waiting */}
            <div style={{ background: 'rgba(249,115,22,.06)', border: '1px solid rgba(249,115,22,.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 10 }}>
                ⚡ While you wait:
              </div>
              {[
                'Review your previous answers in My Progress',
                'Check Current Affairs section',
                'Try a different topic first',
                'Practice with real Shift Papers',
              ].map(tip => (
                <div key={tip} style={{ fontSize: 12, color: 'var(--muted2)', marginBottom: 6, display: 'flex', gap: 7 }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>→</span> {tip}
                </div>
              ))}
            </div>

            <RetryButton onRetry={loadQuestions} />
            <button className="btn btn-ghost" style={{ marginTop: 12, display: 'block', margin: '12px auto 0' }} onClick={() => navigate('topics')}>
              ← Back to Topics
            </button>
          </div>

        ) : error === 'ERROR' ? (
          /* ── GENERIC ERROR ── */
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 'clamp(28px,5vw,48px)', textAlign: 'center', maxWidth: 440, width: '100%' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>😕</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>
              Something Went Wrong
            </h2>
            <p style={{ color: 'var(--muted2)', fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
              We couldn't load questions right now. Please check your internet connection and try again.
            </p>
            <RetryButton onRetry={loadQuestions} />
            <button className="btn btn-ghost" style={{ marginTop: 12, display: 'block', margin: '12px auto 0' }} onClick={() => navigate('topics')}>
              ← Back to Topics
            </button>
          </div>

        ) : (
          /* ── NORMAL LOADING ── */
          <div style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>

            {/* Spinner */}
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(249,115,22,.1)', border: '2px solid rgba(249,115,22,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <div className="spinner" style={{ width: 36, height: 36 }} />
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 14 }}>
              Preparing Your Test
            </h2>

            {/* Exam → Topic → Level breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
              <span className="tag tag-orange">{selectedExam || user?.exam}</span>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>→</span>
              <span className="tag tag-blue">{topic?.name}</span>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>→</span>
              <span className={`tag ${level === 'hard' ? 'tag-red' : 'tag-blue'}`}>
                {level === 'hard' ? 'Hard Level' : 'Same Level'}
              </span>
            </div>

            <LoadingMessages />

            <p style={{ marginTop: 20, fontSize: 12, color: 'var(--muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', display: 'inline-block' }}>
              ⏳ Please wait — do not close or refresh this page
            </p>
          </div>
        )}
      </div>
    )
  }

  // ────────────────────────────────────────────
  // PHASE: RESULT
  // ────────────────────────────────────────────
  if (phase === 'result') {
    const score   = questions.filter((q, i) => answers[i] === q.correct).length
    const wrong   = questions.filter((q, i) => answers[i] !== undefined && answers[i] !== q.correct).length
    const skipped = questions.filter((_, i) => answers[i] === undefined).length
    const percent = Math.round((score / questions.length) * 100)

    const resultMsg =
      percent >= 70 ? { text: 'Excellent! You are well prepared on this topic. 🎉', color: 'var(--green)' } :
      percent >= 50 ? { text: 'Good effort! Review the wrong answers below. 👍',    color: 'var(--accent)' } :
                     { text: 'Keep practicing! Focus on the explanations below. 💪', color: 'var(--red)' }

    return (
      <>
        <div className="page" style={{ maxWidth: '720px' }}>
          <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

          {/* ── SCORE CARD ── */}
          <div style={{ background: 'var(--surface)', border: `2px solid ${scoreColor(percent)}`, borderRadius: 16, padding: 'clamp(24px,5vw,40px)', textAlign: 'center', marginBottom: 20, animation: 'fadeUp .3s ease' }}>
            <div style={{ fontSize: 'clamp(52px,10vw,72px)', fontWeight: 800, color: scoreColor(percent), lineHeight: 1, marginBottom: 8 }}>
              {percent}%
            </div>
            <div style={{ fontSize: 18, color: 'var(--muted2)', marginBottom: 6 }}>
              {score} out of {questions.length} correct
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
              {topic?.name} · {level === 'hard' ? 'Hard Level' : 'Same Level'} · Time: {formatTime(600 - timeLeft)}
            </div>
            <p style={{ color: resultMsg.color, fontSize: 14, fontWeight: 600 }}>{resultMsg.text}</p>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { val: score,   label: 'Correct', color: 'var(--green)' },
              { val: wrong,   label: 'Wrong',   color: 'var(--red)'   },
              { val: skipped, label: 'Skipped', color: 'var(--muted)' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginBottom: 3 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 36 }}>
            <button className="btn btn-primary" onClick={loadQuestions}>
              Retry New Questions
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('topics')}>
              ← Topics
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('dashboard')}>
              My Progress 📊
            </button>
            <button
              style={{ padding: '10px 16px', borderRadius: 8, background: 'rgba(249,115,22,.1)', border: '1px solid rgba(249,115,22,.3)', color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              onClick={() => setShowScoreCard(true)}
            >
              🚀 Share Score
            </button>
          </div>

          {/* ── ANSWER REVIEW ── */}
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>
            Answer Review
          </div>

          {questions.map((q, i) => {
            const userAnswer  = answers[i]
            const isCorrect   = userAnswer === q.correct
            const wasAnswered = userAnswer !== undefined
            const borderColor = !wasAnswered ? 'var(--border)' : isCorrect ? 'var(--green)' : 'var(--red)'

            return (
              <div key={i} style={{ background: 'var(--surface)', border: `1px solid ${borderColor}`, borderRadius: 12, padding: 20, marginBottom: 12 }}>

                {/* Q number + status */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, background: !wasAnswered ? 'var(--surface2)' : isCorrect ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)', color: !wasAnswered ? 'var(--muted)' : isCorrect ? 'var(--green)' : 'var(--red)' }}>
                    {!wasAnswered ? i+1 : isCorrect ? '✓' : '✗'}
                  </div>
                  <span style={{ fontSize: 14, lineHeight: 1.6, fontWeight: 500 }}>{q.question}</span>
                </div>

                {/* Options */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 8, marginBottom: 14 }}>
                  {q.options.map((opt, oi) => {
                    const isCorrectOpt = oi === q.correct
                    const isUserWrong  = oi === userAnswer && !isCorrect
                    return (
                      <div key={oi} style={{
                        display: 'flex', gap: 10, alignItems: 'center',
                        padding: '8px 12px', borderRadius: 8, border: '1px solid',
                        fontSize: 13,
                        background: isCorrectOpt ? 'rgba(34,197,94,.08)' : isUserWrong ? 'rgba(239,68,68,.08)' : 'transparent',
                        borderColor: isCorrectOpt ? 'var(--green)' : isUserWrong ? 'var(--red)' : 'var(--border)',
                        color: isCorrectOpt ? 'var(--green)' : isUserWrong ? 'var(--red)' : 'var(--muted2)',
                      }}>
                        <span style={{ width: 24, height: 24, borderRadius: 5, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, color: 'var(--muted2)' }}>
                          {['A','B','C','D'][oi]}
                        </span>
                        {opt}
                        {isCorrectOpt && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700 }}>✓</span>}
                      </div>
                    )
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div style={{ background: 'rgba(34,197,94,.05)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 10, padding: '12px 16px' }}>
                    <div style={{ color: 'var(--green)', fontWeight: 700, fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      📖 Explanation
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                      {q.explanation}
                    </div>
                  </div>
                )}

              </div>
            )
          })}

        </div>

        {/* Score card share overlay */}
        {showScoreCard && (() => {
          const sc = questions.filter((q, i) => answers[i] === q.correct).length
          const sw = questions.filter((q, i) => answers[i] !== undefined && answers[i] !== q.correct).length
          const su = questions.filter((_, i) => answers[i] === undefined).length
          return (
            <ScoreCard
              userName={user?.displayName || user?.name || 'Student'}
              examName={selectedExam || user?.exam || 'Exam'}
              score={sc}
              totalQuestions={questions.length}
              correct={sc}
              wrong={sw}
              unattempted={su}
              timeTaken={formatTime(600 - timeLeft)}
              rank="Top 15%"
              topic={topic?.name}
              isMockTest={false}
              cutoff={65}
              onClose={() => setShowScoreCard(false)}
            />
          )
        })()}
      </>
    )
  }

  // ────────────────────────────────────────────
  // PHASE: TEST
  // ────────────────────────────────────────────
  const q          = questions[current]
  const isAnswered = revealed[current]
  const userAnswer = answers[current]
  const answered   = Object.keys(answers).length
  const timerColor = timeLeft < 60 ? 'var(--red)' : timeLeft < 180 ? '#f59e0b' : 'var(--text)'
  const timerBg    = timeLeft < 60 ? 'rgba(239,68,68,.08)' : timeLeft < 180 ? 'rgba(245,158,11,.08)' : 'var(--surface)'

  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .opt-row { transition: all 0.12s ease !important; }
        .opt-row:hover { border-color: var(--accent) !important; background: rgba(249,115,22,.04) !important; }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 10, flexWrap: 'wrap' }}>

        {/* Left: exam + topic + level */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minWidth: 0 }}>
          <span className={`tag ${level === 'hard' ? 'tag-red' : 'tag-blue'}`}>
            {level === 'hard' ? 'Hard Level' : 'Same Level'}
          </span>
          <span style={{ fontSize: 13, color: 'var(--muted2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
            {topic?.name}
          </span>
        </div>

        {/* Right: timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 16, fontWeight: 700, color: timerColor, background: timerBg, border: `1px solid ${timeLeft < 60 ? 'rgba(239,68,68,.3)' : 'var(--border)'}`, borderRadius: 8, padding: '6px 14px', flexShrink: 0, transition: 'all .3s' }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* ── PROGRESS ── */}
      <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 3, marginBottom: 8, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 3, width: `${((current + 1) / questions.length) * 100}%`, transition: 'width .3s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 24 }}>
        <span>Question {current + 1} of {questions.length}</span>
        <span>{answered} answered</span>
      </div>

      {/* ── QUESTION CARD ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 'clamp(18px,4vw,28px)', marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>
        {q.subtopic && (
          <div className="tag tag-orange" style={{ marginBottom: 12 }}>{q.subtopic}</div>
        )}
        <p style={{ fontSize: 'clamp(14px,2.5vw,16px)', lineHeight: 1.75, fontWeight: 500, margin: 0, wordBreak: 'break-word', color: 'var(--text)' }}>
          {q.question}
        </p>
      </div>

      {/* Bookmark + Report row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <button onClick={() => toggleBookmark(current)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: `1px solid ${bookmarked[current] ? 'var(--accent)' : 'var(--border)'}`, background: bookmarked[current] ? 'rgba(249,115,22,.1)' : 'transparent', color: bookmarked[current] ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.15s' }}>
          {bookmarked[current] ? '🔖 Saved' : '🔖 Save'}
        </button>
        <ReportButton
          question={q}
          exam={selectedExam}
          topic={topic?.name}
          level={level}
          language={language}
          bankKey={`${selectedExam}__${topic?.name}__${level}__${language}`.replace(/\s+/g,'_').replace(/[^a-zA-Z0-9_]/g,'_')}
        />
      </div>

      {/* ── OPTIONS ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
        {q.options.map((opt, oi) => {
          let borderColor = 'var(--border)'
          let background  = 'var(--surface)'
          let color       = 'var(--text)'
          let labelBg     = 'var(--surface2)'
          let labelColor  = 'var(--muted2)'

          if (isAnswered) {
            if (oi === q.correct) {
              borderColor = 'var(--green)'; background = 'rgba(34,197,94,.07)'; color = 'var(--green)'; labelBg = 'rgba(34,197,94,.2)'; labelColor = 'var(--green)'
            } else if (oi === userAnswer) {
              borderColor = 'var(--red)'; background = 'rgba(239,68,68,.07)'; color = 'var(--red)'; labelBg = 'rgba(239,68,68,.2)'; labelColor = 'var(--red)'
            }
          }

          return (
            <div key={oi} className={isAnswered ? '' : 'opt-row'}
              style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 18px', borderRadius: 11, border: `1.5px solid ${borderColor}`, background, color, cursor: isAnswered ? 'default' : 'pointer', transition: 'all .12s' }}
              onClick={() => !isAnswered && selectAnswer(current, oi)}
            >
              <span style={{ width: 30, height: 30, borderRadius: 7, background: labelBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, color: labelColor, transition: 'all .12s' }}>
                {['A','B','C','D'][oi]}
              </span>
              <span style={{ fontSize: 'clamp(13px,2vw,14px)', lineHeight: 1.5, fontWeight: isAnswered && oi === q.correct ? 600 : 400 }}>
                {opt}
              </span>
              {isAnswered && oi === q.correct && (
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>✓ Correct</span>
              )}
            </div>
          )
        })}
      </div>

      {/* ── EXPLANATION (after answering) ── */}
      {isAnswered && q.explanation && (
        <div style={{ background: 'rgba(34,197,94,.05)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, animation: 'fadeUp .25s ease' }}>
          <div style={{ color: 'var(--green)', fontWeight: 700, fontSize: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            📖 Explanation
          </div>
          <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
            {q.explanation}
          </div>
        </div>
      )}

      {/* ── NAVIGATION ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <button className="btn btn-ghost" onClick={prevQuestion} disabled={current === 0}>
          ← Previous
        </button>

        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
          {questions.map((_, i) => (
            <div key={i} onClick={() => setCurrent(i)}
              style={{
                width: 10, height: 10, borderRadius: '50%', cursor: 'pointer', transition: 'background .2s',
                background: i === current
                  ? 'var(--accent)'
                  : answers[i] !== undefined
                  ? answers[i] === questions[i].correct ? 'var(--green)' : 'var(--red)'
                  : 'var(--border2)',
              }}
            />
          ))}
        </div>

        {current === questions.length - 1 ? (
          <button className="btn btn-primary" onClick={finishTest}>
            Finish Test ✓
          </button>
        ) : (
          <button className="btn btn-primary" onClick={nextQuestion}>
            Next →
          </button>
        )}
      </div>

    </div>
  )
}