// ─────────────────────────────────────────────
// PointsReveal.jsx
// Compact animated points popup after mock submit
// Shows points earned + rank + share button
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { getRankBadge }        from '../data/pointsConfig'

export default function PointsReveal({ points, totalPoints, pointRow, exam, onContinue }) {
  const [show,    setShow]    = useState(false)
  const [counter, setCounter] = useState(0)
  const [confetti, setConfetti] = useState([])
  const [showTable, setShowTable] = useState(false)
  const [copied, setCopied] = useState(false)

  const badge = getRankBadge(totalPoints)

  // animate in
  useEffect(() => {
    setTimeout(() => setShow(true), 50)
  }, [])

  // count up animation for points
  useEffect(() => {
    if (!show) return
    let v = 0
    const target = totalPoints
    const step   = Math.max(1, Math.floor(target / 40))
    const timer  = setInterval(() => {
      v = Math.min(v + step, target)
      setCounter(v)
      if (v >= target) clearInterval(timer)
    }, 30)
    return () => clearInterval(timer)
  }, [show, totalPoints])

  // generate confetti pieces
  useEffect(() => {
    if (!show) return
    const pieces = Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ['#F59E0B','#10B981','#3B82F6','#F97316','#8B5CF6','#EF4444'][i % 6],
      delay: Math.random() * 0.4,
      size: 4 + Math.random() * 4,
      duration: 1.2 + Math.random() * 0.8,
    }))
    setConfetti(pieces)
  }, [show])

  // Share score
  const shareScore = () => {
    const text = `🎉 I scored ${points} points in ${exam} Mock Test on ExamNova!\n\n📈 Total Points: ${totalPoints}\n${badge.label}\n\nTry it: https://examai.vercel.app`
    if (navigator.share) {
      navigator.share({ title: 'My ExamNova Score', text })
    } else {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      <style>{`
        @keyframes prSlideUp  { from{opacity:0;transform:translateY(60px) scale(0.9)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes prPopIn    { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
        @keyframes prShimmer  { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes prConfetti { 0%{transform:translateY(-20px) rotate(0deg);opacity:1} 100%{transform:translateY(300px) rotate(720deg);opacity:0} }
        @keyframes prGlow     { 0%,100%{box-shadow:0 0 20px currentColor} 50%{box-shadow:0 0 40px currentColor} }
        @keyframes prFloat    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes prPulse    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
      `}</style>

      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(8px, 3vw, 16px)',
        opacity: show ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}>

        {/* Confetti */}
        {confetti.map(p => (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: 0,
            width: p.size,
            height: p.size,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            background: p.color,
            animation: `prConfetti ${p.duration}s ${p.delay}s ease-in forwards`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Card */}
        <div style={{
          width: '100%', maxWidth: 'clamp(300px, 85vw, 420px)',
          borderRadius: 'clamp(16px, 4vw, 24px)',
          overflow: 'hidden',
          background: 'linear-gradient(150deg, #0d0d1a 0%, #1a1030 50%, #0d0d1a 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: `0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05), 0 0 80px ${pointRow.color}22`,
          transform: show ? 'translateY(0) scale(1)' : 'translateY(60px) scale(0.9)',
          opacity: show ? 1 : 0,
          transition: 'transform 0.45s cubic-bezier(0.34,1.4,0.64,1), opacity 0.3s ease',
        }}>

          {/* Top accent bar */}
          <div style={{
            height: 3,
            background: `linear-gradient(90deg, transparent, ${pointRow.color}cc, ${pointRow.color}, ${pointRow.color}cc, transparent)`,
          }} />

          <div style={{ padding: 'clamp(16px, 3vw, 24px) clamp(16px, 3vw, 20px)' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 'clamp(12px, 2vw, 16px)' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 'clamp(4px, 1vw, 6px)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 99, padding: 'clamp(2px, 0.8vw, 4px) clamp(10px, 1.5vw, 12px)', marginBottom: 'clamp(8px, 1.5vw, 12px)',
              }}>
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: pointRow.color,
                  boxShadow: `0 0 6px ${pointRow.color}`,
                  animation: 'prPulse 1.5s infinite',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 'clamp(8px, 1.2vw, 10px)', fontWeight: 700, letterSpacing: 1, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
                  {exam} · Points
                </span>
              </div>

              {/* Big emoji */}
              <div style={{
                fontSize: 'clamp(40px, 12vw, 56px)', marginBottom: 'clamp(6px, 1.5vw, 8px)',
                animation: 'prFloat 2s ease-in-out infinite',
                display: 'block',
                lineHeight: 1,
              }}>
                {pointRow.emoji}
              </div>

              <div style={{ fontSize: 'clamp(12px, 2vw, 15px)', fontWeight: 700, color: pointRow.color, marginBottom: 'clamp(4px, 1vw, 6px)' }}>
                {pointRow.label}!
              </div>
            </div>

            {/* Points earned this mock */}
            <div style={{
              position: 'relative', overflow: 'hidden',
              background: `linear-gradient(135deg, ${pointRow.color}18, ${pointRow.color}08)`,
              border: `1.5px solid ${pointRow.color}44`,
              borderRadius: 'clamp(12px, 2vw, 16px)',
              padding: 'clamp(14px, 2.5vw, 18px) clamp(12px, 2vw, 16px)',
              textAlign: 'center',
              marginBottom: 'clamp(12px, 2vw, 14px)',
            }}>
              {/* Shimmer */}
              <div style={{
                position: 'absolute', inset: 0, width: '40%',
                background: `linear-gradient(90deg, transparent, ${pointRow.color}15, transparent)`,
                animation: 'prShimmer 2s infinite',
              }} />

              <div style={{ fontSize: 'clamp(9px, 1.2vw, 10px)', fontWeight: 700, letterSpacing: 1.2, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: 'clamp(4px, 1vw, 6px)' }}>
                Earned This Mock
              </div>
              <div style={{
                fontSize: 'clamp(48px, 15vw, 64px)', fontWeight: 900, color: pointRow.color, lineHeight: 1,
                textShadow: `0 0 24px ${pointRow.color}66`,
                animation: 'prPopIn 0.6s 0.3s both',
              }}>
                +{points}
              </div>
              <div style={{ fontSize: 'clamp(10px, 1.3vw, 11px)', color: 'rgba(255,255,255,0.35)', marginTop: 'clamp(3px, 0.8vw, 4px)' }}>
                for {pointRow.min}%{pointRow.max < 100 ? `–${pointRow.max}%` : '+'}
              </div>
            </div>

            {/* Total points + rank badge */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(8px, 1.5vw, 10px)', marginBottom: 'clamp(12px, 2vw, 14px)' }}>

              {/* Total points */}
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 'clamp(10px, 2vw, 12px)', padding: 'clamp(10px, 1.5vw, 12px) clamp(8px, 1.5vw, 10px)', textAlign: 'center',
              }}>
                <div style={{ fontSize: 'clamp(8px, 1.2vw, 9px)', fontWeight: 700, letterSpacing: 0.8, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 'clamp(3px, 0.8vw, 4px)' }}>
                  Total
                </div>
                <div style={{ fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 'clamp(2px, 0.5vw, 3px)' }}>
                  {counter}
                </div>
                <div style={{ fontSize: 'clamp(8px, 1vw, 9px)', color: 'rgba(255,255,255,0.3)' }}>
                  points
                </div>
              </div>

              {/* Rank badge */}
              <div style={{
                background: badge.bg,
                border: `1px solid ${badge.color}44`,
                borderRadius: 'clamp(10px, 2vw, 12px)', padding: 'clamp(10px, 1.5vw, 12px) clamp(8px, 1.5vw, 10px)', textAlign: 'center',
              }}>
                <div style={{ fontSize: 'clamp(8px, 1.2vw, 9px)', fontWeight: 700, letterSpacing: 0.8, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 'clamp(3px, 0.8vw, 4px)' }}>
                  Rank
                </div>
                <div style={{ fontSize: 'clamp(18px, 4vw, 22px)', lineHeight: 1, marginBottom: 'clamp(2px, 0.5vw, 3px)' }}>
                  {badge.icon}
                </div>
                <div style={{ fontSize: 'clamp(8px, 1.2vw, 10px)', fontWeight: 700, color: badge.color }}>{badge.label}</div>
              </div>

            </div>

            {/* Expandable Points table */}
            {showTable && (
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 'clamp(10px, 1.5vw, 12px)', padding: 'clamp(10px, 1.5vw, 12px)',
                marginBottom: 'clamp(12px, 2vw, 14px)',
              }}>
                <div style={{ fontSize: 'clamp(8px, 1.2vw, 9px)', fontWeight: 700, letterSpacing: 1, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 'clamp(8px, 1.5vw, 10px)' }}>
                  Points Table
                </div>
                {[
                  { range: '90–100%', pts: 10, emoji: '🏆' },
                  { range: '80–89%',  pts: 8,  emoji: '🥇' },
                  { range: '70–79%',  pts: 6,  emoji: '🥈' },
                  { range: '60–69%',  pts: 4,  emoji: '🥉' },
                  { range: '50–59%',  pts: 2,  emoji: '📚' },
                  { range: 'Below 50%', pts: 1, emoji: '✍️' },
                ].map((r, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: 'clamp(4px, 1vw, 5px) 0',
                    borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    background: r.pts === points ? `${pointRow.color}08` : 'transparent',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 1vw, 6px)', fontSize: 'clamp(10px, 1.5vw, 11px)' }}>
                      <span>{r.emoji}</span>
                      <span style={{ color: r.pts === points ? '#fff' : 'rgba(255,255,255,0.45)', fontWeight: r.pts === points ? 700 : 400 }}>
                        {r.range}
                      </span>
                      {r.pts === points && (
                        <span style={{ fontSize: 'clamp(7px, 1vw, 8px)', fontWeight: 800, color: pointRow.color, background: `${pointRow.color}22`, borderRadius: 3, padding: '0 4px' }}>YOU</span>
                      )}
                    </div>
                    <span style={{ fontSize: 'clamp(10px, 1.5vw, 11px)', fontWeight: 800, color: r.pts === points ? pointRow.color : 'rgba(255,255,255,0.35)' }}>
                      +{r.pts}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.5vw, 10px)' }}>
              {/* View Leaderboard button */}
              <button
                onClick={onContinue}
                style={{
                  width: '100%', padding: 'clamp(10px, 2vw, 12px)',
                  background: `linear-gradient(135deg, ${pointRow.color}, ${pointRow.color}cc)`,
                  border: 'none', borderRadius: 'clamp(10px, 1.5vw, 12px)',
                  color: '#fff', fontSize: 'clamp(12px, 1.5vw, 14px)', fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: `0 6px 20px ${pointRow.color}44`,
                  position: 'relative', overflow: 'hidden',
                  letterSpacing: 0.2,
                }}
              >
                <div style={{
                  position: 'absolute', inset: 0, width: '40%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                  animation: 'prShimmer 2s infinite',
                }} />
                🏆 Leaderboard
              </button>

              {/* Share button */}
              <button
                onClick={shareScore}
                style={{
                  width: '100%', padding: 'clamp(10px, 2vw, 12px)',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 'clamp(10px, 1.5vw, 12px)', 
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 'clamp(12px, 1.5vw, 13px)', fontWeight: 600, 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.12)'; e.target.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.color = 'rgba(255,255,255,0.7)'; }}
              >
                {copied ? '✓ Copied!' : '📤 Share Score'}
              </button>

              {/* Show points table button */}
              <button
                onClick={() => setShowTable(!showTable)}
                style={{
                  width: '100%', padding: 'clamp(8px, 1.5vw, 10px)',
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: 'clamp(11px, 1.3vw, 12px)', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {showTable ? '▼ Hide Points Table' : '▶ View Points Table'}
              </button>

              {/* View Result button */}
              <button
                onClick={onContinue}
                style={{
                  width: '100%', padding: 'clamp(8px, 1.5vw, 10px)',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 'clamp(8px, 1.5vw, 10px)', 
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 'clamp(11px, 1.3vw, 12px)', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                }}
              >
                View Result →
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}