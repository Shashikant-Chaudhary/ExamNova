// ─────────────────────────────────────────────
// ReportButton.jsx
// Flag button for reporting questions
// ─────────────────────────────────────────────

import { useState } from 'react'
import { submitReport } from '../services/reportService'

const REASONS = [
  { id: 'wrong_answer',      label: '❌ Wrong Answer',      sub: 'Correct option is marked wrong' },
  { id: 'wrong_explanation', label: '📖 Wrong Explanation', sub: 'Explanation is incorrect'       },
  { id: 'unclear_question',  label: '❓ Unclear Question',  sub: 'Question is confusing/unclear'  },
  { id: 'typo',              label: '✏️ Typo/Spelling',     sub: 'Spelling or grammar error'      },
  { id: 'other',             label: '💬 Other',             sub: 'Something else is wrong'        },
]

export default function ReportButton({ question, exam, topic, level, language, bankKey }) {

  const [showModal, setShowModal] = useState(false)
  const [reason,    setReason]    = useState('')
  const [comment,   setComment]   = useState('')
  const [sending,   setSending]   = useState(false)
  const [sent,      setSent]      = useState(false)

  const handleSubmit = async () => {
    if (!reason) return
    setSending(true)
    await submitReport({
      question:    question.question,
      options:     question.options,
      correct:     question.correct,
      explanation: question.explanation,
      exam, topic, level, language, bankKey,
      reason, comment,
    })
    setSent(true)
    setTimeout(() => {
      setSent(false)
      setShowModal(false)
      setReason('')
      setComment('')
    }, 2000)
    setSending(false)
  }

  return (
    <>
      {/* Flag button */}
      <button
        title="Report this question"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 6px',
          borderRadius: '6px',
          color: 'var(--muted)',
          fontSize: '14px',
          transition: 'all 0.15s',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
        onClick={() => setShowModal(true)}
      >
        🚩
      </button>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: '20px',
        }}
          onClick={() => !sending && setShowModal(false)}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '18px',
              padding: '24px',
              width: '100%', maxWidth: '400px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            }}
            onClick={e => e.stopPropagation()}
          >

            {sent ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: '44px', marginBottom: '12px' }}>✅</div>
                <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
                  Report Submitted!
                </div>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  Thank you! We'll review this question soon.
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
                      🚩 Report Question
                    </h2>
                    <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      Help us improve question quality
                    </p>
                  </div>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '18px' }}
                    onClick={() => setShowModal(false)}
                  >
                    ✕
                  </button>
                </div>

                {/* Question preview */}
                <div style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  marginBottom: '16px',
                  fontSize: '12px',
                  color: 'var(--muted2)',
                  lineHeight: '1.5',
                  maxHeight: '60px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {question.question?.substring(0, 120)}{question.question?.length > 120 ? '...' : ''}
                </div>

                {/* Reasons */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    What's wrong?
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {REASONS.map(r => (
                      <button
                        key={r.id}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1.5px solid',
                          borderColor: reason === r.id ? 'var(--accent)' : 'var(--border)',
                          background: reason === r.id ? 'rgba(249,115,22,.06)' : 'var(--surface2)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                        onClick={() => setReason(r.id)}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: reason === r.id ? '700' : '400', color: reason === r.id ? 'var(--accent)' : 'var(--text)' }}>
                            {r.label}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '1px' }}>
                            {r.sub}
                          </div>
                        </div>
                        {reason === r.id && (
                          <span style={{ color: 'var(--accent)', fontSize: '14px' }}>✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    Additional Comment (Optional)
                  </div>
                  <textarea
                    style={{
                      width: '100%', height: '70px',
                      padding: '9px 10px',
                      background: 'var(--surface2)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text)',
                      fontSize: '12px',
                      resize: 'none',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                    placeholder="Describe the issue in more detail..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                </div>

                {/* Submit */}
                <button
                  style={{
                    width: '100%', padding: '12px',
                    background: reason ? 'var(--accent)' : 'var(--surface2)',
                    border: 'none', borderRadius: '10px',
                    color: reason ? 'white' : 'var(--muted)',
                    fontSize: '14px', fontWeight: '700',
                    cursor: reason ? 'pointer' : 'default',
                    transition: 'all 0.15s',
                  }}
                  onClick={handleSubmit}
                  disabled={!reason || sending}
                >
                  {sending
                    ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <div className="spinner" style={{ width: '16px', height: '16px', borderColor: 'white' }} />
                        Submitting...
                      </span>
                    : 'Submit Report →'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}