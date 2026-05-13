// ─────────────────────────────────────────────
// SavedQuestionsScreen.jsx
// Shows all bookmarked questions
// Student can practice them again or remove
// v2 — result + review on same page, better UI
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { getBookmarks, removeBookmark } from '../services/bookmarkService'

export default function SavedQuestionsScreen({ user, navigate }) {
  const [bookmarks,    setBookmarks]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [practiceMode, setPracticeMode] = useState(false)
  const [current,      setCurrent]      = useState(0)
  const [answers,      setAnswers]      = useState({})
  const [revealed,     setRevealed]     = useState({})
  const [filter,       setFilter]       = useState('all')

  // viewingReview state removed — review is now inline below result

  useEffect(() => { loadBookmarks() }, [])

  const loadBookmarks = async () => {
    setLoading(true)
    const bms = await getBookmarks()
    setBookmarks(bms)
    setLoading(false)
  }

  const handleRemove = async (id) => {
    await removeBookmark(id)
    setBookmarks(prev => prev.filter(b => b.id !== id))
  }

  const startPractice = () => {
    setAnswers({})
    setRevealed({})
    setCurrent(0)
    setPracticeMode(true)
    window.scrollTo(0, 0)
  }

  const selectAnswer = (idx, optIdx) => {
    if (revealed[idx]) return
    setAnswers(prev  => ({ ...prev, [idx]: optIdx }))
    setRevealed(prev => ({ ...prev, [idx]: true  }))
  }

  const exams    = [...new Set(bookmarks.map(b => b.exam).filter(Boolean))]
  const filtered = filter === 'all' ? bookmarks : bookmarks.filter(b => b.exam === filter)

  const scoreColor = (p) => p >= 70 ? 'var(--green)' : p >= 50 ? 'var(--accent)' : 'var(--red)'
  const scoreBg    = (p) => p >= 70 ? 'rgba(34,197,94,.08)' : p >= 50 ? 'rgba(249,115,22,.08)' : 'rgba(239,68,68,.08)'

  // ── PRACTICE MODE ──
  if (practiceMode) {
    if (filtered.length === 0) { setPracticeMode(false); return null }

    // ── RESULT + INLINE REVIEW ──
    if (current >= filtered.length) {
      const correct = filtered.filter((_, i) => answers[i] === filtered[i].correct).length
      const wrong   = filtered.length - correct
      const pct     = Math.round((correct / filtered.length) * 100)
      const emoji   = pct >= 80 ? '🏆' : pct >= 65 ? '🎉' : pct >= 50 ? '👍' : '💪'

      return (
        <div className="page" style={{ maxWidth: 760 }}>
          <style>{`
            @keyframes fadeUp   { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
            @keyframes scoreIn  { from { transform:scale(0.8); opacity:0 } to { transform:scale(1); opacity:1 } }
            @keyframes fillBar  { from { width:0% } }
            .review-q   { animation: fadeUp 0.3s ease both; }
            .score-card { animation: scoreIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
          `}</style>

          {/* ── RESULT CARD ── */}
          <div className="score-card" style={{ background: 'var(--surface)', border: `1.5px solid ${scoreColor(pct)}30`, borderRadius: 20, overflow: 'hidden', marginBottom: 24 }}>

            {/* Top color strip */}
            <div style={{ height: 4, background: `linear-gradient(90deg, ${scoreColor(pct)}, ${scoreColor(pct)}80)` }} />

            <div style={{ padding: 'clamp(20px,5vw,32px)', textAlign: 'center' }}>

              {/* Emoji + score */}
              <div style={{ fontSize: 52, marginBottom: 8, lineHeight: 1 }}>{emoji}</div>
              <h2 style={{ fontSize: 'clamp(18px,5vw,22px)', fontWeight: 800, marginBottom: 4, color: 'var(--text)' }}>
                Practice Complete!
              </h2>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
                🔖 Saved Questions · {filtered.length} Questions
              </p>

              {/* Big score */}
              <div style={{ display: 'inline-block', background: scoreBg(pct), border: `2px solid ${scoreColor(pct)}30`, borderRadius: 16, padding: '10px 32px', marginBottom: 24 }}>
                <div style={{ fontSize: 'clamp(40px,12vw,56px)', fontWeight: 900, color: scoreColor(pct), lineHeight: 1 }}>{pct}%</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{correct}/{filtered.length} correct</div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, maxWidth: 380, margin: '0 auto 24px' }}>
                {[
                  { label: 'Correct',  labelHi: 'सही',    val: correct,            col: 'var(--green)',  bg: 'rgba(34,197,94,.08)'  },
                  { label: 'Wrong',    labelHi: 'गलत',    val: wrong,              col: 'var(--red)',    bg: 'rgba(239,68,68,.08)'  },
                  { label: 'Accuracy', labelHi: 'सटीकता', val: `${pct}%`,          col: scoreColor(pct), bg: scoreBg(pct)           },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.col}25`, borderRadius: 12, padding: 'clamp(10px,3vw,16px) 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 'clamp(18px,5vw,24px)', fontWeight: 900, color: s.col, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
                    <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 1 }}>{s.labelHi}</div>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden', maxWidth: 380, margin: '0 auto 24px' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${scoreColor(pct)}, ${scoreColor(pct)}cc)`, borderRadius: 4, animation: 'fillBar 0.8s 0.3s ease both' }} />
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={startPractice}>🔄 Practice Again</button>
                <button className="btn btn-ghost" onClick={() => setPracticeMode(false)}>← Back to Saved</button>
              </div>
            </div>
          </div>

          {/* ── INLINE REVIEW — directly below result ── */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 3, height: 18, background: 'var(--accent)', borderRadius: 2 }} />
              <h3 style={{ fontSize: 13, fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text)' }}>
                Answer Review — सभी उत्तर
              </h3>
              <span style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '2px 10px', fontWeight: 600 }}>
                {filtered.length} Questions
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map((q, idx) => {
                const userAnswer  = answers[idx]
                const isCorrect   = userAnswer === q.correct
                const answered    = idx in answers
                const statusColor = isCorrect ? 'var(--green)' : answered ? 'var(--red)' : 'var(--muted)'
                const statusBg    = isCorrect ? 'rgba(34,197,94,.08)' : answered ? 'rgba(239,68,68,.08)' : 'var(--surface2)'

                return (
                  <div key={idx} className="review-q"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `4px solid ${statusColor}`, borderRadius: 14, overflow: 'hidden', animationDelay: `${idx * 0.03}s` }}>

                    {/* Question header */}
                    <div style={{ padding: '12px 16px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Status badge */}
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: statusBg, border: `1.5px solid ${statusColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: statusColor, flexShrink: 0 }}>
                          {isCorrect ? '✓' : answered ? '✗' : '—'}
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>Q{idx + 1}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: statusColor }}>
                            {isCorrect ? 'Correct' : answered ? 'Incorrect' : 'Not Answered'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {q.exam    && <span className="tag tag-orange" style={{ fontSize: 10 }}>{q.exam}</span>}
                        {q.subtopic && <span className="tag tag-blue"   style={{ fontSize: 10 }}>{q.subtopic}</span>}
                      </div>
                    </div>

                    <div style={{ padding: '14px 16px' }}>

                      {/* Question text */}
                      <p style={{ fontSize: 'clamp(13px,2vw,14px)', lineHeight: 1.75, fontWeight: 500, margin: '0 0 14px', color: 'var(--text)' }}>
                        {q.question}
                      </p>

                      {/* Options */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: q.explanation ? 14 : 0 }}>
                        {q.options.map((opt, oi) => {
                          const isUserAns    = oi === userAnswer
                          const isCorrectAns = oi === q.correct
                          let bg = 'var(--surface2)', border = 'var(--border)', col = 'var(--text)'
                          if (isCorrectAns)              { bg = 'rgba(34,197,94,.08)'; border = 'var(--green)'; col = 'var(--green)' }
                          else if (isUserAns && !isCorrect) { bg = 'rgba(239,68,68,.08)'; border = 'var(--red)';   col = 'var(--red)'   }

                          return (
                            <div key={oi} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '9px 13px', borderRadius: 10, background: bg, border: `1.5px solid ${border}` }}>
                              <span style={{ width: 26, height: 26, borderRadius: 6, background: isCorrectAns ? 'var(--green)' : isUserAns && !isCorrect ? 'var(--red)' : 'var(--surface)', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0, color: (isCorrectAns || (isUserAns && !isCorrect)) ? 'white' : 'var(--muted)' }}>
                                {['A','B','C','D'][oi]}
                              </span>
                              <span style={{ fontSize: 'clamp(12px,2vw,13px)', lineHeight: 1.5, flex: 1, color: col, fontWeight: isCorrectAns ? 600 : 400 }}>
                                {opt}
                              </span>
                              {isCorrectAns              && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>✓ Correct</span>}
                              {isUserAns && !isCorrect   && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)',   flexShrink: 0 }}>✗ Your answer</span>}
                            </div>
                          )
                        })}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div style={{ background: 'rgba(34,197,94,.05)', border: '1px solid rgba(34,197,94,.15)', borderRadius: 10, padding: '12px 14px', marginTop: 4 }}>
                          <div style={{ color: 'var(--green)', fontWeight: 700, fontSize: 12, marginBottom: 6 }}>📖 Explanation</div>
                          <div style={{ fontSize: 'clamp(12px,1.8vw,13px)', color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                            {q.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom action */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={startPractice}>🔄 Practice Again</button>
              <button className="btn btn-ghost" onClick={() => setPracticeMode(false)}>← Back to Saved</button>
            </div>
          </div>
        </div>
      )
    }

    // ── QUESTION VIEW ──
    const q          = filtered[current]
    const isAnswered = revealed[current]
    const userAnswer = answers[current]
    const isCorrect  = userAnswer === q.correct

    return (
      <div className="page" style={{ maxWidth: 720 }}>
        <style>{`
          @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
          .opt-row { transition: all 0.12s ease !important; }
          .opt-row:hover { border-color: var(--accent) !important; background: rgba(249,115,22,.04) !important; }
        `}</style>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button className="btn btn-ghost" onClick={() => setPracticeMode(false)}>← Back</button>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>Q{current+1} of {filtered.length}</div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 3, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 3, width: `${((current+1)/filtered.length)*100}%`, transition: 'width .3s' }} />
        </div>

        {/* Meta tags */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {q.exam    && <span className="tag tag-orange">{q.exam}</span>}
          {q.subtopic && <span className="tag tag-blue">{q.subtopic}</span>}
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>🔖 Saved Question</span>
        </div>

        {/* Question */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 'clamp(18px,4vw,28px)', marginBottom: 14 }}>
          <p style={{ fontSize: 'clamp(14px,2.5vw,16px)', lineHeight: 1.75, fontWeight: 500, margin: 0, color: 'var(--text)' }}>
            {q.question}
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          {q.options.map((opt, oi) => {
            let borderColor = 'var(--border)', background = 'var(--surface)', color = 'var(--text)'
            let labelBg = 'var(--surface2)', labelColor = 'var(--muted2)'
            if (isAnswered) {
              if (oi === q.correct) {
                borderColor = 'var(--green)'; background = 'rgba(34,197,94,.07)'; color = 'var(--green)'; labelBg = 'rgba(34,197,94,.2)'; labelColor = 'var(--green)'
              } else if (oi === userAnswer) {
                borderColor = 'var(--red)'; background = 'rgba(239,68,68,.07)'; color = 'var(--red)'; labelBg = 'rgba(239,68,68,.2)'; labelColor = 'var(--red)'
              }
            }
            return (
              <div key={oi}
                className={isAnswered ? '' : 'opt-row'}
                style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 18px', borderRadius: 11, border: `1.5px solid ${borderColor}`, background, color, cursor: isAnswered ? 'default' : 'pointer' }}
                onClick={() => selectAnswer(current, oi)}>
                <span style={{ width: 30, height: 30, borderRadius: 7, background: labelBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, color: labelColor }}>
                  {['A','B','C','D'][oi]}
                </span>
                <span style={{ fontSize: 'clamp(13px,2vw,14px)', lineHeight: 1.5, fontWeight: isAnswered && oi === q.correct ? 600 : 400 }}>{opt}</span>
                {isAnswered && oi === q.correct && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>✓ Correct</span>}
              </div>
            )
          })}
        </div>

        {/* Explanation */}
        {isAnswered && q.explanation && (
          <div style={{ background: 'rgba(34,197,94,.05)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, animation: 'fadeUp .25s ease' }}>
            <div style={{ color: 'var(--green)', fontWeight: 700, fontSize: 14, marginBottom: 10 }}>📖 Explanation</div>
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{q.explanation}</div>
          </div>
        )}

        {/* Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn btn-ghost" onClick={() => setCurrent(c => c-1)} disabled={current === 0}>← Previous</button>
          {current === filtered.length - 1
            ? <button className="btn btn-primary" onClick={() => setCurrent(filtered.length)}>Finish ✓</button>
            : <button className="btn btn-primary" onClick={() => setCurrent(c => c+1)} disabled={!isAnswered}>Next →</button>
          }
        </div>
      </div>
    )
  }

  // ── LIST VIEW ──
  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>🔖 Saved Questions</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>{bookmarks.length} questions saved</p>
        </div>
        {filtered.length > 0 && (
          <button className="btn btn-primary" onClick={startPractice}>Practice All →</button>
        )}
      </div>

      {/* Exam filter */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, marginBottom: 10 }}>Filter by Exam</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setFilter('all')}
            style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${filter === 'all' ? 'var(--accent)' : 'var(--border)'}`, background: filter === 'all' ? 'rgba(249,115,22,.1)' : 'var(--surface2)', color: filter === 'all' ? 'var(--accent)' : 'var(--muted2)', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}>
            All ({bookmarks.length})
          </button>
          {exams.map(e => {
            const count = bookmarks.filter(b => b.exam === e).length
            return (
              <button key={e} onClick={() => setFilter(e)}
                style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${filter === e ? 'var(--accent)' : 'var(--border)'}`, background: filter === e ? 'rgba(249,115,22,.1)' : 'var(--surface2)', color: filter === e ? 'var(--accent)' : 'var(--muted2)', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}>
                {e} ({count})
              </button>
            )
          })}
        </div>
        {exams.length === 0 && <div style={{ fontSize: 12, color: 'var(--muted)' }}>No questions saved yet</div>}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '60px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔖</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No Saved Questions</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
            Tap the bookmark icon on any question while practicing to save it here.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('topics')}>Start Practicing →</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((q, i) => (
            <div key={q.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', animation: `fadeUp 0.3s ease ${i * 0.04}s both` }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                {q.exam    && <span className="tag tag-orange" style={{ fontSize: 11 }}>{q.exam}</span>}
                {q.subtopic && <span className="tag tag-blue"   style={{ fontSize: 11 }}>{q.subtopic}</span>}
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>
                  {new Date(q.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
                <button onClick={() => handleRemove(q.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--muted)', padding: '0 4px' }}
                  title="Remove bookmark">🗑️</button>
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.6, color: 'var(--text)', marginBottom: 10 }}>
                {q.question}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: oi === q.correct ? 'rgba(34,197,94,.1)' : 'var(--surface2)', border: `1px solid ${oi === q.correct ? 'var(--green)' : 'var(--border)'}`, color: oi === q.correct ? 'var(--green)' : 'var(--muted2)', fontWeight: oi === q.correct ? 700 : 400 }}>
                    {['A','B','C','D'][oi]}. {opt} {oi === q.correct ? '✓' : ''}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}