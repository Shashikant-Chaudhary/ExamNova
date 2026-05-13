// ─────────────────────────────────────────────
// HomeScreen.jsx  —  Professional UI v2
// Testbook / Adda247 style — mobile first
// ALL logic identical — only UI redesigned
// ─────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { getStats, loadHistory, getWeakTopics } from '../services/storageService'
import EXAMS       from '../data/exams'
import MOCK_CONFIG from '../data/mockConfig'
import EXAM_DATES  from '../data/examDates'

const ALL_EXAMS = [
  { name: 'RRB NTPC',              icon: '🚂', color: '#3b82f6', group: 'Railway'  },
  { name: 'RRB Group D',           icon: '🚂', color: '#3b82f6', group: 'Railway'  },
  { name: 'RRB ALP',               icon: '🚂', color: '#3b82f6', group: 'Railway'  },
  { name: 'SSC CGL',               icon: '📋', color: '#f97316', group: 'SSC'      },
  { name: 'SSC CHSL',              icon: '📋', color: '#f97316', group: 'SSC'      },
  { name: 'SSC MTS',               icon: '📋', color: '#f97316', group: 'SSC'      },
  { name: 'SSC GD',                icon: '📋', color: '#f97316', group: 'SSC'      },
  { name: 'SSC JE',                icon: '⚙️', color: '#f97316', group: 'SSC'      },
  { name: 'SSC Stenographer',      icon: '📋', color: '#f97316', group: 'SSC'      },
  { name: 'IBPS PO',               icon: '🏦', color: '#22c55e', group: 'Banking'  },
  { name: 'IBPS Clerk',            icon: '🏦', color: '#22c55e', group: 'Banking'  },
  { name: 'SBI PO',                icon: '🏦', color: '#22c55e', group: 'Banking'  },
  { name: 'SBI Clerk',             icon: '🏦', color: '#22c55e', group: 'Banking'  },
  { name: 'RBI Grade B',           icon: '🏦', color: '#22c55e', group: 'Banking'  },
  { name: 'RBI Assistant',         icon: '🏦', color: '#22c55e', group: 'Banking'  },
  { name: 'LIC AAO',               icon: '🏦', color: '#22c55e', group: 'Banking'  },
  { name: 'UPSC Prelims',          icon: '🎯', color: '#a855f7', group: 'UPSC'     },
  { name: 'UPSC CDS',              icon: '🎯', color: '#a855f7', group: 'UPSC'     },
  { name: 'NDA',                   icon: '🎖️', color: '#6366f1', group: 'Defence'  },
  { name: 'AFCAT',                 icon: '✈️', color: '#6366f1', group: 'Defence'  },
  { name: 'State PSC',             icon: '🏛️', color: '#eab308', group: 'State'   },
  { name: 'Delhi Police Constable',icon: '🚔', color: '#eab308', group: 'State'   },
]

const GROUP_META = {
  Railway: { desc: 'RRB exams — loco pilot, technician & non-technical posts', icon: '🚂', color: '#3b82f6', vacancies: '1.5 Lakh+' },
  SSC:     { desc: 'Staff Selection Commission — central govt jobs across India', icon: '📋', color: '#f97316', vacancies: '2 Lakh+' },
  Banking: { desc: 'IBPS, SBI & RBI exams — PO, clerk & officer positions', icon: '🏦', color: '#22c55e', vacancies: '50,000+' },
  UPSC:    { desc: 'Civil services & combined defence services examinations', icon: '🎯', color: '#a855f7', vacancies: '1,000+' },
  Defence: { desc: 'NDA, AFCAT & Indian Air Force examinations', icon: '🎖️', color: '#6366f1', vacancies: '10,000+' },
  State:   { desc: 'State PSC & police exams — state government jobs', icon: '🏛️', color: '#eab308', vacancies: 'Varies' },
}

const TRUST_STATS = [
  { val: '22+',  label: 'Exams',    icon: '📋' },
  { val: '10K+', label: 'Students', icon: '👨‍🎓' },
  { val: '100%', label: 'Free',     icon: '🆓' },
  { val: 'AI',   label: 'Powered',  icon: '🤖' },
]

function getDaysUntilExam(dateStr) {
  if (!dateStr) return null
  const examDate = new Date(dateStr)
  const today    = new Date()
  today.setHours(0, 0, 0, 0)
  examDate.setHours(0, 0, 0, 0)
  const diff = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : null
}

function getCountdownMeta(days) {
  if (days <= 15) return { bg: 'linear-gradient(135deg,#7f1d1d,#dc2626)', border: '#ef4444', badge: '🚨 URGENT', msg: 'Time is running out!' }
  if (days <= 30) return { bg: 'linear-gradient(135deg,#431407,#ea580c)', border: '#f97316', badge: '🔥 FINAL STRETCH', msg: 'Practice every single day!' }
  if (days <= 60) return { bg: 'linear-gradient(135deg,#422006,#d97706)', border: '#f59e0b', badge: '⚡ PREP IN FULL SWING', msg: "Cover all topics before it's late." }
  return           { bg: 'linear-gradient(135deg,#0c1a4e,#1d4ed8)',        border: '#3b82f6', badge: '📅 EXAM SCHEDULED', msg: 'Build your foundation now.' }
}

