// ─────────────────────────────────────────────
// ProfileScreen.jsx
// User profile with photo upload, daily goal,
// LeetCode-style streak heatmap
// ─────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import {
  compressPhoto, saveProfilePhoto, getProfilePhoto,
  saveDailyGoal, getDailyGoal,
  getDailyProgress, getStreakHistory, getUserProfile,
} from '../services/profileService'
import { getStreak } from '../services/storageService'

export default function ProfileScreen({ user, navigate, onLogout }) {

  const [photo,          setPhoto]          = useState(null)
  const [uploading,      setUploading]      = useState(false)
  const [dailyGoal,      setDailyGoal]      = useState(getDailyGoal())
  const [dailyProgress,  setDailyProgress]  = useState(0)
  const [streak,         setStreak]         = useState(0)
  const [streakHistory,  setStreakHistory]   = useState({})
  const [loading,        setLoading]        = useState(true)
  const [goalSaved,      setGoalSaved]      = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    const [photo, progress, streakCount, history] = await Promise.all([
      getProfilePhoto(user?.id || user?.uid),
      getDailyProgress(),
      getStreak(),
      getStreakHistory(),
    ])
    setPhoto(photo)
    setDailyProgress(progress)
    setStreak(streakCount)
    setStreakHistory(history)
    setLoading(false)
  }

  const handlePhotoClick = () => fileRef.current?.click()

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const base64 = await compressPhoto(file)
      await saveProfilePhoto(base64)
      setPhoto(base64)
    } catch (err) {
      console.error('Photo upload error:', err)
    }
    setUploading(false)
  }

  const handleGoalChange = (goal) => {
    setDailyGoal(goal)
    saveDailyGoal(goal)
    setGoalSaved(true)
    setTimeout(() => setGoalSaved(false), 2000)
  }

  const goalPercent = Math.min(100, Math.round((dailyProgress / dailyGoal) * 100))
  const goalDone    = dailyProgress >= dailyGoal

  const firstName = user?.name
    ? user.name.charAt(0).toUpperCase() + user.name.slice(1).split(' ')[0]
    : 'Student'

  // ── Build heatmap — last 26 weeks (182 days) ──
  const buildHeatmap = () => {
    const today    = new Date()
    const cells    = []
    const weekdays = ['S','M','T','W','T','F','S']

    // Start from 26 weeks ago, aligned to Sunday
    const start = new Date(today)
    start.setDate(start.getDate() - 181)
    // align to Sunday
    start.setDate(start.getDate() - start.getDay())

    const cur = new Date(start)
    while (cur <= today) {
      const key   = cur.toISOString().split('T')[0]
      const count = streakHistory[key] || 0
      const isFuture = cur > today
      cells.push({
        date:  key,
        count,
        isFuture,
        isToday: key === today.toISOString().split('T')[0],
      })
      cur.setDate(cur.getDate() + 1)
    }
    return cells
  }

  const heatCells = buildHeatmap()

  // Color based on questions answered
  const heatColor = (count, isFuture) => {
    if (isFuture)  return 'var(--surface2)'
    if (count === 0) return 'var(--surface2)'
    if (count < 10)  return 'rgba(34,197,94,0.25)'
    if (count < 20)  return 'rgba(34,197,94,0.5)'
    if (count < 30)  return 'rgba(34,197,94,0.75)'
    return 'rgba(34,197,94,1)'
  }

  // Group cells into weeks
  const weeks = []
  for (let i = 0; i < heatCells.length; i += 7) {
    weeks.push(heatCells.slice(i, i + 7))
  }

  // Month labels
  const monthLabels = () => {
    const labels = []
    let lastMonth = -1
    weeks.forEach((week, wi) => {
      const firstDay = week[0]
      if (!firstDay) return
      const month = new Date(firstDay.date).getMonth()
      if (month !== lastMonth) {
        labels.push({ wi, label: new Date(firstDay.date).toLocaleDateString('en-IN', { month: 'short' }) })
        lastMonth = month
      }
    })
    return labels
  }

  return (
    <div className="page" style={{ maxWidth: 600 }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .profile-photo-wrap:hover .photo-overlay { opacity: 1 !important; }
      `}</style>

      {/* Back */}
      <button onClick={() => navigate('home')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 13, marginBottom: 24, padding: 0, fontWeight: 600 }}>
        ← Back
      </button>

      {/* ── PROFILE CARD ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 24px', marginBottom: 20, animation: 'fadeUp 0.3s ease', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>

        {/* Photo */}
        <div className="profile-photo-wrap" style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }} onClick={handlePhotoClick}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--accent)', boxShadow: '0 4px 16px rgba(249,115,22,0.3)', background: 'linear-gradient(135deg, var(--accent), #ea580c)' }}>
            {photo ? (
              <img src={photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: 'white' }}>
                {firstName.charAt(0)}
              </div>
            )}
          </div>
          {/* Overlay */}
          <div className="photo-overlay" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
            <span style={{ fontSize: 20 }}>{uploading ? '⏳' : '📷'}</span>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{user?.name || 'Student'}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>{user?.email}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: 'rgba(249,115,22,.1)', border: '1px solid rgba(249,115,22,.25)', color: 'var(--accent)', fontWeight: 600 }}>
              🔥 {streak} day streak
            </div>
            {localStorage.getItem('examai_selected_exam') && (
              <div style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted2)', fontWeight: 600 }}>
                📋 {localStorage.getItem('examai_selected_exam')}
              </div>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>Tap photo to change</div>
        </div>
      </div>

      {/* ── DAILY GOAL ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px', marginBottom: 20, animation: 'fadeUp 0.3s ease 0.05s both' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>🎯 Daily Goal</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Questions to practice today</div>
          </div>
          {goalSaved && <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>✓ Saved</div>}
        </div>

        {/* Goal selector */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[10, 20, 30].map(g => (
            <button key={g} onClick={() => handleGoalChange(g)}
              style={{ flex: 1, padding: '12px', borderRadius: 12, border: `2px solid ${dailyGoal === g ? 'var(--accent)' : 'var(--border)'}`, background: dailyGoal === g ? 'rgba(249,115,22,.1)' : 'var(--surface2)', color: dailyGoal === g ? 'var(--accent)' : 'var(--muted2)', fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'all 0.15s' }}>
              {g}
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Today's Progress</span>
            <span style={{ color: goalDone ? 'var(--green)' : 'var(--accent)', fontWeight: 700 }}>
              {dailyProgress} / {dailyGoal} {goalDone ? '✓' : ''}
            </span>
          </div>
          <div style={{ height: 10, background: 'var(--surface2)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${goalPercent}%`, background: goalDone ? 'var(--green)' : 'linear-gradient(90deg, var(--accent), #f97316)', borderRadius: 6, transition: 'width 0.5s ease' }} />
          </div>
          {goalDone && (
            <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700, marginTop: 8, textAlign: 'center' }}>
              🎉 Goal complete! Great work today!
            </div>
          )}
          {!goalDone && dailyProgress > 0 && (
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
              {dailyGoal - dailyProgress} more questions to reach today's goal
            </div>
          )}
        </div>
      </div>

      {/* ── STREAK HEATMAP ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px', marginBottom: 20, animation: 'fadeUp 0.3s ease 0.1s both' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>📅 Practice Activity</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Last 6 months</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>{streak}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>day streak</div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 20 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <>
            {/* Month labels */}
            <div style={{ display: 'flex', gap: 3, marginBottom: 4, overflowX: 'auto', paddingBottom: 4 }}>
              {(() => {
                const labels = monthLabels()
                return weeks.map((_, wi) => {
                  const label = labels.find(l => l.wi === wi)
                  return (
                    <div key={wi} style={{ width: 14, flexShrink: 0, fontSize: 9, color: 'var(--muted)', textAlign: 'center' }}>
                      {label ? label.label : ''}
                    </div>
                  )
                })
              })()}
            </div>

            {/* Heatmap grid */}
            <div style={{ display: 'flex', gap: 3, overflowX: 'auto', paddingBottom: 4 }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
                  {week.map((cell, di) => (
                    <div key={di} title={`${cell.date}: ${cell.count} questions`}
                      style={{ width: 14, height: 14, borderRadius: 3, background: heatColor(cell.count, cell.isFuture), border: cell.isToday ? '1.5px solid var(--accent)' : 'none', transition: 'all 0.1s', cursor: 'default' }} />
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>Less</span>
              {['var(--surface2)', 'rgba(34,197,94,0.25)', 'rgba(34,197,94,0.5)', 'rgba(34,197,94,0.75)', 'rgba(34,197,94,1)'].map((c, i) => (
                <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: c }} />
              ))}
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>More</span>
            </div>
          </>
        )}
      </div>

      {/* ── QUICK LINKS ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', marginBottom: 20, animation: 'fadeUp 0.3s ease 0.15s both' }}>
        {[
          { icon: '📊', label: 'My Progress',  action: () => navigate('dashboard')  },
          { icon: '⚙️', label: 'Settings',     action: () => navigate('settings')   },
        ].map((item, i) => (
          <button key={i} onClick={item.action}
            style={{ width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', borderBottom: i === 0 ? '1px solid var(--border)' : 'none', color: 'var(--text)', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {item.label}
            <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 16 }}>→</span>
          </button>
        ))}
      </div>

      {/* ── LOGOUT ── */}
      <button onClick={onLogout}
        style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1px solid rgba(239,68,68,.3)', background: 'rgba(239,68,68,.06)', color: 'var(--red)', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s', marginBottom: 32 }}>
        🚪 Logout
      </button>
    </div>
  )
}