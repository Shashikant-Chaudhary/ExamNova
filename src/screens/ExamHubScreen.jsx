// ─────────────────────────────────────────────
// ExamHubScreen.jsx  —  Professional UI v3
// ALL logic identical — only UI redesigned
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react'
import MOCK_CONFIG from '../data/mockConfig'
import EXAMS       from '../data/exams'
import { getMockHistory, getStats } from '../services/storageService'

const HINDI_OPTIONAL_EXAMS = [
  'SSC GD', 'SSC MTS', 'SSC CHSL',
  'RRB NTPC', 'RRB Group D', 'RRB ALP', 'State PSC'
]

const EXAM_META = {
  'RRB NTPC':     { icon: '🚂', color: '#3b82f6', bg: 'rgba(59,130,246,.08)'  },
  'RRB Group D':  { icon: '🚂', color: '#3b82f6', bg: 'rgba(59,130,246,.08)'  },
  'RRB ALP':      { icon: '🚂', color: '#3b82f6', bg: 'rgba(59,130,246,.08)'  },
  'SSC CGL':      { icon: '📋', color: '#f97316', bg: 'rgba(249,115,22,.08)'  },
  'SSC CHSL':     { icon: '📋', color: '#f97316', bg: 'rgba(249,115,22,.08)'  },
  'SSC MTS':      { icon: '📋', color: '#f97316', bg: 'rgba(249,115,22,.08)'  },
  'SSC GD':       { icon: '📋', color: '#f97316', bg: 'rgba(249,115,22,.08)'  },
  'IBPS PO':      { icon: '🏦', color: '#22c55e', bg: 'rgba(34,197,94,.08)'   },
  'IBPS Clerk':   { icon: '🏦', color: '#22c55e', bg: 'rgba(34,197,94,.08)'   },
  'SBI PO':       { icon: '🏦', color: '#22c55e', bg: 'rgba(34,197,94,.08)'   },
  'SBI Clerk':    { icon: '🏦', color: '#22c55e', bg: 'rgba(34,197,94,.08)'   },
  'UPSC Prelims': { icon: '🎯', color: '#a855f7', bg: 'rgba(168,85,247,.08)'  },
  'UPSC CDS':     { icon: '🎯', color: '#a855f7', bg: 'rgba(168,85,247,.08)'  },
  'State PSC':    { icon: '🏛️', color: '#eab308', bg: 'rgba(234,179,8,.08)'   },
}