// ── Category Browser Component ────────────────
function CategoryBrowser({ id, selectedExam, handleExamClick, navigate }) {
  const [activeGroup, setActiveGroup] = useState('SSC')

  const categories = [
    { id:'Railway', icon:'🚂', color:'#3b82f6', label:'Railway', sub:'RRB Exams',       exams:['RRB NTPC','RRB Group D','RRB ALP'] },
    { id:'SSC',     icon:'📋', color:'#f97316', label:'SSC',     sub:'Staff Selection', exams:['SSC CGL','SSC CHSL','SSC MTS','SSC GD','SSC JE','SSC Stenographer'] },
    { id:'Banking', icon:'🏦', color:'#22c55e', label:'Banking', sub:'IBPS, SBI, RBI',  exams:['IBPS PO','IBPS Clerk','SBI PO','SBI Clerk','RBI Grade B','RBI Assistant','LIC AAO'] },
    { id:'UPSC',    icon:'🎯', color:'#a855f7', label:'UPSC',    sub:'Civil Services',  exams:['UPSC Prelims','UPSC CDS'] },
    { id:'Defence', icon:'🎖️', color:'#6366f1', label:'Defence', sub:'NDA, AFCAT',      exams:['NDA','AFCAT'] },
    { id:'State',   icon:'🏛️', color:'#eab308', label:'State',   sub:'PSC, Police',     exams:['State PSC','Delhi Police Constable'] },
  ]
  const active = categories.find(c => c.id === activeGroup) || categories[0]

  return (
    <div id={id} style={{ marginBottom:28, animation:'hmFadeUp .4s ease .3s both' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
        <div style={{ width:4, height:18, borderRadius:2, background:'linear-gradient(180deg,#f97316,#3b82f6)' }} />
        <span style={{ fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.6px', color:'var(--muted)' }}>Browse by Category</span>
      </div>

      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:18, overflow:'hidden', display:'flex', minHeight:260 }}>

        {/* Left: category tabs */}
        <div style={{ width:90, flexShrink:0, borderRight:'1px solid var(--border)', background:'var(--surface2)', display:'flex', flexDirection:'column', gap:2, padding:'8px 5px' }}>
          {categories.map(cat => {
            const isAct = cat.id === activeGroup
            return (
              <button key={cat.id} onClick={() => setActiveGroup(cat.id)}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'9px 4px', borderRadius:10, border:'none', background:isAct?`${cat.color}12`:'transparent', cursor:'pointer', transition:'all .15s', borderLeft:`3px solid ${isAct?cat.color:'transparent'}` }}>
                <span style={{ fontSize:18 }}>{cat.icon}</span>
                <span style={{ fontSize:9, fontWeight:isAct?800:500, color:isAct?cat.color:'var(--muted2)', textAlign:'center', lineHeight:1.3 }}>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Right: exam list */}
        <div style={{ flex:1, minWidth:0, padding:'12px 10px' }}>
          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:10, paddingBottom:10, borderBottom:'1px solid var(--border)' }}>
            <div style={{ width:32, height:32, borderRadius:9, background:`${active.color}15`, border:`1px solid ${active.color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
              {active.icon}
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:800, color:active.color }}>{active.label} Exams</div>
              <div style={{ fontSize:10, color:'var(--muted)' }}>{active.sub}</div>
            </div>
            <div style={{ marginLeft:'auto', fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:5, background:`${active.color}10`, border:`1px solid ${active.color}25`, color:active.color }}>
              {active.exams.length} Exams
            </div>
          </div>

          {/* Exam rows */}
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {active.exams.map(examName => {
              const hasData    = !!EXAMS[examName]
              const cfg        = MOCK_CONFIG[examName]
              const isSelected = selectedExam === examName
              return (
                <div key={examName}
                  onClick={() => hasData && handleExamClick({ name:examName, icon:active.icon, color:active.color, group:active.id })}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:9, border:`1px solid ${isSelected?active.color:'var(--border)'}`, background:isSelected?`${active.color}08`:'transparent', cursor:hasData?'pointer':'default', opacity:hasData?1:0.5, transition:'all .15s' }}
                  onMouseEnter={e => hasData && (e.currentTarget.style.background=`${active.color}10`)}
                  onMouseLeave={e => e.currentTarget.style.background = isSelected?`${active.color}08`:'transparent'}
                >
                  <div style={{ width:32, height:32, borderRadius:9, background:`${active.color}12`, border:`1px solid ${active.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                    {active.icon}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:1 }}>{examName}</div>
                    {hasData && cfg
                      ? <div style={{ fontSize:10, color:'var(--muted)' }}>{cfg.totalQuestions}Q · {cfg.duration}min<span style={{ color:'var(--green)', fontWeight:700 }}> · Free</span></div>
                      : <div style={{ fontSize:10, color:'var(--muted)' }}>Coming Soon</div>
                    }
                  </div>
                  {hasData ? (
                    isSelected
                      ? <div style={{ fontSize:8, fontWeight:800, padding:'2px 7px', borderRadius:4, background:active.color, color:'white', flexShrink:0 }}>ACTIVE</div>
                      : <span style={{ fontSize:16, color:'var(--muted)' }}>›</span>
                  ) : (
                    <span style={{ fontSize:9, fontWeight:700, color:'var(--muted)', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:3, padding:'1px 5px' }}>Soon</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomeScreen({
  user, navigate, onSelectExam, onStartMock,
  selectedExam, language, onLanguageChange,
}) {
  const [stats,      setStats]      = useState(null)
  const [history,    setHistory]    = useState([])
  const [isFirstTime,setIsFirstTime]= useState(false)
  const [dismissed,  setDismissed]  = useState(false)
  const [weakTopics, setWeakTopics] = useState([])

  useEffect(() => {
    const load = async () => {
      const s = await getStats()
      const h = await loadHistory()
      setStats(s)
      setHistory(h.slice(-4).reverse())
      const seen = localStorage.getItem('examai_onboarded')
      if (!seen && (!h || h.length === 0)) setIsFirstTime(true)
      const weak = await getWeakTopics()
      setWeakTopics(weak.slice(0, 3))
    }
    load()
  }, [])

  const dismissOnboarding = () => {
    localStorage.setItem('examai_onboarded', '1')
    setDismissed(true)
    setIsFirstTime(false)
  }

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const scoreColor = (p) => p >= 70 ? 'var(--green)' : p >= 50 ? 'var(--accent)' : 'var(--red)'
  const groups     = [...new Set(ALL_EXAMS.map(e => e.group))]

  const handleExamClick = (exam) => {
    if (!EXAMS[exam.name]) return
    onSelectExam(exam.name, false)
    navigate('examhub')
  }

  const selectedExamDays = selectedExam ? getDaysUntilExam(EXAM_DATES[selectedExam]) : null
  const selectedExamDate = selectedExam ? EXAM_DATES[selectedExam] : null

  const upcomingStrip = ALL_EXAMS
    .map(e => ({ ...e, days: getDaysUntilExam(EXAM_DATES[e.name]) }))
    .filter(e => e.days !== null && e.name !== selectedExam)
    .sort((a, b) => a.days - b.days)
    .slice(0, 5)

  const firstName = user?.name
    ? user.name.split(' ')[0].charAt(0).toUpperCase() + user.name.split(' ')[0].slice(1)
    : 'Student'

  // ── Shared exam card data builder ──
  const buildCardData = (exam) => ({
    hasData:    !!EXAMS[exam.name],
    cfg:        MOCK_CONFIG[exam.name],
    examData:   EXAMS[exam.name],
    isActive:   selectedExam === exam.name,
    examDays:   getDaysUntilExam(EXAM_DATES[exam.name]),
    topicCount: EXAMS[exam.name]?.topics?.length || 0,
    hasHindi:   EXAMS[exam.name]?.topics?.some(t => t.name === 'Hindi') || false,
  })

  return (
    <div className="page">
      <style>{`
        @keyframes hmFadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hmFloat   { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-10px) rotate(1deg)} }
        @keyframes hmSpin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes hmPulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.2)} }
        @keyframes hmMarquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes hmCardIn  { from{opacity:0;transform:translateY(18px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }

        .hm-exam-card { transition:all .22s cubic-bezier(.4,0,.2,1) !important; cursor:pointer; }
        .hm-exam-card:hover { transform:translateY(-5px) scale(1.02) !important; box-shadow:0 20px 48px rgba(0,0,0,.25) !important; z-index:2; }
        .hm-exam-card:active { transform:scale(.97) !important; }

        .hm-feature-card { transition:all .2s ease; }
        .hm-feature-card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,.15); }

        .hm-weak-row { transition:all .15s ease; }
        .hm-weak-row:hover { transform:translateX(4px); }

        .hm-upcoming-chip { transition:all .15s; }
        .hm-upcoming-chip:hover { transform:translateY(-2px); }

        .hm-marquee-wrap  { overflow:hidden; white-space:nowrap; }
        .hm-marquee-inner { display:inline-block; animation:hmMarquee 30s linear infinite; }
        .hm-marquee-inner:hover { animation-play-state:paused; }

        /* Mobile: list cards | Desktop: grid cards */
        @media (max-width: 767px) {
          .hm-mobile-cards  { display:block !important; }
          .hm-desktop-cards { display:none  !important; }
        }
        @media (min-width: 768px) {
          .hm-mobile-cards  { display:none  !important; }
          .hm-desktop-cards { display:grid  !important; }
        }
        .hm-mobile-row:active { background:rgba(255,255,255,.04) !important; }
      `}</style>

      {/* ── HERO — first-time users ── */}
      {isFirstTime && !dismissed && (
        <div style={{ background:'linear-gradient(135deg,#0c1a4e 0%,#1d2f6e 40%,#0f1a35 100%)', borderRadius:24, padding:'clamp(24px,5vw,40px)', marginBottom:24, color:'white', position:'relative', overflow:'hidden', animation:'hmFadeUp .5s ease both', border:'1px solid rgba(59,130,246,.25)' }}>
          <div style={{ position:'absolute', top:-60, right:-60, width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle,rgba(59,130,246,.18) 0%,transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-40, left:-20, width:160, height:160, borderRadius:'50%', background:'radial-gradient(circle,rgba(249,115,22,.12) 0%,transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:20, right:24, display:'flex', flexDirection:'column', gap:8, opacity:.15, pointerEvents:'none' }}>
            {['📝','🏆','📊'].map((ico, i) => (
              <div key={i} style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, animation:`hmFloat ${2+i*0.5}s ease-in-out infinite`, animationDelay:`${i*0.4}s` }}>{ico}</div>
            ))}
          </div>
          {/* Ashoka Chakra watermark */}
          <div style={{ position:'absolute', bottom:-20, right:-20, opacity:.07, pointerEvents:'none' }}>
            <svg viewBox="0 0 120 120" width={130} height={130} style={{ animation:'hmSpin 20s linear infinite', transformOrigin:'center' }}>
              <circle cx="60" cy="60" r="56" fill="none" stroke="#FF9933" strokeWidth="3"/>
              <circle cx="60" cy="60" r="16" fill="none" stroke="#FF9933" strokeWidth="2"/>
              {Array.from({length:24}).map((_,i)=>{const a=((i*15-90)*Math.PI)/180;return<line key={i} x1={60+18*Math.cos(a)} y1={60+18*Math.sin(a)} x2={60+53*Math.cos(a)} y2={60+53*Math.sin(a)} stroke="#FF9933" strokeWidth="1.5"/>})}
              <circle cx="60" cy="60" r="5" fill="#FF9933"/>
            </svg>
          </div>
          <div style={{ position:'relative', zIndex:1, maxWidth:600 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.2)', borderRadius:20, padding:'5px 14px', marginBottom:18, fontSize:11, fontWeight:800 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', animation:'hmPulse 2s infinite', display:'inline-block' }} />
              🇮🇳 Trusted by 10,000+ Indian Students · 100% Free
            </div>
            <h1 style={{ fontSize:'clamp(22px,4vw,36px)', fontWeight:900, marginBottom:12, lineHeight:1.25, letterSpacing:'-0.5px' }}>
              Crack Your Government Exam<br /><span style={{ color:'#60a5fa' }}>with AI-Powered Practice</span>
            </h1>
            <p style={{ fontSize:14, color:'rgba(255,255,255,.75)', lineHeight:1.8, marginBottom:22, maxWidth:480 }}>
              Fresh AI-generated questions · Real exam patterns · SSC, Railway, Banking & UPSC
            </p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:22 }}>
              {['🤖 AI Questions','📝 Mock Tests','📰 Current Affairs','📊 Progress Tracker','🔖 Save Questions','🏆 Leaderboard'].map(f => (
                <div key={f} style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.18)', borderRadius:8, padding:'6px 12px', fontSize:12, fontWeight:600 }}>{f}</div>
              ))}
            </div>
            <div style={{ background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.12)', borderRadius:12, padding:'12px 16px', marginBottom:22, fontSize:13 }}>
              <strong style={{ color:'#93c5fd' }}>3 steps:</strong>
              <span style={{ color:'rgba(255,255,255,.8)', marginLeft:8 }}>Select exam → Choose topic → Start answering!</span>
            </div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <button onClick={dismissOnboarding} style={{ padding:'12px 28px', borderRadius:12, background:'linear-gradient(135deg,#f97316,#ea580c)', border:'none', color:'white', fontSize:14, fontWeight:800, cursor:'pointer', boxShadow:'0 6px 20px rgba(249,115,22,.45)' }}>
                🚀 Start Practicing — It's Free!
              </button>
              <button onClick={dismissOnboarding} style={{ padding:'12px 20px', borderRadius:12, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.2)', color:'white', fontSize:13, cursor:'pointer' }}>
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TRUST STATS ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:20, animation:'hmFadeUp .4s ease .05s both' }}>
        {TRUST_STATS.map(st => (
          <div key={st.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'14px 10px', textAlign:'center', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,var(--accent),transparent)', opacity:.5 }} />
            <div style={{ fontSize:18, marginBottom:4 }}>{st.icon}</div>
            <div style={{ fontSize:17, fontWeight:900, color:'var(--accent)', lineHeight:1 }}>{st.val}</div>
            <div style={{ fontSize:9, color:'var(--muted)', marginTop:3, textTransform:'uppercase', letterSpacing:'0.5px' }}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* ── WELCOME BANNER ── */}
      <div style={{ background:'linear-gradient(135deg,rgba(249,115,22,.06) 0%,var(--surface) 60%)', border:'1px solid var(--border)', borderRadius:18, padding:'clamp(16px,4vw,24px)', marginBottom:20, animation:'hmFadeUp .4s ease .1s both', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:4, background:'linear-gradient(180deg,var(--accent),#ea580c)', borderRadius:'0 2px 2px 0' }} />
        <div style={{ paddingLeft:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <h1 style={{ fontSize:'clamp(16px,3vw,22px)', fontWeight:800, lineHeight:1.3 }}>{getGreeting()}, {firstName} 👋</h1>
            {stats?.streak > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(249,115,22,.1)', border:'1px solid rgba(249,115,22,.3)', borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:700, color:'var(--accent)' }}>
                <span style={{ animation:'hmPulse 2s infinite' }}>🔥</span> {stats.streak} day streak
              </div>
            )}
          </div>
          <p style={{ fontSize:13, color:'var(--muted2)', lineHeight:1.6, maxWidth:380 }}>
            {stats && stats.totalTests > 0
              ? `You've taken ${stats.totalTests} tests · Keep going — consistency beats talent!`
              : 'Select an exam below and start your preparation.'}
          </p>
        </div>
        {stats && stats.totalTests > 0 && (
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {[
              { val:stats.totalTests,      label:'Tests',  col:'var(--accent)' },
              { val:`${stats.avgScore}%`,  label:'Avg',    col:scoreColor(stats.avgScore) },
              { val:`${stats.streak}🔥`,   label:'Streak', col:'var(--accent)' },
              { val:stats.totalTopics,     label:'Topics', col:'var(--blue)' },
            ].map(st => (
              <div key={st.label} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:12, padding:'10px 14px', textAlign:'center', minWidth:56 }}>
                <div style={{ fontSize:17, fontWeight:800, color:st.col, lineHeight:1 }}>{st.val}</div>
                <div style={{ fontSize:9, color:'var(--muted)', marginTop:3, textTransform:'uppercase', letterSpacing:'0.5px' }}>{st.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SCROLLING NOTICE BAR ── */}
      <div style={{ background:'rgba(234,179,8,.05)', border:'1px solid rgba(234,179,8,.25)', borderRadius:10, padding:'9px 0', marginBottom:20, display:'flex', alignItems:'center', overflow:'hidden', animation:'hmFadeUp .4s ease .15s both' }}>
        <div style={{ background:'rgba(234,179,8,.15)', borderRight:'1px solid rgba(234,179,8,.25)', padding:'0 14px', fontSize:10, fontWeight:800, color:'#ca8a04', textTransform:'uppercase', letterSpacing:'0.5px', flexShrink:0, whiteSpace:'nowrap', height:'100%', display:'flex', alignItems:'center' }}>
          📢 Notice
        </div>
        <div className="hm-marquee-wrap" style={{ flex:1, paddingLeft:12 }}>
          <div className="hm-marquee-inner" style={{ fontSize:12, color:'var(--muted2)' }}>
            All questions AI-generated matching real exam patterns &nbsp;·&nbsp; New shift papers added regularly &nbsp;·&nbsp; 100% Free — No hidden charges &nbsp;·&nbsp; SSC, Railway, Banking & UPSC covered &nbsp;·&nbsp; Practice daily for best results &nbsp;·&nbsp; All questions AI-generated matching real exam patterns &nbsp;·&nbsp; New shift papers added regularly &nbsp;·&nbsp; 100% Free — No hidden charges &nbsp;·&nbsp; SSC, Railway, Banking & UPSC covered &nbsp;·&nbsp; Practice daily for best results
          </div>
        </div>
      </div>

      {/* ── WEAK TOPICS ── */}
      {weakTopics.length > 0 && !isFirstTime && (
        <div style={{ marginBottom:24, animation:'hmFadeUp .4s ease .2s both' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <div style={{ width:4, height:18, borderRadius:2, background:'var(--red)' }} />
            <span style={{ fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.6px' }}>🎯 Focus Areas — Improve These Topics</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {weakTopics.map(wt => (
              <div key={wt.topic} className="hm-weak-row"
                onClick={() => { if(selectedExam) { onSelectExam(selectedExam, false); navigate('topics') } }}
                style={{ background:wt.avg<40?'rgba(239,68,68,.04)':'rgba(245,158,11,.04)', border:`1px solid ${wt.avg<40?'rgba(239,68,68,.2)':'rgba(245,158,11,.18)'}`, borderRadius:12, padding:'12px 16px', cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:wt.avg<40?'rgba(239,68,68,.1)':'rgba(245,158,11,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                  {wt.avg < 40 ? '⚠️' : '📈'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:5 }}>
                    Only <span style={{ color:wt.avg<40?'var(--red)':'#f59e0b', fontWeight:900 }}>{wt.avg}%</span> in <span style={{ color:'var(--text)' }}>{wt.topic}</span>
                  </div>
                  <div style={{ height:4, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${wt.avg}%`, background:wt.avg<40?'var(--red)':'#f59e0b', borderRadius:2, transition:'width .8s ease' }} />
                  </div>
                </div>
                <div style={{ fontSize:11, fontWeight:700, color:wt.avg<40?'var(--red)':'#f59e0b', flexShrink:0 }}>Practice →</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── EXAM COUNTDOWN ── */}
      {selectedExam && selectedExamDays !== null && (() => {
        const meta = getCountdownMeta(selectedExamDays)
        const totalDays = (() => {
          const start = new Date(); start.setDate(start.getDate() - 180)
          const end   = new Date(selectedExamDate)
          return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
        })()
        const progress = Math.min(100, Math.round((Math.max(0, totalDays - selectedExamDays) / totalDays) * 100))
        return (
          <div style={{ background:meta.bg, borderRadius:18, padding:'clamp(16px,3vw,22px)', marginBottom:24, color:'white', position:'relative', overflow:'hidden', animation:'hmFadeUp .4s ease .2s both', border:'1px solid rgba(255,255,255,.12)' }}>
            <div style={{ position:'absolute', top:-40, right:-40, width:150, height:150, borderRadius:'50%', border:'1px solid rgba(255,255,255,.08)', pointerEvents:'none' }} />
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:14 }}>
                <div>
                  <div style={{ display:'inline-flex', alignItems:'center', background:'rgba(255,255,255,.15)', borderRadius:20, padding:'3px 12px', fontSize:10, fontWeight:800, marginBottom:8 }}>{meta.badge}</div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,.7)', marginBottom:2 }}>{selectedExam} Exam</div>
                  <div style={{ fontSize:'clamp(22px,5vw,32px)', fontWeight:900, letterSpacing:'-0.5px', lineHeight:1 }}>{selectedExamDays} days left</div>
                </div>
                <div style={{ width:68, height:68, borderRadius:'50%', background:'rgba(255,255,255,.12)', border:'2px solid rgba(255,255,255,.25)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0, animation:selectedExamDays<=30?'hmPulse 2s infinite':'none' }}>
                  <span style={{ fontSize:20, fontWeight:900, lineHeight:1 }}>{selectedExamDays}</span>
                  <span style={{ fontSize:8, opacity:.8, textTransform:'uppercase' }}>days</span>
                </div>
              </div>
              <div style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'rgba(255,255,255,.6)', marginBottom:5 }}>
                  <span>Prep timeline</span><span>{progress}% used</span>
                </div>
                <div style={{ height:5, background:'rgba(255,255,255,.12)', borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${progress}%`, background:'rgba(255,255,255,.8)', borderRadius:3, transition:'width 1s ease' }} />
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
                <span style={{ fontSize:12, color:'rgba(255,255,255,.7)', fontStyle:'italic' }}>{meta.msg}</span>
                <button onClick={() => { onSelectExam(selectedExam, false); navigate('topics') }}
                  style={{ padding:'8px 18px', borderRadius:9, background:'rgba(255,255,255,.18)', border:'1px solid rgba(255,255,255,.3)', color:'white', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                  Practice Now →
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── UPCOMING EXAMS STRIP ── */}
      {upcomingStrip.length > 0 && (
        <div style={{ marginBottom:24, animation:'hmFadeUp .4s ease .25s both' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <div style={{ width:4, height:16, borderRadius:2, background:'var(--blue)' }} />
            <span style={{ fontSize:11, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.6px' }}>⏳ Upcoming Exams</span>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {upcomingStrip.map(e => {
              const urgent = e.days <= 30
              return (
                <div key={e.name} className="hm-upcoming-chip"
                  onClick={() => { if(EXAMS[e.name]) { onSelectExam(e.name, false); navigate('examhub') } }}
                  style={{ background:urgent?'rgba(239,68,68,.06)':'var(--surface)', border:`1px solid ${urgent?'rgba(239,68,68,.25)':'var(--border)'}`, borderRadius:10, padding:'8px 14px', cursor:EXAMS[e.name]?'pointer':'default', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:14 }}>{e.icon}</span>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700 }}>{e.name}</div>
                    <div style={{ fontSize:10, color:urgent?'var(--red)':'var(--muted)', fontWeight:urgent?700:400 }}>{e.days}d left</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── QUICK ACTION ICONS (Adda247 style) ── */}
      <div style={{ marginBottom:24, animation:'hmFadeUp .4s ease .28s both' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
          {[
            { icon:'✏️', label:'Practice',     color:'#3b82f6', action:()=>navigate('topics')    },
            { icon:'📝', label:'Mock Tests',   color:'#f97316', action:()=>navigate('mock')      },
            { icon:'📰', label:'Current\nAffairs', color:'#22c55e', action:()=>navigate('current')  },
            { icon:'📊', label:'Progress',     color:'#a855f7', action:()=>navigate('dashboard') },
            { icon:'📋', label:'Shift\nPapers',color:'#eab308', action:()=>navigate('shifts')    },
          ].map(q => (
            <button key={q.label} onClick={q.action}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', padding:'4px 0' }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:`${q.color}15`, border:`1.5px solid ${q.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, transition:'all .18s', boxShadow:`0 2px 10px ${q.color}20` }}
                onMouseEnter={e=>{ e.currentTarget.style.background=`${q.color}25`; e.currentTarget.style.transform='translateY(-2px)' }}
                onMouseLeave={e=>{ e.currentTarget.style.background=`${q.color}15`; e.currentTarget.style.transform='none' }}
              >{q.icon}</div>
              <span style={{ fontSize:10, color:'var(--muted2)', fontWeight:600, textAlign:'center', lineHeight:1.3, whiteSpace:'pre-line' }}>{q.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════
          CATEGORY BROWSER — Testbook left-tab style
      ════════════════════════════════════════ */}
      <CategoryBrowser
        id="category-browser"
        selectedExam={selectedExam}
        handleExamClick={handleExamClick}
        navigate={navigate}
      />

      {/* ── EXAM GROUPS ── */}
      {groups.map((group, gi) => {
        const meta       = GROUP_META[group]
        const groupExams = ALL_EXAMS.filter(e => e.group === group)

        return (
          <div key={group} style={{ marginBottom:32, animation:`hmFadeUp .4s ease ${0.05*gi}s both` }}>

            {/* Group header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, paddingBottom:12, borderBottom:`2px solid ${meta.color}22` }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:4, height:36, borderRadius:2, background:meta.color, flexShrink:0 }} />
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:18 }}>{meta.icon}</span>
                    <span style={{ fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.7px' }}>{group} Exams</span>
                  </div>
                  <div style={{ fontSize:11, color:'var(--muted)', marginTop:1 }}>{meta.desc}</div>
                </div>
              </div>
              <div style={{ fontSize:11, fontWeight:700, color:meta.color, background:`${meta.color}12`, border:`1px solid ${meta.color}30`, borderRadius:8, padding:'4px 10px', whiteSpace:'nowrap', flexShrink:0 }}>
                {meta.vacancies} vacancies
              </div>
            </div>

            {/* ── MOBILE LIST (Adda247 style) ── */}
            <div className="hm-mobile-cards" style={{ display:'none', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
              {groupExams.map((exam, ei) => {
                const { hasData, cfg, isActive, examDays, topicCount, hasHindi } = buildCardData(exam)
                return (
                  <div key={exam.name} className="hm-mobile-row"
                    onClick={() => hasData && handleExamClick(exam)}
                    style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderBottom: ei < groupExams.length-1 ? '1px solid var(--border)' : 'none', background:isActive?`${exam.color}06`:'transparent', cursor:hasData?'pointer':'default', opacity:hasData?1:0.5, transition:'background .15s', animation:`hmCardIn .35s ease ${0.04*ei}s both` }}
                    onMouseEnter={e => hasData && (e.currentTarget.style.background=`${exam.color}08`)}
                    onMouseLeave={e => (e.currentTarget.style.background = isActive ? `${exam.color}06` : 'transparent')}
                  >
                    {/* Circle logo */}
                    <div style={{ position:'relative', flexShrink:0 }}>
                      <div style={{ width:52, height:52, borderRadius:'50%', background:`linear-gradient(135deg,${exam.color}30,${exam.color}15)`, border:`2px solid ${exam.color}35`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>
                        {exam.icon}
                      </div>
                      <div style={{ position:'absolute', bottom:-5, left:'50%', transform:'translateX(-50%)', background:isActive?exam.color:(examDays&&examDays<=30?'#ef4444':exam.color), color:'white', fontSize:8, fontWeight:800, padding:'1px 6px', borderRadius:4, whiteSpace:'nowrap' }}>
                        {isActive ? 'ACTIVE' : (examDays && examDays <= 30 ? `${examDays}D` : 'FREE')}
                      </div>
                    </div>

                    {/* Text */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:700, marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{exam.name}</div>
                      {hasData && cfg ? (
                        <>
                          <div style={{ fontSize:12, color:'var(--muted2)', marginBottom:4 }}>
                            {topicCount} Topics · {cfg.totalQuestions} Qs
                            <span style={{ color:'var(--green)', fontWeight:700 }}> | Free</span>
                          </div>
                          <div style={{ display:'flex', gap:6 }}>
                            <span style={{ fontSize:10, color:'#3b82f6', fontWeight:600 }}>English</span>
                            {hasHindi && <span style={{ fontSize:10, color:'var(--accent)', fontWeight:600 }}>· Hindi</span>}
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize:12, color:'var(--muted)', fontWeight:600 }}>🔜 Coming Soon</div>
                      )}
                    </div>

                    {/* CTA */}
                    {hasData && (
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6, flexShrink:0 }}>
                        <button onClick={e => { e.stopPropagation(); onSelectExam(exam.name, false); navigate('topics') }}
                          style={{ padding:'7px 14px', borderRadius:8, background:`linear-gradient(135deg,${exam.color},${exam.color}cc)`, border:'none', color:'white', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
                          Practice
                        </button>
                        <span style={{ fontSize:18, color:'var(--muted)', lineHeight:1 }}>›</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* ── DESKTOP GRID (Testbook style) ── */}
            <div className="hm-desktop-cards" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14 }}>
              {groupExams.map((exam, ei) => {
                const { hasData, cfg, examData, isActive, examDays, topicCount, hasHindi } = buildCardData(exam)
                return (
                  <div key={exam.name} className="hm-exam-card"
                    style={{ background:'var(--surface)', border:`1.5px solid ${isActive?exam.color:'var(--border)'}`, borderRadius:16, cursor:hasData?'pointer':'default', opacity:hasData?1:0.5, overflow:'hidden', display:'flex', flexDirection:'column', animation:`hmCardIn .4s ease ${0.04*ei}s both`, boxShadow:isActive?`0 8px 28px ${exam.color}25`:'0 2px 8px rgba(0,0,0,.08)' }}
                    onClick={() => hasData && handleExamClick(exam)}
                  >
                    {/* Card header */}
                    <div style={{ background:`linear-gradient(135deg,${exam.color}22,${exam.color}08)`, borderBottom:`1px solid ${exam.color}20`, padding:'16px 16px 14px' }}>
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
                        <div style={{ width:52, height:52, borderRadius:14, flexShrink:0, background:`linear-gradient(135deg,${exam.color}30,${exam.color}15)`, border:`1.5px solid ${exam.color}35`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, boxShadow:`0 4px 14px ${exam.color}30` }}>
                          {exam.icon}
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5 }}>
                          {isActive && (
                            <div style={{ display:'flex', alignItems:'center', gap:4, background:`${exam.color}20`, border:`1px solid ${exam.color}50`, borderRadius:20, padding:'2px 9px', fontSize:9, fontWeight:800, color:exam.color }}>
                              <span style={{ width:5, height:5, borderRadius:'50%', background:exam.color, animation:'hmPulse 2s infinite', display:'inline-block' }} />ACTIVE
                            </div>
                          )}
                          {examDays !== null && examDays <= 60 && hasData && (
                            <div style={{ background:examDays<=15?'#ef444415':examDays<=30?'#f9731615':'#eab30815', border:`1px solid ${examDays<=15?'#ef444440':examDays<=30?'#f9731640':'#eab30840'}`, borderRadius:20, padding:'2px 9px', fontSize:9, fontWeight:800, color:examDays<=15?'var(--red)':examDays<=30?'var(--accent)':'#ca8a04', whiteSpace:'nowrap' }}>
                              ⏰ {examDays}d left
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ marginTop:12 }}>
                        <div style={{ fontSize:15, fontWeight:800, lineHeight:1.3, marginBottom:2 }}>{exam.name}</div>
                        <div style={{ fontSize:11, color:'var(--muted2)', lineHeight:1.4 }}>{examData?.fullName || 'Government Exam'}</div>
                      </div>
                    </div>

                    {/* Card body */}
                    <div style={{ padding:'12px 16px', flex:1, display:'flex', flexDirection:'column', gap:10 }}>
                      {hasData && cfg && (
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                          {[{icon:'❓',val:`${cfg.totalQuestions} Qs`},{icon:'⏱',val:`${cfg.duration} min`},{icon:'📚',val:`${topicCount} Topics`}].map(s => (
                            <div key={s.val} style={{ display:'flex', alignItems:'center', gap:4, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:6, padding:'3px 8px', fontSize:10, fontWeight:600, color:'var(--muted2)' }}>
                              <span style={{ fontSize:9 }}>{s.icon}</span>{s.val}
                            </div>
                          ))}
                        </div>
                      )}
                      {hasData && (
                        <div style={{ display:'flex', gap:5 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(59,130,246,.08)', border:'1px solid rgba(59,130,246,.2)', borderRadius:6, padding:'3px 8px', fontSize:10, fontWeight:700, color:'#3b82f6' }}>🇬🇧 English</div>
                          {hasHindi && <div style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(249,115,22,.08)', border:'1px solid rgba(249,115,22,.2)', borderRadius:6, padding:'3px 8px', fontSize:10, fontWeight:700, color:'var(--accent)' }}>🇮🇳 हिंदी</div>}
                          <div style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.2)', borderRadius:6, padding:'3px 8px', fontSize:10, fontWeight:700, color:'var(--green)' }}>🆓 Free</div>
                        </div>
                      )}
                      {hasData ? (
                        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                          {['AI Practice Questions','Full Mock Tests','Current Affairs MCQs'].map(f => (
                            <div key={f} style={{ fontSize:11, color:'var(--muted2)', display:'flex', alignItems:'center', gap:6 }}>
                              <span style={{ color:'var(--green)', fontWeight:700, fontSize:10 }}>✓</span><span>{f}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ display:'flex', alignItems:'center', gap:6, background:'var(--surface2)', borderRadius:8, padding:'8px 12px', fontSize:12, color:'var(--muted)' }}>
                          🔜 Coming Soon
                        </div>
                      )}
                    </div>

                    {/* Card footer */}
                    {hasData && (
                      <div style={{ padding:'0 12px 14px', display:'flex', gap:8 }}>
                        <button onClick={e=>{ e.stopPropagation(); onSelectExam(exam.name,false); navigate('topics') }}
                          style={{ flex:2, padding:'9px 0', background:`linear-gradient(135deg,${exam.color},${exam.color}cc)`, border:'none', borderRadius:10, color:'white', fontSize:12, fontWeight:800, cursor:'pointer', transition:'all .18s', boxShadow:`0 3px 12px ${exam.color}35` }}
                          onMouseEnter={e=>e.currentTarget.style.filter='brightness(1.1)'}
                          onMouseLeave={e=>e.currentTarget.style.filter='none'}
                        >Start Practice →</button>
                        <button onClick={e=>{ e.stopPropagation(); onStartMock(exam.name) }}
                          style={{ flex:1, padding:'9px 0', background:'var(--surface2)', border:`1px solid ${exam.color}35`, borderRadius:10, color:exam.color, fontSize:11, fontWeight:700, cursor:'pointer', transition:'all .18s' }}
                          onMouseEnter={e=>e.currentTarget.style.background=`${exam.color}12`}
                          onMouseLeave={e=>e.currentTarget.style.background='var(--surface2)'}
                        >📝 Mock</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

          </div>
        )
      })}

      {/* ── RECENT ACTIVITY ── */}
      {history.length > 0 && (
        <div style={{ marginBottom:24, animation:'hmFadeUp .4s ease .3s both' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:4, height:16, borderRadius:2, background:'var(--blue)' }} />
              <span style={{ fontSize:11, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.6px' }}>Recent Activity</span>
            </div>
            <button onClick={() => navigate('dashboard')} style={{ fontSize:12, color:'var(--accent)', background:'transparent', border:'none', cursor:'pointer', fontWeight:600, padding:'4px 8px' }}>
              View All →
            </button>
          </div>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
            {history.map((item, i) => (
              <div key={item.id}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom:i<history.length-1?'1px solid var(--border)':'none', transition:'background .15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
              >
                <div style={{ width:42, height:42, borderRadius:12, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, background:item.percent>=70?'rgba(34,197,94,.1)':item.percent>=50?'rgba(249,115,22,.1)':'rgba(239,68,68,.1)', color:scoreColor(item.percent), border:`1px solid ${scoreColor(item.percent)}25` }}>
                  {item.percent}%
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.topic}</div>
                  <div style={{ fontSize:11, color:'var(--muted)', marginTop:1 }}>{item.exam} · {item.score}/{item.total} correct</div>
                </div>
                <div style={{ fontSize:10, color:'var(--muted)', flexShrink:0 }}>
                  {new Date(item.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── WHY TRUST EXAMAI ── */}
      <div style={{ marginBottom:28, animation:'hmFadeUp .4s ease .35s both' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <div style={{ width:4, height:16, borderRadius:2, background:'var(--green)' }} />
          <span style={{ fontSize:11, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.6px' }}>Why Students Trust ExamNova</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
          {[
            { icon:'🤖', title:'AI-Generated',     desc:'Fresh questions every session matching real exam patterns', color:'#3b82f6' },
            { icon:'🆓', title:'100% Free',         desc:'No hidden fees, no premium walls — everything free forever', color:'#22c55e' },
            { icon:'📊', title:'Track Progress',    desc:'Weak topics, streaks, scores — improve every day', color:'#f97316' },
            { icon:'📰', title:'Current Affairs',   desc:'Daily news MCQs tailored to your exam', color:'#a855f7' },
            { icon:'📋', title:'Real Shift Papers', desc:'Previous year papers from actual exam shifts', color:'#eab308' },
            { icon:'🔒', title:'Secure & Private',  desc:'Your data is private — never shared or sold', color:'#ef4444' },
          ].map(f => (
            <div key={f.title} className="hm-feature-card"
              style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'16px 14px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${f.color},transparent)` }} />
              <div style={{ width:36, height:36, borderRadius:10, background:`${f.color}15`, border:`1px solid ${f.color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, marginBottom:10 }}>{f.icon}</div>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{f.title}</div>
              <div style={{ fontSize:11, color:'var(--muted)', lineHeight:1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop:'1px solid var(--border)', paddingTop:20, marginTop:8, animation:'hmFadeUp .4s ease .4s both' }}>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', justifyContent:'center', marginBottom:10 }}>
          {['🔒 Secure & Private','🆓 Free Forever','🤖 AI-Powered','📱 Mobile Friendly','🇮🇳 Made for India'].map(f => (
            <div key={f} style={{ fontSize:11, color:'var(--muted)' }}>{f}</div>
          ))}
        </div>
        <p style={{ textAlign:'center', fontSize:11, color:'var(--muted)', lineHeight:1.7 }}>
          ExamNova — AI-powered exam preparation for Indian Government Examinations<br />
          {/* <span style={{ fontSize:10, opacity:.6 }}>Not affiliated with SSC, UPSC, RRB or any government body. All questions AI-generated.</span> */}
        </p>
      </div>

    </div>
  )
}