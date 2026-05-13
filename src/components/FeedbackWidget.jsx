import { useState, useEffect, useRef } from 'react'
import {
  sendFeedback, getUserFeedback,
  getUserUnreadCount, markUserFeedbackRead,
} from '../services/feedbackService'

const CATEGORIES = [
  { id: 'bug',        label: 'Bug Report',     emoji: '🐛', color: '#ef4444' },
  { id: 'question',   label: 'Question Issue', emoji: '❓', color: '#f97316' },
  { id: 'suggestion', label: 'Suggestion',     emoji: '💡', color: '#22c55e' },
  { id: 'other',      label: 'Other',          emoji: '💬', color: '#3b82f6' },
]

export default function FeedbackWidget({ user }) {
  const [isOpen,      setIsOpen]      = useState(false)
  const [view,        setView]        = useState('list')
  const [feedbacks,   setFeedbacks]   = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading,     setLoading]     = useState(false)
  const [sending,     setSending]     = useState(false)
  const [activeMsg,   setActiveMsg]   = useState(null)
  const [category,    setCategory]    = useState('bug')
  const [message,     setMessage]     = useState('')
  const [sent,        setSent]        = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { loadUnreadCount() }, [])
  useEffect(() => {
    if (isOpen) { loadFeedbacks(); loadUnreadCount() }
  }, [isOpen])
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMsg?.replies?.length])

  const loadUnreadCount = async () => {
    const count = await getUserUnreadCount()
    setUnreadCount(count)
  }

  const loadFeedbacks = async () => {
    setLoading(true)
    const data = await getUserFeedback()
    setFeedbacks(data)
    setLoading(false)
  }

  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)
    await sendFeedback({ category, message: message.trim() })
    setMessage('')
    setSent(true)
    await loadFeedbacks()
    setTimeout(() => { setSent(false); setView('list') }, 2000)
    setSending(false)
  }

  const handleOpenDetail = async (fb) => {
    setActiveMsg(fb)
    setView('detail')
    if (fb.userUnread) {
      await markUserFeedbackRead(fb.id)
      await loadUnreadCount()
      await loadFeedbacks()
    }
  }

  const formatTime = (iso) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = now - d
    if (diff < 60000)    return 'just now'
    if (diff < 3600000)  return `${Math.floor(diff/60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const getCat  = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[3]
  const statCol = (s)  => s === 'resolved' ? '#22c55e' : s === 'replied' ? '#f97316' : '#6b7280'
  const statLbl = (s)  => s === 'resolved' ? 'Resolved' : s === 'replied' ? 'Replied' : 'Open'

  return (
    <>
      {/* ── FLOATING BUTTON ── */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 999 }}>

        {/* Unread badge */}
        {unreadCount > 0 && !isOpen && (
          <div style={{
            position: 'absolute', top: '-5px', right: '-5px',
            background: '#ef4444', color: 'white',
            borderRadius: '50%', width: '18px', height: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: '700', zIndex: 1000,
            border: '2px solid var(--bg)',
          }}>
            {unreadCount}
          </div>
        )}

        <button
          style={{
            width: '46px', height: '46px',
            borderRadius: '50%',
            background: isOpen ? 'var(--surface2)' : 'var(--accent)',
            border: '2px solid var(--border)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
            transition: 'all 0.2s',
          }}
          onClick={() => setIsOpen(p => !p)}
        >
          {isOpen ? '✕' : '💬'}
        </button>
      </div>

      {/* ── PANEL ── */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '76px', right: '20px',
          width: '300px',
          maxHeight: '480px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 998,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            padding: '12px 14px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {view !== 'list' && (
                <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '14px', padding: '0 4px 0 0' }}
                  onClick={() => { setView('list'); setActiveMsg(null) }}>←</button>
              )}
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>
                  {view === 'new' ? '✏️ New Message' : view === 'detail' ? '💬 Conversation' : '💬 Support'}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  We reply within 24 hours
                </div>
              </div>
            </div>
            {view === 'list' && (
              <button
                style={{
                  padding: '4px 10px',
                  background: 'var(--accent)',
                  border: 'none', borderRadius: '6px',
                  color: 'white', fontSize: '11px',
                  fontWeight: '600', cursor: 'pointer',
                }}
                onClick={() => { setView('new'); setSent(false); setMessage('') }}
              >
                + New
              </button>
            )}
          </div>

          {/* ── LIST ── */}
          {view === 'list' && (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <div className="spinner" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Loading...</p>
                </div>
              ) : feedbacks.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>💬</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>No messages yet</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '14px', lineHeight: '1.5' }}>
                    Have a question or feedback?
                  </div>
                  <button
                    style={{ padding: '7px 16px', background: 'var(--accent)', border: 'none', borderRadius: '7px', color: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                    onClick={() => { setView('new'); setSent(false) }}
                  >
                    Send Message
                  </button>
                </div>
              ) : (
                feedbacks.map(fb => {
                  const cat = getCat(fb.category)
                  return (
                    <div key={fb.id}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        background: fb.userUnread ? 'rgba(249,115,22,.04)' : 'transparent',
                      }}
                      onClick={() => handleOpenDetail(fb)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: cat.color }}>
                          {cat.emoji} {cat.label}
                        </span>
                        <span style={{ fontSize: '10px', color: statCol(fb.status), fontWeight: '600' }}>
                          {statLbl(fb.status)}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                        {fb.message}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{formatTime(fb.createdAt)}</span>
                        {fb.userUnread && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* ── NEW MESSAGE ── */}
          {view === 'new' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
              {sent ? (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>✅</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>Sent!</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>We'll reply within 24 hours</div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                      Category
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                      {CATEGORIES.map(c => (
                        <button key={c.id}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '7px',
                            border: '1px solid',
                            borderColor: category === c.id ? c.color : 'var(--border)',
                            background: category === c.id ? `${c.color}12` : 'var(--surface2)',
                            color: category === c.id ? c.color : 'var(--muted)',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: category === c.id ? '700' : '400',
                            textAlign: 'left',
                          }}
                          onClick={() => setCategory(c.id)}
                        >
                          {c.emoji} {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                      Message
                    </div>
                    <textarea
                      style={{
                        width: '100%', height: '100px',
                        padding: '9px 10px',
                        background: 'var(--surface2)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--text)',
                        fontSize: '12px',
                        resize: 'none',
                        boxSizing: 'border-box',
                        lineHeight: '1.5',
                        outline: 'none',
                      }}
                      placeholder="Describe your issue or feedback..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                    />
                  </div>

                  <button
                    style={{
                      width: '100%', padding: '10px',
                      background: message.trim() ? 'var(--accent)' : 'var(--surface2)',
                      border: 'none', borderRadius: '8px',
                      color: message.trim() ? 'white' : 'var(--muted)',
                      fontSize: '13px', fontWeight: '700',
                      cursor: message.trim() ? 'pointer' : 'default',
                    }}
                    onClick={handleSend}
                    disabled={sending || !message.trim()}
                  >
                    {sending ? 'Sending...' : 'Send Message →'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── DETAIL ── */}
          {view === 'detail' && activeMsg && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

                {/* Original message */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ maxWidth: '82%', background: 'var(--accent)', borderRadius: '10px 10px 2px 10px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', marginBottom: '3px' }}>
                      {getCat(activeMsg.category).emoji} {getCat(activeMsg.category).label}
                    </div>
                    <div style={{ fontSize: '12px', color: 'white', lineHeight: '1.5' }}>{activeMsg.message}</div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', marginTop: '3px', textAlign: 'right' }}>
                      {formatTime(activeMsg.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {activeMsg.replies?.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: r.from === 'admin' ? 'flex-start' : 'flex-end', gap: '6px', alignItems: 'flex-end' }}>
                    {r.from === 'admin' && (
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>
                        🛠️
                      </div>
                    )}
                    <div style={{
                      maxWidth: '82%',
                      background: r.from === 'admin' ? 'var(--surface2)' : 'var(--accent)',
                      border: r.from === 'admin' ? '1px solid var(--border)' : 'none',
                      borderRadius: r.from === 'admin' ? '10px 10px 10px 2px' : '10px 10px 2px 10px',
                      padding: '8px 10px',
                    }}>
                      {r.from === 'admin' && (
                        <div style={{ fontSize: '9px', color: 'var(--accent)', fontWeight: '700', marginBottom: '3px' }}>ExamNova Support</div>
                      )}
                      <div style={{ fontSize: '12px', color: r.from === 'admin' ? 'var(--text)' : 'white', lineHeight: '1.5' }}>{r.message}</div>
                      <div style={{ fontSize: '9px', color: r.from === 'admin' ? 'var(--muted)' : 'rgba(255,255,255,0.6)', marginTop: '3px', textAlign: 'right' }}>
                        {formatTime(r.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}

                {activeMsg.status === 'resolved' && (
                  <div style={{ textAlign: 'center', fontSize: '11px', color: '#22c55e', padding: '4px', fontWeight: '600' }}>
                    ✅ This issue has been resolved
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </div>
          )}

        </div>
      )}
    </>
  )
}