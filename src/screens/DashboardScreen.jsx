// ─────────────────────────────────────────────
// DashboardScreen.jsx  —  Professional UI v2
// Testbook / Adda247 style — government exam app
// ALL logic identical — only UI redesigned
// ─────────────────────────────────────────────
import TRANSLATIONS from '../data/translations'
import { useState, useEffect } from 'react'
import { loadHistory, clearHistory, clearAskedQuestions } from '../services/storageService'

export default function DashboardScreen({ user, navigate, onLogout, language, onLanguageChange }) {

  const [allHistory,  setAllHistory]  = useState([])
  const [activeExam,  setActiveExam]  = useState(null)
  const [activeTopic, setActiveTopic] = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [streak,      setStreak]      = useState(0)

  useEffect(() => {
    const load = async () => {
      const h = await loadHistory()
      setAllHistory(h.reverse())
      if (h.length > 0) {
        const exams = [...new Set(h.map(t => t.exam))]
        setActiveExam(exams[0])
      }
      try {
        const { getStreak } = await import('../services/storageService')
        const s = await getStreak()
        setStreak(s)
      } catch(e) {}
      setLoading(false)
    }
    load()
  }, [])

  const practicedExams = [...new Set(allHistory.map(h => h.exam))]
  const examHistory    = allHistory.filter(h => h.exam === activeExam)
  const examTopics     = [...new Set(examHistory.map(h => h.topic))]
  const topicHistory   = activeTopic ? examHistory.filter(h => h.topic === activeTopic) : []

  const calcStats = (history) => {
    if (history.length === 0) return null
    const percents = history.map(h => h.percent)
    const totalTime = history.reduce((s, h) => s + (h.timeTaken || 0), 0)
    return {
      totalTests:   history.length,
      avgScore:     Math.round(percents.reduce((a, b) => a + b, 0) / percents.length),
      bestScore:    Math.max(...percents),
      totalTopics:  [...new Set(history.map(h => h.topic))].length,
      totalMinutes: Math.round(totalTime / 60),
    }
  }

  const getTopicSummaries = () => {
    return examTopics.map(topic => {
      const tests    = examHistory.filter(h => h.topic === topic)
      const percents = tests.map(h => h.percent)
      const avg      = Math.round(percents.reduce((a, b) => a + b, 0) / percents.length)
      const totalTime = tests.reduce((s, h) => s + (h.timeTaken || 0), 0)
      return { topic, totalTests: tests.length, avg, best: Math.max(...percents), last: tests[0], totalTime }
    }).sort((a, b) => b.totalTests - a.totalTests)
  }

  const globalStats = calcStats(allHistory)

  const ENGLISH_TOPICS = ['General English', 'English Language', 'English']
  const translate = (text) => {
    if (language !== 'hindi') return text
    if (ENGLISH_TOPICS.includes(text)) return text
    return TRANSLATIONS.topics[text] || TRANSLATIONS.subtopics[text] || text
  }

  const scoreColor  = (pct) => pct >= 70 ? '#22c55e' : pct >= 50 ? '#f97316' : '#ef4444'
  const scoreBg     = (pct) => pct >= 70 ? 'rgba(34,197,94,.1)' : pct >= 50 ? 'rgba(249,115,22,.1)' : 'rgba(239,68,68,.1)'
  const scoreLabel  = (pct) => pct >= 75 ? 'Strong' : pct >= 50 ? 'Average' : 'Needs Work'
  const scoreBadge  = (pct) => pct >= 75
    ? { bg:'rgba(34,197,94,.1)',  border:'rgba(34,197,94,.3)',  color:'#22c55e',  icon:'💪' }
    : pct >= 50
    ? { bg:'rgba(249,115,22,.1)', border:'rgba(249,115,22,.3)', color:'#f97316',  icon:'📈' }
    : { bg:'rgba(239,68,68,.1)',  border:'rgba(239,68,68,.3)',  color:'#ef4444',  icon:'📉' }

  const handleClearHistory = async () => {
    if (window.confirm('Delete all test history? This cannot be undone.')) {
      await clearHistory()
      await clearAskedQuestions()
      setAllHistory([])
      setActiveExam(null)
      setActiveTopic(null)
    }
  }

  const handleSelectExam = (exam) => {
    setActiveExam(exam)
    setActiveTopic(null)
    scrollTop()
  }

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
        <div style={{ textAlign:'center' }}>
          <div className="spinner" style={{ width:40, height:40, margin:'0 auto 16px' }} />
          <p style={{ color:'var(--muted)', fontSize:14 }}>Loading your progress...</p>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════
  // EMPTY STATE
  // ══════════════════════════════════════════
  if (allHistory.length === 0) {
    return (
      <div className="page">
        <style>{`
          @keyframes emptyFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
          @keyframes emptyFloat  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        `}</style>

        {/* Page title */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <div style={{ width:4, height:28, borderRadius:2, background:'var(--accent)' }} />
            <h1 style={{ fontSize:22, fontWeight:800 }}>My Progress</h1>
          </div>
          <p style={{ fontSize:13, color:'var(--muted2)', paddingLeft:14 }}>Track your exam preparation journey</p>
        </div>

        {/* Empty hero card */}
        <div style={{
          background:'var(--surface)', border:'1px solid var(--border)',
          borderRadius:20, padding:'48px 32px', textAlign:'center',
          animation:'emptyFadeUp .5s ease both',
          position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,var(--accent),#f97316,var(--accent))', backgroundSize:'200%', animation:'shimmerBar 2s linear infinite' }} />
          <style>{`@keyframes shimmerBar{0%{background-position:0%}100%{background-position:200%}}`}</style>

          <div style={{ fontSize:72, marginBottom:16, animation:'emptyFloat 3s ease-in-out infinite' }}>📊</div>
          <h2 style={{ fontSize:22, fontWeight:800, marginBottom:10 }}>No Tests Taken Yet</h2>
          <p style={{ fontSize:14, color:'var(--muted2)', lineHeight:1.7, maxWidth:380, margin:'0 auto 28px' }}>
            Start practicing to see your scores, progress charts, weak topics and performance analytics here.
          </p>

          {/* Steps */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, maxWidth:520, margin:'0 auto 28px' }}>
            {[
              { n:1, icon:'📋', title:'Select Exam',     desc:'Choose your target exam' },
              { n:2, icon:'✏️', title:'Practice Topics', desc:'Answer 10+ questions' },
              { n:3, icon:'📊', title:'See Analytics',   desc:'Your stats appear here' },
            ].map(step => (
              <div key={step.n} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:14, padding:'16px 14px', textAlign:'center' }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--accent)', color:'white', fontSize:14, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>{step.n}</div>
                <div style={{ fontSize:22, marginBottom:6 }}>{step.icon}</div>
                <div style={{ fontSize:13, fontWeight:700, marginBottom:3 }}>{step.title}</div>
                <div style={{ fontSize:11, color:'var(--muted)' }}>{step.desc}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('home')}
            style={{ padding:'12px 32px', background:'linear-gradient(135deg,var(--accent),#ea580c)', border:'none', borderRadius:12, color:'white', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(249,115,22,.35)' }}
          >
            🚀 Start Practicing Now
          </button>
        </div>
      </div>
    )
  }

  // ── Derived data ──
  const examStats = calcStats(examHistory)
  const topics    = getTopicSummaries()

  // ══════════════════════════════════════════
  // MAIN DASHBOARD
  // ══════════════════════════════════════════
  return (
    <div className="page">
      <style>{`
        @keyframes dbFadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dbPulse  { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:.7} }
        @keyframes shimmerBar{0%{background-position:0%}100%{background-position:200%}}
        .db-topic-row:hover { background:var(--surface2) !important; transform:translateX(3px); }
        .db-exam-tab:hover  { border-color:var(--accent) !important; color:var(--accent) !important; }
        .db-stat-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.15); }
        .db-back:hover      { color:var(--accent) !important; }
      `}</style>

      {/* ── PAGE HEADER ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {activeTopic && (
            <button className="db-back" onClick={() => setActiveTopic(null)}
              style={{ width:34, height:34, borderRadius:9, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--muted)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, transition:'all .15s', flexShrink:0 }}>
              ←
            </button>
          )}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:3 }}>
              <div style={{ width:4, height:24, borderRadius:2, background:'var(--accent)' }} />
              <h1 style={{ fontSize:20, fontWeight:800 }}>
                {activeTopic ? translate(activeTopic) : 'My Progress'}
              </h1>
            </div>
            <p style={{ fontSize:12, color:'var(--muted2)', paddingLeft:14 }}>
              {activeTopic
                ? `${activeExam} · ${topicHistory.length} tests taken`
                : `${user?.name} · ${allHistory.length} total tests`}
            </p>
          </div>
        </div>

        {/* Right side actions */}
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {streak > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(249,115,22,.08)', border:'1px solid rgba(249,115,22,.25)', borderRadius:20, padding:'6px 14px', fontSize:13, fontWeight:700 }}>
              <span style={{ animation:'dbPulse 2s infinite' }}>🔥</span>
              <span style={{ color:'var(--accent)' }}>{streak} day streak</span>
            </div>
          )}
          <button onClick={handleClearHistory}
            style={{ padding:'7px 14px', background:'transparent', border:'1px solid rgba(239,68,68,.3)', borderRadius:8, color:'rgba(239,68,68,.7)', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,.08)'; e.currentTarget.style.color='var(--red)' }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(239,68,68,.7)' }}
          >
            🗑 Reset
          </button>
        </div>
      </div>

      {/* ── GLOBAL STATS BANNER ── */}
      {globalStats && !activeTopic && (
        <div style={{
          background:'linear-gradient(135deg, #1e1035 0%, #0f1a35 50%, #1a0e20 100%)',
          borderRadius:18, padding:'20px 24px', marginBottom:20,
          border:'1px solid rgba(255,255,255,.06)',
          display:'flex', flexWrap:'wrap', gap:0,
          animation:'dbFadeUp .4s ease both',
          position:'relative', overflow:'hidden',
        }}>
          {/* Top shimmer */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,var(--accent),#3b82f6,#a855f7,var(--accent))', backgroundSize:'200%', animation:'shimmerBar 3s linear infinite' }} />

          {[
            { val: globalStats.totalTests,         label:'Total Tests',  icon:'📝', color:'#f97316' },
            { val: `${globalStats.avgScore}%`,      label:'Avg Score',   icon:'🎯', color: scoreColor(globalStats.avgScore) },
            { val: `${globalStats.bestScore}%`,     label:'Best Score',  icon:'🏆', color:'#eab308' },
            { val: globalStats.totalTopics,         label:'Topics',      icon:'📚', color:'#3b82f6' },
            { val: `${globalStats.totalMinutes}m`,  label:'Time Spent',  icon:'⏱',  color:'#a855f7' },
            { val: `${streak}🔥`,                   label:'Day Streak',  icon:'',   color:'#f97316' },
          ].map((st, i) => (
            <div key={st.label} style={{
              flex:'1 1 90px', padding:'12px 16px', textAlign:'center',
              borderRight: i < 5 ? '1px solid rgba(255,255,255,.06)' : 'none',
            }}>
              <div style={{ fontSize:22, fontWeight:900, color:st.color, lineHeight:1, marginBottom:5 }}>{st.val}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,.45)', textTransform:'uppercase', letterSpacing:'0.6px' }}>{st.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── EXAM TABS ── */}
      {practicedExams.length > 1 && !activeTopic && (
        <div style={{ marginBottom:20, animation:'dbFadeUp .4s ease .05s both' }}>
          <div style={{ fontSize:10, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:10 }}>
            Your Exams
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {practicedExams.map(exam => {
              const active  = exam === activeExam
              const s       = calcStats(allHistory.filter(h => h.exam === exam))
              return (
                <button key={exam} className="db-exam-tab"
                  onClick={() => handleSelectExam(exam)}
                  style={{
                    padding:'9px 16px', borderRadius:10, cursor:'pointer',
                    border:`1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                    background: active ? 'rgba(249,115,22,.08)' : 'var(--surface)',
                    color: active ? 'var(--accent)' : 'var(--muted2)',
                    fontSize:12, fontWeight: active ? 700 : 500,
                    transition:'all .15s', textAlign:'left',
                    display:'flex', flexDirection:'column', gap:2,
                  }}
                >
                  <span style={{ fontWeight:700 }}>{exam}</span>
                  {s && <span style={{ fontSize:10, color: active ? 'var(--accent)' : 'var(--muted)', opacity:.8 }}>{s.totalTests} tests · {s.avgScore}% avg</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          TOPIC DRILL-DOWN VIEW
      ══════════════════════════════════════ */}
      {activeTopic ? (
        <>
          {/* Topic header card */}
          {(() => {
            const t       = topics.find(t => t.topic === activeTopic)
            const badge   = t ? scoreBadge(t.avg) : null
            return t ? (
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'20px 24px', marginBottom:20, display:'flex', alignItems:'center', gap:20, flexWrap:'wrap', animation:'dbFadeUp .35s ease both' }}>
                <div style={{ flex:1, minWidth:180 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                    <h2 style={{ fontSize:18, fontWeight:800 }}>{translate(t.topic)}</h2>
                    {badge && (
                      <span style={{ fontSize:10, padding:'3px 10px', borderRadius:20, fontWeight:800, background:badge.bg, border:`1px solid ${badge.border}`, color:badge.color }}>
                        {badge.icon} {scoreLabel(t.avg)}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize:12, color:'var(--muted2)' }}>
                    {t.totalTests} tests · Best {t.best}% · {Math.round(t.totalTime/60)} min spent
                  </div>
                  <div style={{ marginTop:10, height:6, background:'var(--surface2)', borderRadius:3, overflow:'hidden', maxWidth:200 }}>
                    <div style={{ height:'100%', width:`${t.avg}%`, background: scoreColor(t.avg), borderRadius:3, transition:'width .8s ease' }} />
                  </div>
                </div>
                <div style={{ width:64, height:64, borderRadius:16, background: scoreBg(t.avg), border:`2px solid ${scoreColor(t.avg)}30`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:22, fontWeight:900, color: scoreColor(t.avg), lineHeight:1 }}>{t.avg}%</span>
                  <span style={{ fontSize:9, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.3px', marginTop:2 }}>avg</span>
                </div>
              </div>
            ) : null
          })()}

          {/* Subtopic breakdown */}
          {(() => {
            const subtopicMap = {}
            topicHistory.forEach(h => {
              const key = h.subtopic || 'Full Topic'
              if (!subtopicMap[key]) subtopicMap[key] = []
              subtopicMap[key].push(h.percent)
            })
            const entries = Object.entries(subtopicMap).map(([sub, pcts]) => ({
              sub, avg: Math.round(pcts.reduce((a,b)=>a+b,0)/pcts.length), count: pcts.length
            })).sort((a,b) => a.avg - b.avg)

            return entries.length > 1 ? (
              <div style={{ marginBottom:20, animation:'dbFadeUp .35s ease .05s both' }}>
                <div style={{ fontSize:10, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:12 }}>
                  Subtopic Performance
                </div>
                <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
                  {entries.map((e, i) => {
                    const badge = scoreBadge(e.avg)
                    return (
                      <div key={e.sub} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 18px', borderBottom: i < entries.length-1 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:600, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.sub}</div>
                          <div style={{ fontSize:11, color:'var(--muted)' }}>{e.count} test{e.count>1?'s':''}</div>
                        </div>
                        <div style={{ width:90, flexShrink:0 }}>
                          <div style={{ height:5, background:'var(--surface2)', borderRadius:3, overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${e.avg}%`, background: scoreColor(e.avg), borderRadius:3, transition:'width .6s ease' }} />
                          </div>
                        </div>
                        <div style={{ fontSize:12, fontWeight:800, color: badge.color, minWidth:36, textAlign:'right' }}>{e.avg}%</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null
          })()}

          {/* All tests */}
          <div style={{ animation:'dbFadeUp .35s ease .1s both' }}>
            <div style={{ fontSize:10, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:12 }}>
              All Test Attempts
            </div>
            <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
              {topicHistory.map((item, i) => (
                <div key={item.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', borderBottom: i < topicHistory.length-1 ? '1px solid var(--border)' : 'none', transition:'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  {/* Score circle */}
                  <div style={{ width:46, height:46, borderRadius:12, flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background: scoreBg(item.percent), border:`1px solid ${scoreColor(item.percent)}30` }}>
                    <span style={{ fontSize:13, fontWeight:900, color: scoreColor(item.percent), lineHeight:1 }}>{item.percent}%</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {item.subtopic || 'Full Topic Test'}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <span style={{ fontSize:11, color:'var(--muted)' }}>{item.score}/{item.total} correct</span>
                      <span style={{ fontSize:10, padding:'2px 7px', borderRadius:4, fontWeight:600, background: item.level==='hard' ? 'rgba(239,68,68,.08)' : 'rgba(59,130,246,.08)', color: item.level==='hard' ? 'var(--red)' : 'var(--blue)', border: `1px solid ${item.level==='hard' ? 'rgba(239,68,68,.2)' : 'rgba(59,130,246,.2)'}` }}>
                        {item.level==='hard' ? 'Hard' : 'Standard'}
                      </span>
                      {item.timeTaken && <span style={{ fontSize:11, color:'var(--muted)' }}>⏱ {Math.floor(item.timeTaken/60)}m {item.timeTaken%60}s</span>}
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:'var(--muted)', flexShrink:0, textAlign:'right' }}>
                    {new Date(item.date).toLocaleDateString('en-IN',{ day:'numeric', month:'short' })}
                    <div style={{ fontSize:10 }}>{new Date(item.date).toLocaleDateString('en-IN',{ year:'2-digit' })}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>

      ) : (

      /* ══════════════════════════════════════
          EXAM OVERVIEW
      ══════════════════════════════════════ */
        <>
          {/* Exam stats row */}
          {examStats && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))', gap:10, marginBottom:24, animation:'dbFadeUp .4s ease .1s both' }}>
              {[
                { val: examStats.totalTests,              label:'Tests Done',  icon:'📝', color:'var(--accent)' },
                { val: `${examStats.avgScore}%`,          label:'Avg Score',   icon:'🎯', color: scoreColor(examStats.avgScore) },
                { val: `${examStats.bestScore}%`,         label:'Best Score',  icon:'🏆', color:'#eab308' },
                { val: examStats.totalTopics,             label:'Topics',      icon:'📚', color:'var(--blue)' },
                { val: `${examStats.totalMinutes}m`,      label:'Time Spent',  icon:'⏱',  color:'var(--purple)' },
              ].map((st, i) => (
                <div key={st.label} className="db-stat-card"
                  style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'16px 12px', textAlign:'center', transition:'all .2s', position:'relative', overflow:'hidden' }}>
                  {/* Top accent bar */}
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:st.color, opacity:0.7 }} />
                  <div style={{ fontSize:10, marginBottom:6 }}>{st.icon}</div>
                  <div style={{ fontSize:22, fontWeight:900, color:st.color, lineHeight:1, marginBottom:5 }}>{st.val}</div>
                  <div style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{st.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Score trend chart */}
          {examHistory.length >= 3 && (
            <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'20px 24px', marginBottom:24, animation:'dbFadeUp .4s ease .15s both' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:8 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, marginBottom:2 }}>Score Trend</div>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>Last {Math.min(examHistory.length,20)} tests · {activeExam}</div>
                </div>
                <div style={{ display:'flex', gap:12 }}>
                  {[
                    { color:'#22c55e', label:'≥70%' },
                    { color:'#f97316', label:'50-70%' },
                    { color:'#ef4444', label:'<50%' },
                  ].map(l => (
                    <div key={l.label} style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'var(--muted)' }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:l.color }} />
                      {l.label}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex', gap:6, height:160, alignItems:'flex-end' }}>
                {/* Y axis */}
                <div style={{ display:'flex', flexDirection:'column', justifyContent:'space-between', paddingBottom:20, gap:0 }}>
                  {[100,75,50,25,0].map(v => (
                    <div key={v} style={{ fontSize:10, color:'var(--muted)', width:28, textAlign:'right', lineHeight:1 }}>{v}</div>
                  ))}
                </div>
                {/* Bars */}
                <div style={{ flex:1, display:'flex', alignItems:'flex-end', gap:3, position:'relative', paddingBottom:20 }}>
                  {[75,50,25].map(v => (
                    <div key={v} style={{ position:'absolute', left:0, right:0, height:1, background:'var(--border)', bottom:`calc(${v}% + 20px)`, opacity:.5 }} />
                  ))}
                  {examHistory.slice(0,20).reverse().map((item, i) => (
                    <div key={item.id} title={`Test ${i+1}: ${item.percent}%`}
                      style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', height:'calc(100% - 20px)', position:'relative', cursor:'default' }}>
                      <div style={{ fontSize:8, color:'var(--muted)', marginBottom:2, lineHeight:1 }}>{item.percent}</div>
                      <div style={{
                        width:'100%', borderRadius:'3px 3px 0 0', minHeight:4,
                        background: scoreColor(item.percent),
                        height:`${item.percent}%`,
                        transition:'height .5s ease',
                        opacity:0.9,
                      }} />
                      <div style={{ position:'absolute', bottom:-16, fontSize:8, color:'var(--muted)', lineHeight:1 }}>{i+1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Topic performance */}
          <div style={{ animation:'dbFadeUp .4s ease .2s both' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:8 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:2 }}>
                  Topic Performance
                </div>
                <div style={{ fontSize:11, color:'var(--muted)' }}>Tap any topic to see detailed breakdown</div>
              </div>
              {/* Weak / Strong counts */}
              <div style={{ display:'flex', gap:8 }}>
                {[
                  { label:'Strong', count: topics.filter(t=>t.avg>=75).length,  color:'#22c55e', bg:'rgba(34,197,94,.08)',  border:'rgba(34,197,94,.25)'  },
                  { label:'Weak',   count: topics.filter(t=>t.avg<50).length,   color:'#ef4444', bg:'rgba(239,68,68,.08)',  border:'rgba(239,68,68,.25)'  },
                ].map(b => b.count > 0 ? (
                  <div key={b.label} style={{ padding:'4px 10px', borderRadius:8, background:b.bg, border:`1px solid ${b.border}`, fontSize:11, fontWeight:700, color:b.color }}>
                    {b.count} {b.label}
                  </div>
                ) : null)}
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:28 }}>
              {topics.map((t, i) => {
                const badge = scoreBadge(t.avg)
                return (
                  <div key={t.topic} className="db-topic-row"
                    onClick={() => { setActiveTopic(t.topic); scrollTop() }}
                    style={{
                      background:'var(--surface)', border:'1px solid var(--border)',
                      borderRadius:14, padding:'14px 18px',
                      display:'flex', alignItems:'center', gap:14,
                      cursor:'pointer', transition:'all .18s',
                      animation:`dbFadeUp .35s ease ${i*0.04}s both`,
                    }}
                  >
                    {/* Rank */}
                    <div style={{ width:28, height:28, borderRadius:8, background:'var(--surface2)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'var(--muted)', flexShrink:0 }}>
                      {i+1}
                    </div>

                    {/* Name + meta */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4, flexWrap:'wrap' }}>
                        <span style={{ fontSize:13, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{translate(t.topic)}</span>
                        <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, fontWeight:700, background:badge.bg, border:`1px solid ${badge.border}`, color:badge.color, flexShrink:0 }}>
                          {badge.icon} {scoreLabel(t.avg)}
                        </span>
                      </div>
                      <div style={{ fontSize:11, color:'var(--muted)', display:'flex', gap:10, flexWrap:'wrap' }}>
                        <span>{t.totalTests} test{t.totalTests>1?'s':''}</span>
                        <span>Best: {t.best}%</span>
                        <span>⏱ {Math.round(t.totalTime/60)}m</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ width:80, flexShrink:0 }}>
                      <div style={{ height:5, background:'var(--surface2)', borderRadius:3, overflow:'hidden', marginBottom:4 }}>
                        <div style={{ height:'100%', width:`${t.avg}%`, background: scoreColor(t.avg), borderRadius:3, transition:'width .6s ease' }} />
                      </div>
                    </div>

                    {/* Score badge */}
                    <div style={{ width:46, height:46, borderRadius:12, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background: badge.bg, border:`1px solid ${badge.border}`, flexShrink:0 }}>
                      <span style={{ fontSize:13, fontWeight:900, color: badge.color, lineHeight:1 }}>{t.avg}%</span>
                    </div>

                    <span style={{ color:'var(--muted)', fontSize:14, flexShrink:0 }}>›</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent activity */}
          {examHistory.length > 0 && (
            <div style={{ animation:'dbFadeUp .4s ease .25s both' }}>
              <div style={{ fontSize:10, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:12 }}>
                Recent Activity — {activeExam}
              </div>
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
                {examHistory.slice(0,8).map((item, i) => (
                  <div key={item.id}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 18px', borderBottom: i < Math.min(examHistory.length,8)-1 ? '1px solid var(--border)' : 'none', transition:'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <div style={{ width:40, height:40, borderRadius:10, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background: scoreBg(item.percent), border:`1px solid ${scoreColor(item.percent)}25` }}>
                      <span style={{ fontSize:12, fontWeight:900, color: scoreColor(item.percent) }}>{item.percent}%</span>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {item.topic}
                      </div>
                      <div style={{ fontSize:11, color:'var(--muted)' }}>
                        {item.subtopic ? `${item.subtopic} · ` : ''}{item.score}/{item.total} correct
                      </div>
                    </div>
                    <div style={{ fontSize:11, color:'var(--muted)', flexShrink:0, textAlign:'right' }}>
                      {new Date(item.date).toLocaleDateString('en-IN',{ day:'numeric', month:'short' })}
                    </div>
                  </div>
                ))}
              </div>

              {examHistory.length > 8 && (
                <div style={{ textAlign:'center', marginTop:10, fontSize:12, color:'var(--muted)' }}>
                  + {examHistory.length-8} more tests. Select a topic above to see all.
                </div>
              )}
            </div>
          )}
        </>
      )}

    </div>
  )
}