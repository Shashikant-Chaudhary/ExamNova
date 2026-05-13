// ─────────────────────────────────────────────
// LeaderboardScreen.jsx
// Exam-wise cumulative points leaderboard
// Search by name, shows user's own rank
// ─────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { getLeaderboard, getMyRank } from '../services/leaderboardService'
import { getRankBadge }              from '../data/pointsConfig'
import MOCK_CONFIG                   from '../data/mockConfig'
import { getProfilePhoto }           from '../services/profileService'

const EXAMS = Object.keys(MOCK_CONFIG)

const TOP3_COLORS = [
  { bg: 'linear-gradient(135deg,#F59E0B22,#F59E0B08)', border: '#F59E0B55', color: '#F59E0B', crown: '🥇' },
  { bg: 'linear-gradient(135deg,#9CA3AF22,#9CA3AF08)', border: '#9CA3AF55', color: '#9CA3AF', crown: '🥈' },
  { bg: 'linear-gradient(135deg,#CD7F3222,#CD7F3208)', border: '#CD7F3255', color: '#CD7F32', crown: '🥉' },
]

// Photo cache shared across all Avatar instances
const leaderPhotoCache = {}

function Avatar({ name, size = 40, color, userId }) {
  const [photo, setPhoto] = useState(leaderPhotoCache[userId] || null)

  useEffect(() => {
    if (!userId || leaderPhotoCache[userId] !== undefined) return
    getProfilePhoto(userId).then(p => {
      leaderPhotoCache[userId] = p || ''
      if (p) setPhoto(p)
    })
  }, [userId])

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
      background: `linear-gradient(135deg, ${color}55, ${color}99)`,
      border: `2px solid ${color}66`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 900, color: '#fff',
    }}>
      {photo
        ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : name?.charAt(0)?.toUpperCase() || '?'
      }
    </div>
  )
}