export default function ExamHubScreen({
  user, navigate, selectedExam,
  onSelectExam, onStartMock, language, onLanguageChange,
}) {
  const [mockHistory,  setMockHistory]  = useState([])
  const [examStats,    setExamStats]    = useState(null)
  const [langModal,    setLangModal]    = useState(false)
  const [pendingAct,   setPendingAct]   = useState(null)
  const [langChoice,   setLangChoice]   = useState('english')

  const cfg      = MOCK_CONFIG[selectedExam]
  const meta     = EXAM_META[selectedExam] || { icon: '📋', color: 'var(--accent)', bg: 'rgba(249,115,22,.08)' }
  const examData = EXAMS[selectedExam]

  useEffect(() => {
    if (selectedExam) loadData()
  }, [selectedExam])

  const loadData = async () => {
    try {
      const history = await getMockHistory(selectedExam)
      setMockHistory(history.slice(0, 5))
    } catch (e) {}
  }

  const getExamLang = () =>
    localStorage.getItem(`examai_lang_${selectedExam?.replace(/\s/g, '_')}`) || 'english'

  const saveExamLang = (lang) => {
    localStorage.setItem(`examai_lang_${selectedExam?.replace(/\s/g, '_')}`, lang)
    onLanguageChange?.(lang)
  }

  const handleAction = (action) => {
    if (action === 'mock') {
      onStartMock(selectedExam)
      return
    }
    setLangChoice(getExamLang())
    setPendingAct(action)
    setLangModal(true)
  }

  const confirmAndGo = () => {
    saveExamLang(langChoice)
    setLangModal(false)
    if (pendingAct === 'practice') {
      onSelectExam(selectedExam)
    } else if (pendingAct === 'mock') {
      onStartMock(selectedExam)
    } else if (pendingAct === 'current') {
      onSelectExam(selectedExam, false)
      navigate('current')
    }
  }

  const scoreColor  = (p) => p >= 70 ? 'var(--green)' : p >= 50 ? '#f59e0b' : 'var(--red)'
  const scoreBg     = (p) => p >= 70 ? 'rgba(34,197,94,.1)' : p >= 50 ? 'rgba(245,158,11,.1)' : 'rgba(239,68,68,.1)'
  const scoreBorder = (p) => p >= 70 ? 'rgba(34,197,94,.3)' : p >= 50 ? 'rgba(245,158,11,.3)' : 'rgba(239,68,68,.3)'
  const formatDate  = (iso) => new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
  const formatTime  = (s)   => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`

  const topicCount = examData?.topics?.length || 0
  const hasHindi   = HINDI_OPTIONAL_EXAMS.includes(selectedExam)
  const bestMock   = mockHistory.length ? Math.max(...mockHistory.map(h => h.percent || 0)) : null
  const avgMock    = mockHistory.length ? Math.round(mockHistory.reduce((s, h) => s + (h.percent || 0), 0) / mockHistory.length) : null

  if (!selectedExam) {
    return (
      <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:52, marginBottom:16, opacity:.4 }}>📋</div>
          <p style={{ color:'var(--muted)', fontSize:15, marginBottom:16 }}>No exam selected. Go back to Home and pick an exam.</p>
          <button className="btn btn-primary" onClick={() => navigate('home')}>← Go to Home</button>
        </div>
      </div>
    )
  }

  // ── Action cards config ──────────────────────
  const ACTION_CARDS = [
    {
      id:      'practice',
      icon:    '✏️',
      title:   'AI Practice',
      hindi:   'अभ्यास करें',
      desc:    `AI generates ${topicCount > 0 ? topicCount + ' topic-wise' : 'fresh'} questions every session — matched to real ${selectedExam} patterns.`,
      color:   meta.color,
      tags:    [topicCount && `${topicCount} Topics`, hasHindi && 'EN / HI', 'Free'].filter(Boolean),
      cta:     'Start Practicing',
      onClick: () => handleAction('practice'),
      available: true,
    },
    {
      id:      'mock',
      icon:    '📝',
      title:   'Mock Test',
      hindi:   'मॉक टेस्ट',
      desc:    cfg
        ? `Full ${cfg.totalQuestions}Q · ${cfg.duration}-min timed test with section-wise scoring & deep analytics.`
        : 'Full-length timed tests coming soon for this exam.',
      color:   '#a855f7',
      tags:    cfg ? [`${cfg.totalQuestions}Q`, `${cfg.duration} min`, 'Standard', 'Hard'] : [],
      cta:     'Attempt Mock',
      onClick: () => handleAction('mock'),
      available: !!cfg,
    },
    {
      id:      'current',
      icon:    '📰',
      title:   'Current Affairs',
      hindi:   'समसामयिक घटनाएँ',
      desc:    'Live news + AI MCQs for Government Schemes, Defence, Economy, Sports and more.',
      color:   '#22c55e',
      tags:    ['Live News', '10 Topics', 'Daily Updated'],
      cta:     'Practice CA',
      onClick: () => handleAction('current'),
      available: true,
    },
    {
      id:      'shifts',
      icon:    '📋',
      title:   'Shift Papers',
      hindi:   'शिफ्ट पेपर',
      desc:    'Real previous year papers from actual exam shifts. Section-wise timed practice with analysis.',
      color:   '#3b82f6',
      tags:    ['PYP', 'Section-wise', 'With Analysis'],
      cta:     'View Papers',
      onClick: () => { onSelectExam(selectedExam, false); navigate('shifts') },
      available: true,
    },
    {
      id:      'leaderboard',
      icon:    '🏆',
      title:   'Leaderboard',
      hindi:   'लीडरबोर्ड',
      desc:    `See your All-India rank among students preparing for ${selectedExam}.`,
      color:   '#eab308',
      tags:    ['All-India Rank', 'Weekly', 'All-time'],
      cta:     'View Rankings',
      onClick: () => navigate('leaderboard'),
      available: true,
    },
    {
      id:      'dashboard',
      icon:    '📊',
      title:   'My Progress',
      hindi:   'मेरी प्रगति',
      desc:    mockHistory.length > 0
        ? `${mockHistory.length} mocks · Avg ${avgMock}% · Best ${bestMock}% — see full breakdown.`
        : 'Track your scores, streaks, weak topics and overall improvement.',
      color:   '#f97316',
      tags:    ['Score Trends', 'Weak Topics', 'Streaks'],
      cta:     'View Dashboard',
      onClick: () => navigate('dashboard'),
      available: true,
    },
  ]

  return (
    <div className="page" style={{ maxWidth:880 }}>
      <style>{`
        @keyframes ehFadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ehChakra  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ehPulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.2)} }
        @keyframes ehFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes ehShimmer { 0%{background-position:200%} 100%{background-position:-200%} }

        .eh-back:hover  { color:var(--accent) !important; }
        .eh-card        { transition:all .22s cubic-bezier(.4,0,.2,1); cursor:pointer; }
        .eh-card:hover  { transform:translateY(-5px) !important; box-shadow:0 18px 48px rgba(0,0,0,.2) !important; }
        .eh-card:active { transform:scale(.97) !important; }
        .eh-topic-row:hover { background:var(--surface2) !important; }
        .eh-mock-row:hover  { background:var(--surface2) !important; }
        @media (max-width:767px) {
          .eh-mobile-cards  { display:block !important; }
          .eh-desktop-cards { display:none  !important; }
        }
        @media (min-width:768px) {
          .eh-mobile-cards  { display:none  !important; }
          .eh-desktop-cards { display:grid  !important; }
        }
      `}</style>

      {/* ── BACK ── */}
      <button className="eh-back"
        onClick={() => navigate('home')}
        style={{ display:'flex', alignItems:'center', gap:6, background:'transparent', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:13, marginBottom:22, padding:0, fontWeight:600, transition:'color .15s' }}
      >
        ← Home
      </button>

      {/* ══════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════ */}

      {/* Tricolor strip */}
      <div style={{ display:'flex', height:5, borderRadius:'16px 16px 0 0', overflow:'hidden' }}>
        <div style={{ flex:1, background:'#FF9933' }} />
        <div style={{ flex:1, background:'white', opacity:.6 }} />
        <div style={{ flex:1, background:'#138808' }} />
      </div>

      <div style={{
        background: `linear-gradient(160deg, ${meta.color}14 0%, ${meta.color}06 50%, var(--surface) 100%)`,
        border: `1.5px solid ${meta.color}28`,
        borderTop: 'none',
        borderRadius: '0 0 22px 22px',
        padding: 'clamp(18px,4vw,30px)',
        marginBottom: 24,
        position: 'relative', overflow: 'hidden',
        animation: 'ehFadeUp .4s ease both',
      }}>
        {/* Chakra watermark */}
        <div style={{ position:'absolute', right:-20, top:-20, opacity:.05, pointerEvents:'none' }}>
          <svg viewBox="0 0 120 120" width={150} height={150}
            style={{ animation:'ehChakra 28s linear infinite', transformOrigin:'center' }}>
            <circle cx="60" cy="60" r="56" fill="none" stroke={meta.color} strokeWidth="3"/>
            <circle cx="60" cy="60" r="16" fill="none" stroke={meta.color} strokeWidth="2"/>
            {Array.from({length:24}).map((_,i)=>{
              const a=((i*15-90)*Math.PI)/180
              return <line key={i} x1={60+18*Math.cos(a)} y1={60+18*Math.sin(a)} x2={60+53*Math.cos(a)} y2={60+53*Math.sin(a)} stroke={meta.color} strokeWidth="1.5"/>
            })}
            <circle cx="60" cy="60" r="5" fill={meta.color}/>
          </svg>
        </div>

        {/* Glow orb */}
        <div style={{ position:'absolute', right:60, bottom:-40, width:160, height:160, borderRadius:'50%', background:`radial-gradient(circle,${meta.color}10 0%,transparent 65%)`, pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'flex-start', gap:18, flexWrap:'wrap' }}>

          {/* Big icon with glow */}
          <div style={{
            width:76, height:76, borderRadius:22, flexShrink:0,
            background:`linear-gradient(135deg,${meta.color}28,${meta.color}10)`,
            border:`2px solid ${meta.color}35`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:38, boxShadow:`0 8px 28px ${meta.color}30`,
            animation:'ehFloat 4s ease-in-out infinite',
          }}>
            {meta.icon}
          </div>

          <div style={{ flex:1, minWidth:200 }}>
            {/* Badge */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:`${meta.color}12`, border:`1px solid ${meta.color}28`, borderRadius:20, padding:'3px 12px', fontSize:10, fontWeight:800, color:meta.color, marginBottom:9, letterSpacing:'0.5px' }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:meta.color, display:'inline-block', animation:'ehPulse 2s infinite' }} />
              SELECTED EXAM
            </div>

            <h1 style={{ fontSize:'clamp(22px,4vw,32px)', fontWeight:900, marginBottom:4, lineHeight:1.2, letterSpacing:'-0.5px' }}>
              {selectedExam}
            </h1>
            {examData && (
              <p style={{ fontSize:12, color:'var(--muted2)', lineHeight:1.55, marginBottom:12, maxWidth:440 }}>
                {examData.fullName}
              </p>
            )}

            {/* Info chips */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {[
                cfg          && { icon:'❓', val:`${cfg.totalQuestions} Questions` },
                cfg          && { icon:'⏱', val:`${cfg.duration} min` },
                topicCount   && { icon:'📚', val:`${topicCount} Topics` },
                hasHindi     && { icon:'🇮🇳', val:'Hindi Available' },
                               { icon:'🆓', val:'Free Access' },
              ].filter(Boolean).map(s => (
                <div key={s.val} style={{ display:'flex', alignItems:'center', gap:4, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:600, color:'var(--muted2)', boxShadow:'0 1px 4px rgba(0,0,0,.06)' }}>
                  <span style={{ fontSize:10 }}>{s.icon}</span>{s.val}
                </div>
              ))}
            </div>
          </div>

          {/* Mock stats — right side */}
          {mockHistory.length > 0 && (
            <div style={{ display:'flex', gap:8, flexShrink:0, flexWrap:'wrap' }}>
              <div style={{ background:scoreBg(avgMock), border:`1px solid ${scoreBorder(avgMock)}`, borderRadius:14, padding:'12px 16px', textAlign:'center', minWidth:72 }}>
                <div style={{ fontSize:22, fontWeight:900, color:scoreColor(avgMock), lineHeight:1 }}>{avgMock}%</div>
                <div style={{ fontSize:9, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginTop:3 }}>Your Avg</div>
              </div>
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'12px 16px', textAlign:'center', minWidth:62 }}>
                <div style={{ fontSize:22, fontWeight:900, color:'var(--text)' }}>{mockHistory.length}</div>
                <div style={{ fontSize:9, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginTop:3 }}>Mocks</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          ACTION CARDS GRID
      ══════════════════════════════════════ */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <div style={{ width:4, height:20, borderRadius:2, background:`linear-gradient(180deg,${meta.color},${meta.color}55)` }} />
          <span style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.7px', color:'var(--muted)' }}>
            Start Preparing — तैयारी शुरू करें
          </span>
        </div>

        {/* ── MOBILE: list cards (Adda247 style) ── */}
        <div className="eh-mobile-cards" style={{ display:'none', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:18, overflow:'hidden' }}>
          {ACTION_CARDS.map((card, i) => (
            <div key={card.id}
              onClick={card.available ? card.onClick : undefined}
              style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderBottom: i < ACTION_CARDS.length-1 ? '1px solid var(--border)' : 'none', background:'transparent', cursor:card.available?'pointer':'default', opacity:card.available?1:0.5, transition:'background .15s', borderLeft:`3px solid ${card.available?card.color:'transparent'}`, animation:`ehFadeUp .3s ease ${i*0.04}s both`, color:'var(--text)' }}
              onMouseEnter={e => card.available && (e.currentTarget.style.background=`${card.color}06`)}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >
              {/* Circle icon */}
              <div style={{ width:48, height:48, borderRadius:'50%', flexShrink:0, background:`linear-gradient(135deg,${card.color}25,${card.color}10)`, border:`1.5px solid ${card.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, boxShadow:`0 3px 10px ${card.color}20` }}>
                {card.icon}
              </div>

              {/* Text */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:700, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {card.title}
                  <span style={{ marginLeft:6, fontSize:10, color:card.color, fontWeight:600 }}>{card.hindi}</span>
                </div>
                <div style={{ fontSize:11, color:'var(--muted2)', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {card.tags.slice(0,3).join(' · ')}
                </div>
                {!card.available && <div style={{ fontSize:10, color:'var(--muted)', fontWeight:600 }}>Coming Soon</div>}
              </div>

              {/* CTA */}
              {card.available && (
                <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5 }}>
                  <div style={{ padding:'6px 12px', borderRadius:8, background:`linear-gradient(135deg,${card.color},${card.color}cc)`, color:'white', fontSize:11, fontWeight:700, whiteSpace:'nowrap' }}>
                    {card.cta}
                  </div>
                  <span style={{ fontSize:16, color:'var(--muted)' }}>›</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── DESKTOP: grid cards ── */}
        <div className="eh-desktop-cards" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14 }}>
          {ACTION_CARDS.map((card, i) => (
            <button key={card.id} className="eh-card"
              onClick={card.available ? card.onClick : undefined}
              style={{ background:'var(--surface)', border:`1.5px solid ${card.available?`${card.color}22`:'var(--border)'}`, borderRadius:18, padding:0, cursor:card.available?'pointer':'default', opacity:card.available?1:0.5, textAlign:'left', display:'flex', flexDirection:'column', overflow:'hidden', animation:`ehFadeUp .4s ease ${i*.05}s both`, boxShadow:'0 2px 10px rgba(0,0,0,.06)', position:'relative', color:'var(--text)' }}
            >
              <div style={{ height:3, background:card.available?`linear-gradient(90deg,${card.color},${card.color}88,transparent)`:'var(--border)' }} />
              <div style={{ padding:'18px 18px 14px', display:'flex', flexDirection:'column', gap:10, flex:1 }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                  <div style={{ width:52, height:52, borderRadius:16, background:`linear-gradient(135deg,${card.color}20,${card.color}08)`, border:`1.5px solid ${card.color}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, boxShadow:card.available?`0 4px 14px ${card.color}25`:'none' }}>
                    {card.icon}
                  </div>
                  <span style={{ fontSize:9, color:card.color, fontWeight:700, background:`${card.color}10`, border:`1px solid ${card.color}25`, borderRadius:5, padding:'2px 7px' }}>{card.hindi}</span>
                </div>
                <div>
                  <div style={{ fontSize:16, fontWeight:800, marginBottom:5 }}>{card.title}</div>
                  <div style={{ fontSize:12, color:'var(--muted2)', lineHeight:1.65 }}>{card.desc}</div>
                </div>
                {card.tags.length > 0 && (
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                    {card.tags.map(tag => (
                      <span key={tag} style={{ fontSize:10, padding:'2px 8px', borderRadius:5, background:`${card.color}10`, border:`1px solid ${card.color}22`, color:card.color, fontWeight:600 }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ padding:'12px 18px', background:card.available?`${card.color}06`:'transparent', borderTop:`1px solid ${card.color}14`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:12, fontWeight:700, color:card.available?card.color:'var(--muted)' }}>{card.cta} →</span>
                <div style={{ width:28, height:28, borderRadius:9, background:card.available?card.color:'var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'white', fontWeight:800 }}>→</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* ══════════════════════════════════════
          SYLLABUS OVERVIEW
      ══════════════════════════════════════ */}
      {examData?.topics?.length > 0 && (
        <div style={{ marginBottom:28, animation:'ehFadeUp .4s ease .3s both' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:4, height:20, borderRadius:2, background:'linear-gradient(180deg,var(--blue),#2563eb)' }} />
              <span style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.7px', color:'var(--muted)' }}>
                Syllabus — पाठ्यक्रम
              </span>
            </div>
            <button onClick={() => handleAction('practice')}
              style={{ fontSize:12, color:meta.color, background:`${meta.color}10`, border:`1px solid ${meta.color}25`, borderRadius:8, padding:'5px 12px', cursor:'pointer', fontWeight:700, transition:'all .15s' }}
              onMouseEnter={e=>e.currentTarget.style.background=`${meta.color}18`}
              onMouseLeave={e=>e.currentTarget.style.background=`${meta.color}10`}
            >
              Practice All Topics →
            </button>
          </div>

          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
            {examData.topics.map((topic, i) => (
              <div key={topic.id} className="eh-topic-row"
                style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 18px', borderBottom: i < examData.topics.length-1 ? '1px solid var(--border)' : 'none', transition:'background .15s', cursor:'default' }}
              >
                {/* Number badge */}
                <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, background:`${meta.color}10`, border:`1px solid ${meta.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:meta.color }}>
                  {i+1}
                </div>

                {/* Topic name + meta */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {topic.name}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontSize:11, color:'var(--muted)' }}>{topic.subtopics?.length || 0} subtopics</span>
                    <span className={`tag tag-${topic.tag?.replace('tag-','')}`}>{topic.weightage}</span>
                    {topic.optional && (
                      <span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:4, background:'rgba(249,115,22,.08)', border:'1px solid rgba(249,115,22,.2)', color:'var(--accent)' }}>Optional</span>
                    )}
                  </div>
                </div>

                <span style={{ fontSize:16, color:'var(--muted)', flexShrink:0 }}>›</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          MOCK HISTORY
      ══════════════════════════════════════ */}
      {mockHistory.length > 0 && (
        <div style={{ animation:'ehFadeUp .4s ease .35s both' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:4, height:20, borderRadius:2, background:'linear-gradient(180deg,#a855f7,#7c3aed)' }} />
              <span style={{ fontSize:13, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.7px', color:'var(--muted)' }}>
                Previous Mock Tests
              </span>
            </div>
            <button className="btn btn-ghost" style={{ fontSize:12, padding:'5px 10px' }} onClick={() => navigate('mockhistory')}>
              View All →
            </button>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {mockHistory.map((test, i) => (
              <div key={test.id || i} className="eh-mock-row"
                style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap', transition:'background .15s', animation:`ehFadeUp .35s ease ${0.1+i*0.05}s both`, position:'relative', overflow:'hidden' }}
              >
                {/* Left score accent */}
                <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:`linear-gradient(180deg,${scoreColor(test.percent)},${scoreColor(test.percent)}66)` }} />

                {/* Score circle */}
                <div style={{ width:54, height:54, borderRadius:14, flexShrink:0, background:scoreBg(test.percent), border:`2px solid ${scoreBorder(test.percent)}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', marginLeft:6 }}>
                  <div style={{ fontSize:15, fontWeight:900, color:scoreColor(test.percent), lineHeight:1 }}>{test.percent}%</div>
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:140 }}>
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>
                    Mock Test #{mockHistory.length - i}
                    <span style={{ marginLeft:8, fontSize:10, padding:'2px 7px', borderRadius:5, background:test.level==='hard'?'rgba(239,68,68,.1)':'rgba(59,130,246,.1)', color:test.level==='hard'?'var(--red)':'var(--blue)', fontWeight:600 }}>
                      {test.level === 'hard' ? '🔴 Hard' : '🔵 Standard'}
                    </span>
                  </div>
                  <div style={{ display:'flex', gap:12, flexWrap:'wrap', fontSize:11, color:'var(--muted)' }}>
                    <span>📅 {formatDate(test.createdAt)}</span>
                    <span style={{ color:'var(--green)' }}>✅ {test.correct||0} correct</span>
                    <span style={{ color:'var(--red)' }}>❌ {test.wrong||0} wrong</span>
                    {test.timeTaken && <span>⏱ {formatTime(test.timeTaken)}</span>}
                    <span style={{ color:scoreColor(test.percent), fontWeight:700 }}>{test.score}/{test.maxScore} marks</span>
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                  <button className="btn btn-ghost" style={{ fontSize:12, padding:'7px 12px' }}
                    onClick={() => navigate('mockhistory')}>
                    Result
                  </button>
                  <button className="btn btn-primary" style={{ fontSize:12, padding:'7px 14px' }}
                    onClick={() => handleAction('mock')}>
                    Retake
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          LANGUAGE MODAL (bottom sheet)
      ══════════════════════════════════════ */}
      {langModal && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', backdropFilter:'blur(8px)', zIndex:1000, display:'flex', alignItems:'flex-end', justifyContent:'center' }}
          onClick={() => setLangModal(false)}
        >
          <div
            style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'24px 24px 0 0', padding:'8px 0 0', width:'100%', maxWidth:480, animation:'ehFadeUp .2s ease both' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div style={{ width:40, height:4, background:'var(--border2)', borderRadius:2, margin:'0 auto 20px' }} />

            <div style={{ padding:'0 24px 36px' }}>
              <button onClick={() => setLangModal(false)}
                style={{ display:'flex', alignItems:'center', gap:5, background:'transparent', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:13, marginBottom:14, padding:0, fontWeight:600 }}>
                ← Back
              </button>

              {/* Header */}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:`${meta.color}15`, border:`1px solid ${meta.color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                  {meta.icon}
                </div>
                <div>
                  <h3 style={{ fontSize:18, fontWeight:800, marginBottom:2 }}>Choose Language</h3>
                  <p style={{ fontSize:12, color:'var(--muted)' }}>
                    {selectedExam} · {pendingAct==='practice'?'Practice':pendingAct==='mock'?'Mock Test':'Current Affairs'}
                  </p>
                </div>
              </div>

              {/* Language options */}
              <div style={{ display:'flex', gap:12, marginBottom:22 }}>
                {[
                  { id:'english', label:'English', flag:'🇬🇧', sub:'English medium' },
                  { id:'hindi',   label:'हिंदी',   flag:'🇮🇳', sub:'हिंदी माध्यम'  },
                ].map(l => {
                  const active = langChoice === l.id
                  return (
                    <button key={l.id}
                      style={{ flex:1, padding:'18px 12px', borderRadius:16, border:`2px solid ${active?'var(--accent)':'var(--border)'}`, background:active?'rgba(249,115,22,.08)':'var(--surface2)', cursor:'pointer', textAlign:'center', transition:'all .15s' }}
                      onClick={() => setLangChoice(l.id)}
                    >
                      <div style={{ fontSize:32, marginBottom:8 }}>{l.flag}</div>
                      <div style={{ fontSize:15, fontWeight:700, color:active?'var(--accent)':'var(--text)', marginBottom:4 }}>{l.label}</div>
                      <div style={{ fontSize:11, color:'var(--muted)' }}>{l.sub}</div>
                      {active && <div style={{ fontSize:11, color:'var(--accent)', marginTop:6, fontWeight:700 }}>✓ Selected</div>}
                    </button>
                  )
                })}
              </div>

              <button
                style={{ width:'100%', padding:15, background:'linear-gradient(135deg,var(--accent),#f97316)', border:'none', borderRadius:14, color:'white', fontSize:16, fontWeight:700, cursor:'pointer', boxShadow:'0 6px 20px rgba(249,115,22,.3)', marginBottom:10 }}
                onClick={confirmAndGo}
              >
                Continue →
              </button>
              <button style={{ width:'100%', padding:11, background:'transparent', border:'none', color:'var(--muted)', fontSize:13, cursor:'pointer' }}
                onClick={() => setLangModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}