export default function LeaderboardScreen({ user, navigate }) {
  const [selectedExam, setSelectedExam] = useState(EXAMS[0])
  const [board,        setBoard]        = useState([])
  const [myRank,       setMyRank]       = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')

  useEffect(() => {
    loadData()
  }, [selectedExam])

  const loadData = async () => {
    setLoading(true)
    setSearch('')
    const [boardData, rankData] = await Promise.all([
      getLeaderboard(selectedExam),
      getMyRank(selectedExam),
    ])
    setBoard(boardData)
    setMyRank(rankData)
    setLoading(false)
  }

  const filtered = board.filter(u =>
    u.userName?.toLowerCase().includes(search.toLowerCase())
  )

  const isMe = (u) => u.userId === user?.id

  const scoreColor = (pts) => {
    if (pts >= 50) return '#F59E0B'
    if (pts >= 30) return '#10B981'
    if (pts >= 10) return '#3B82F6'
    return '#9CA3AF'
  }

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <style>{`
        @keyframes lbFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lbPulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes lbShine  { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        .lb-row:hover { background: rgba(255,255,255,0.04) !important; transform: translateX(3px); }
        .lb-exam-btn:hover { border-color: var(--accent) !important; color: var(--accent) !important; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: 28, animation: 'lbFadeUp .4s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, #F59E0B, #EA580C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, boxShadow: '0 6px 20px rgba(245,158,11,0.35)',
          }}>🏆</div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: -0.3 }}>Leaderboard</h1>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, marginTop: 2 }}>
              Cumulative points from all mock tests · per exam
            </p>
          </div>
        </div>
      </div>

      {/* ── EXAM SELECTOR ── */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '16px 18px', marginBottom: 20,
        animation: 'lbFadeUp .4s .06s ease both',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          Select Exam
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {EXAMS.map(exam => (
            <button key={exam} className="lb-exam-btn"
              onClick={() => setSelectedExam(exam)}
              style={{
                padding: '7px 14px', borderRadius: 99,
                border: `1.5px solid ${selectedExam === exam ? 'var(--accent)' : 'var(--border)'}`,
                background: selectedExam === exam ? 'rgba(249,115,22,0.1)' : 'var(--surface2)',
                color: selectedExam === exam ? 'var(--accent)' : 'var(--muted2)',
                fontSize: 12, fontWeight: selectedExam === exam ? 700 : 500,
                cursor: 'pointer', transition: 'all .18s',
              }}>
              {exam}
            </button>
          ))}
        </div>
      </div>

      {/* ── MY RANK CARD ── */}
      {myRank && (
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(249,115,22,0.14), rgba(249,115,22,0.05))',
          border: '1.5px solid rgba(249,115,22,0.35)',
          borderRadius: 16, padding: '16px 18px',
          marginBottom: 20,
          animation: 'lbFadeUp .4s .1s ease both',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '35%', height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.06), transparent)',
            animation: 'lbShine 3s infinite',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'rgba(249,115,22,0.15)', border: '1.5px solid rgba(249,115,22,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 900, color: 'var(--accent)',
            }}>
              #{myRank.rank || '–'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>
                Your Position · {selectedExam}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                  {myRank.totalPoints} pts total
                </span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {myRank.totalMocks} mock{myRank.totalMocks !== 1 ? 's' : ''} given
                </span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Best: {myRank.bestScore}%
                </span>
              </div>
            </div>
            <div style={{
              background: getRankBadge(myRank.totalPoints).bg,
              border: `1px solid ${getRankBadge(myRank.totalPoints).color}44`,
              borderRadius: 10, padding: '6px 12px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 18 }}>{getRankBadge(myRank.totalPoints).icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: getRankBadge(myRank.totalPoints).color, marginTop: 2 }}>
                {getRankBadge(myRank.totalPoints).label}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SEARCH ── */}
      <div style={{
        position: 'relative', marginBottom: 20,
        animation: 'lbFadeUp .4s .14s ease both',
      }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
        <input
          type="text"
          placeholder="Search by student name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '11px 14px 11px 40px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, color: 'var(--text)', fontSize: 14,
            outline: 'none', boxSizing: 'border-box',
            transition: 'border-color .2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e  => e.target.style.borderColor = 'var(--border)'}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', fontSize: 16,
          }}>✕</button>
        )}
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading leaderboard...</p>
        </div>
      )}

      {/* ── EMPTY ── */}
      {!loading && board.length === 0 && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '60px 32px', textAlign: 'center',
          animation: 'lbFadeUp .4s ease both',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No scores yet</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
            Be the first to take a {selectedExam} mock test and claim #1!
          </p>
          <button className="btn btn-primary" onClick={() => navigate('home')}>
            Take Mock Test →
          </button>
        </div>
      )}

      {/* ── TOP 3 PODIUM ── */}
      {!loading && !search && filtered.length >= 3 && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
          marginBottom: 20, animation: 'lbFadeUp .4s .18s ease both',
        }}>
          {[filtered[1], filtered[0], filtered[2]].map((u, idx) => {
            if (!u) return <div key={idx} />
            const realRank = idx === 0 ? 2 : idx === 1 ? 1 : 3
            const style    = TOP3_COLORS[realRank - 1]
            const height   = realRank === 1 ? 140 : realRank === 2 ? 120 : 110
            const me       = isMe(u)
            const badge    = getRankBadge(u.totalPoints)
            return (
              <div key={u.userId} style={{
                background: me ? `linear-gradient(135deg,rgba(249,115,22,0.2),rgba(249,115,22,0.08))` : style.bg,
                border: `1.5px solid ${me ? 'var(--accent)' : style.border}`,
                borderRadius: 16, padding: '16px 12px',
                textAlign: 'center', height,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 6, position: 'relative', overflow: 'hidden',
                order: realRank === 1 ? -1 : realRank,
                boxShadow: realRank === 1 ? `0 8px 24px ${style.color}22` : 'none',
              }}>
                {me && (
                  <div style={{ position: 'absolute', top: 6, right: 8, fontSize: 9, fontWeight: 800, color: 'var(--accent)', background: 'rgba(249,115,22,0.15)', borderRadius: 4, padding: '1px 5px' }}>YOU</div>
                )}
                <div style={{ fontSize: realRank === 1 ? 28 : 22 }}>{style.crown}</div>
                <Avatar name={u.userName} size={realRank === 1 ? 44 : 36} userId={u.userId} color={style.color} />
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 4px' }}>
                  {u.userName}
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: style.color }}>{u.totalPoints}</div>
                <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600 }}>POINTS</div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── FULL LIST ── */}
      {!loading && filtered.length > 0 && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 16, overflow: 'hidden',
          animation: 'lbFadeUp .4s .22s ease both',
        }}>
          {/* List header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '48px 1fr auto auto',
            gap: 12, padding: '10px 18px',
            background: 'var(--surface2)', borderBottom: '1px solid var(--border)',
          }}>
            {['Rank', 'Student', 'Mocks', 'Points'].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.8, textAlign: h === 'Points' || h === 'Mocks' ? 'right' : 'left' }}>{h}</div>
            ))}
          </div>

          {filtered.map((u, i) => {
            const me       = isMe(u)
            const badge    = getRankBadge(u.totalPoints)
            const top3     = u.rank <= 3
            const medals   = ['🥇','🥈','🥉']

            return (
              <div key={u.userId} className="lb-row" style={{
                display: 'grid', gridTemplateColumns: '48px 1fr auto auto',
                gap: 12, padding: '13px 18px',
                borderBottom: '1px solid var(--border)',
                background: me
                  ? 'rgba(249,115,22,0.06)'
                  : 'transparent',
                transition: 'all .18s',
                cursor: 'default',
                borderLeft: me ? '3px solid var(--accent)' : '3px solid transparent',
              }}>

                {/* Rank */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {top3 && !search ? (
                    <span style={{ fontSize: 20 }}>{medals[u.rank - 1]}</span>
                  ) : (
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: me ? 'rgba(249,115,22,0.15)' : 'var(--surface2)',
                      border: `1px solid ${me ? 'rgba(249,115,22,0.3)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800,
                      color: me ? 'var(--accent)' : 'var(--muted2)',
                    }}>
                      #{u.rank}
                    </div>
                  )}
                </div>

                {/* Name + badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <Avatar name={u.userName} size={36} userId={u.userId} color={top3 && !search ? TOP3_COLORS[u.rank-1].color : scoreColor(u.totalPoints)} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: me ? 'var(--accent)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.userName}
                      </span>
                      {me && (
                        <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent)', background: 'rgba(249,115,22,0.15)', borderRadius: 4, padding: '1px 6px', flexShrink: 0 }}>YOU</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 9, background: badge.bg, color: badge.color, borderRadius: 4, padding: '1px 6px', fontWeight: 700 }}>
                        {badge.icon} {badge.label}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>Best: {u.bestScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Mocks */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{u.totalMocks}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>mocks</div>
                </div>

                {/* Points */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: scoreColor(u.totalPoints) }}>{u.totalPoints}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>pts</div>
                </div>

              </div>
            )
          })}

          {/* No search results */}
          {filtered.length === 0 && search && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)', fontSize: 14 }}>
              No student found matching "{search}"
            </div>
          )}
        </div>
      )}

      {/* Points legend */}
      {!loading && board.length > 0 && (
        <div style={{
          marginTop: 20,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '14px 18px',
          animation: 'lbFadeUp .4s .3s ease both',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            Points Guide
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              { range: '90–100%', pts: 10, color: '#F59E0B' },
              { range: '80–89%',  pts: 8,  color: '#10B981' },
              { range: '70–79%',  pts: 6,  color: '#3B82F6' },
              { range: '60–69%',  pts: 4,  color: '#8B5CF6' },
              { range: '50–59%',  pts: 2,  color: '#F97316' },
              { range: '<50%',    pts: 1,  color: '#6B7280' },
            ].map(r => (
              <div key={r.range} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px',
                background: `${r.color}12`, border: `1px solid ${r.color}33`,
                borderRadius: 99,
              }}>
                <span style={{ fontSize: 11, color: r.color, fontWeight: 700 }}>{r.range}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>→</span>
                <span style={{ fontSize: 11, color: r.color, fontWeight: 800 }}>+{r.pts} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}