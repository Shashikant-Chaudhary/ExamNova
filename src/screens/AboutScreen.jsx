// ─────────────────────────────────────────────
// AboutScreen.jsx
// ExamNova — About & App Info
// Indian government exam portal style
// Ashoka Chakra, tricolor, 3D cards, trust signals
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react'
import Logo from '../components/Logo'

// ── Animated Ashoka Chakra ─────────────────────
function AshokaChakra({ size = 120, speed = 18, opacity = 1 }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size} height={size}
      style={{ animation: `abChakra ${speed}s linear infinite`, transformOrigin: 'center', opacity }}
    >
      {/* Outer ring */}
      <circle cx="60" cy="60" r="56" fill="none" stroke="#FF9933" strokeWidth="3.5"/>
      {/* Inner ring */}
      <circle cx="60" cy="60" r="16" fill="none" stroke="#FF9933" strokeWidth="2"/>
      {/* 24 spokes */}
      {Array.from({ length: 24 }).map((_, i) => {
        const a  = ((i * 15 - 90) * Math.PI) / 180
        const x1 = 60 + 18 * Math.cos(a), y1 = 60 + 18 * Math.sin(a)
        const x2 = 60 + 53 * Math.cos(a), y2 = 60 + 53 * Math.sin(a)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FF9933" strokeWidth="1.4" strokeLinecap="round"/>
      })}
      {/* Spoke dots */}
      {Array.from({ length: 24 }).map((_, i) => {
        const a = ((i * 15 - 90) * Math.PI) / 180
        return <circle key={i} cx={60 + 53*Math.cos(a)} cy={60 + 53*Math.sin(a)} r="2.2" fill="#FF9933"/>
      })}
      {/* Center dot */}
      <circle cx="60" cy="60" r="5" fill="#FF9933"/>
    </svg>
  )
}

// ── 3D Feature Card ────────────────────────────
function FeatureCard({ icon, title, hindi, desc, color, delay = 0 }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hovered ? color : 'var(--border)'}`,
        borderRadius: 18,
        padding: '20px 18px',
        position: 'relative', overflow: 'hidden',
        transition: 'all .25s cubic-bezier(.4,0,.2,1)',
        transform: hovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? `0 16px 40px ${color}22` : '0 2px 8px rgba(0,0,0,.06)',
        animation: `abFadeUp .5s ease ${delay}s both`,
        cursor: 'default',
      }}
    >
      {/* Top gradient bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${color},${color}66,transparent)` }} />

      {/* Icon */}
      <div style={{
        width: 52, height: 52, borderRadius: 16, marginBottom: 14,
        background: `linear-gradient(135deg,${color}20,${color}08)`,
        border: `1.5px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26,
        boxShadow: hovered ? `0 4px 16px ${color}30` : 'none',
        transition: 'box-shadow .25s',
      }}>
        {icon}
      </div>

      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 11, color: color, fontWeight: 600, marginBottom: 6 }}>{hindi}</div>
      <div style={{ fontSize: 12, color: 'var(--muted2)', lineHeight: 1.6 }}>{desc}</div>
    </div>
  )
}

// ── Stat Counter ───────────────────────────────
function StatCounter({ val, label, hindi, color, icon }) {
  return (
    <div style={{ textAlign: 'center', flex: '1 1 80px' }}>
      <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1, marginBottom: 4 }}>{val}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 1 }}>{label}</div>
      <div style={{ fontSize: 10, color: 'var(--muted)' }}>{hindi}</div>
    </div>
  )
}

const FEATURES = [
  { icon:'🤖', title:'AI Practice Questions',    hindi:'एआई अभ्यास प्रश्न',          desc:'Fresh questions every session powered by Groq AI — matched to real SSC, Railway, Banking & UPSC patterns.',  color:'#3b82f6', delay:.05 },
  { icon:'📝', title:'Full Mock Tests',           hindi:'पूर्ण मॉक परीक्षा',          desc:'Timed full-length tests with section-wise scoring, negative marking and deep performance analytics.',         color:'#f97316', delay:.1  },
  { icon:'📰', title:'Current Affairs',           hindi:'समसामयिक घटनाएँ',            desc:'Live news search + AI-generated MCQs for Government Schemes, Defence, Economy, Sports and more.',           color:'#22c55e', delay:.15 },
  { icon:'📊', title:'Progress Dashboard',        hindi:'प्रगति डैशबोर्ड',            desc:'Track your daily streak, weak topics, score trends and overall improvement across every exam.',              color:'#a855f7', delay:.2  },
  { icon:'📋', title:'Real Shift Papers',         hindi:'वास्तविक शिफ्ट पेपर',        desc:'Previous year question papers from actual exam shifts — practice with the exact questions students faced.',   color:'#eab308', delay:.25 },
  { icon:'🔖', title:'Bookmark Questions',        hindi:'प्रश्न सहेजें',              desc:'Save any question during practice, review them anytime from the Saved Questions section.',                    color:'#f97316', delay:.3  },
  { icon:'🏆', title:'Leaderboard',               hindi:'लीडरबोर्ड',                  desc:'Compete with students across India. See your All-India rank per exam and track top performers.',              color:'#3b82f6', delay:.35 },
  { icon:'🌐', title:'Bilingual — English & Hindi',hindi:'द्विभाषी — अंग्रेज़ी और हिंदी',desc:'Practice in English or Hindi. Hindi question banks for SSC GD, MTS, CHSL, RRB and State PSC.',         color:'#22c55e', delay:.4  },
]

const EXAMS = [
  { group:'Railway 🚂',  color:'#3b82f6', items:['RRB NTPC','RRB Group D','RRB ALP'] },
  { group:'SSC 📋',      color:'#f97316', items:['SSC CGL','SSC CHSL','SSC MTS','SSC GD','SSC JE','SSC Stenographer'] },
  { group:'Banking 🏦',  color:'#22c55e', items:['IBPS PO','IBPS Clerk','SBI PO','SBI Clerk','RBI Grade B','RBI Assistant','LIC AAO'] },
  { group:'UPSC 🎯',     color:'#a855f7', items:['UPSC Prelims','UPSC CDS'] },
  { group:'Defence 🎖️', color:'#6366f1', items:['NDA','AFCAT'] },
  { group:'State 🏛️',   color:'#eab308', items:['State PSC','Delhi Police Constable'] },
]

export default function AboutScreen({ user, navigate }) {
  const [count, setCount] = useState(0)

  // Animate counter
  useEffect(() => {
    let n = 0
    const t = setInterval(() => {
      n += 200
      setCount(Math.min(n, 10000))
      if (n >= 10000) clearInterval(t)
    }, 20)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="page" style={{ maxWidth: 900, paddingBottom: 48 }}>
      <style>{`
        @keyframes abFadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes abChakra  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes abFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes abPulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.15)} }
        @keyframes abShimmer { 0%{background-position:200%} 100%{background-position:-200%} }
        @keyframes abGlow    { 0%,100%{box-shadow:0 0 20px rgba(255,153,51,.3)} 50%{box-shadow:0 0 50px rgba(255,153,51,.6)} }
      `}</style>

      {/* ══════════════════════════════════════
          HERO — Government of India style
      ══════════════════════════════════════ */}

      {/* Tricolor top strip */}
      <div style={{ display:'flex', height:6, borderRadius:'12px 12px 0 0', overflow:'hidden', marginBottom:0 }}>
        <div style={{ flex:1, background:'#FF9933' }} />
        <div style={{ flex:1, background:'white', opacity:.7 }} />
        <div style={{ flex:1, background:'#138808' }} />
      </div>

      <div style={{
        background: 'linear-gradient(160deg, #080e1f 0%, #0d1a3a 40%, #0a1628 70%, #120e1f 100%)',
        borderRadius: '0 0 24px 24px',
        padding: 'clamp(28px,6vw,52px) clamp(20px,5vw,40px)',
        marginBottom: 24, color: 'white',
        position: 'relative', overflow: 'hidden',
        border: '1px solid rgba(255,153,51,.12)', borderTop: 'none',
        animation: 'abFadeUp .5s ease both',
      }}>
        {/* Large faded chakra background */}
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', opacity:.04, pointerEvents:'none', zIndex:0 }}>
          <AshokaChakra size={420} speed={40}/>
        </div>

        {/* Glow orbs */}
        <div style={{ position:'absolute', top:-60, right:-60, width:260, height:260, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,153,51,.12) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-40, left:-40, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle,rgba(19,136,8,.1) 0%,transparent 65%)', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>

          {/* National emblem-style header */}
          <div style={{ fontSize:11, fontWeight:800, letterSpacing:'2px', color:'rgba(255,153,51,.8)', textTransform:'uppercase', marginBottom:8 }}>
            भारत सरकार &nbsp;|&nbsp; Government of India
          </div>

          {/* Spinning Chakra — large */}
          <div style={{ marginBottom:20, animation:'abGlow 3s ease-in-out infinite' }}>
            <AshokaChakra size={96} speed={16}/>
          </div>

          {/* App name with N-mark logo */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14, marginBottom:6 }}>
            {/* <Logo size={56} /> */}
            <h1 style={{ fontSize:'clamp(32px,7vw,52px)', fontWeight:900, letterSpacing:'-1px', margin:0, lineHeight:1 }}>
              Exam<span style={{ color:'#FF9933' }}>Nova</span>
            </h1>
          </div>
          <div style={{ fontSize:'clamp(13px,2.5vw,16px)', color:'rgba(255,153,51,.85)', fontWeight:600, letterSpacing:'1px', marginBottom:10 }}>
            परीक्षा की तैयारी · Exam Preparation
          </div>

          {/* Satyamev Jayate */}
          <div style={{ fontSize:12, color:'rgba(255,255,255,.45)', fontStyle:'italic', marginBottom:24, letterSpacing:'0.5px' }}>
            🇮🇳 &nbsp; सत्यमेव जयते — Truth Alone Triumphs &nbsp; 🇮🇳
          </div>

          {/* Tagline */}
          <p style={{ fontSize:'clamp(14px,2.5vw,18px)', color:'rgba(255,255,255,.75)', lineHeight:1.7, maxWidth:540, marginBottom:28 }}>
            AI-powered free exam preparation platform for <strong style={{ color:'white' }}>SSC, Railway, Banking & UPSC</strong> — trusted by students across India
          </p>

          {/* CTA buttons */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', marginBottom:32 }}>
            <button onClick={() => navigate('home')}
              style={{ padding:'12px 28px', borderRadius:12, background:'linear-gradient(135deg,#FF9933,#f97316)', border:'none', color:'white', fontSize:14, fontWeight:800, cursor:'pointer', boxShadow:'0 6px 24px rgba(255,153,51,.45)', transition:'all .2s' }}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e=>e.currentTarget.style.transform='none'}
            >
              🚀 Start Practicing — Free
            </button>
            <button onClick={() => navigate('examhub')}
              style={{ padding:'12px 24px', borderRadius:12, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.2)', color:'white', fontSize:14, fontWeight:600, cursor:'pointer', transition:'all .2s' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.14)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.08)'}
            >
              📋 Browse Exams
            </button>
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:0, flexWrap:'wrap', justifyContent:'center', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, padding:'20px 10px', width:'100%', maxWidth:500 }}>
            {[
              { val:`${count >= 10000 ? '10,000+' : count.toLocaleString('en-IN')}`, label:'Students',       hindi:'छात्र',          color:'#FF9933' },
              { val:'22+',   label:'Exams',           hindi:'परीक्षाएँ',       color:'#4ade80' },
              { val:'100%',  label:'Free Forever',    hindi:'बिल्कुल निःशुल्क', color:'#60a5fa' },
              { val:'AI',    label:'Powered',         hindi:'एआई आधारित',    color:'#a78bfa' },
            ].map((s,i) => (
              <div key={s.label} style={{ flex:'1 1 80px', textAlign:'center', padding:'0 12px', borderRight: i<3?'1px solid rgba(255,255,255,.08)':'none' }}>
                <div style={{ fontSize:22, fontWeight:900, color:s.color, lineHeight:1, marginBottom:4 }}>{s.val}</div>
                <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.8)', marginBottom:1 }}>{s.label}</div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,.35)' }}>{s.hindi}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════════ */}
      <div style={{ marginBottom:32 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
          <div style={{ width:4, height:24, borderRadius:2, background:'linear-gradient(180deg,#FF9933,#138808)' }} />
          <div>
            <div style={{ fontSize:18, fontWeight:900 }}>What ExamNova Offers</div>
            <div style={{ fontSize:12, color:'var(--muted)', marginTop:1 }}>ExamNova क्या प्रदान करता है</div>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:14 }}>
          {FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </div>

      {/* ══════════════════════════════════════
          EXAMS COVERED
      ══════════════════════════════════════ */}
      <div style={{ marginBottom:32, animation:'abFadeUp .5s ease .2s both' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
          <div style={{ width:4, height:24, borderRadius:2, background:'linear-gradient(180deg,#3b82f6,#a855f7)' }} />
          <div>
            <div style={{ fontSize:18, fontWeight:900 }}>22+ Exams Covered</div>
            <div style={{ fontSize:12, color:'var(--muted)', marginTop:1 }}>22+ परीक्षाएँ शामिल</div>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {EXAMS.map(g => (
            <div key={g.group} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
              {/* Group header */}
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px', background:`${g.color}08`, borderBottom:`1px solid ${g.color}20` }}>
                <div style={{ width:3, height:16, borderRadius:2, background:g.color }} />
                <span style={{ fontSize:13, fontWeight:800, color:g.color }}>{g.group}</span>
                <span style={{ fontSize:11, color:'var(--muted)', marginLeft:'auto' }}>{g.items.length} exams</span>
              </div>
              {/* Exam pills */}
              <div style={{ padding:'12px 16px', display:'flex', gap:8, flexWrap:'wrap' }}>
                {g.items.map(exam => (
                  <button key={exam}
                    onClick={() => navigate('home')}
                    style={{ padding:'5px 13px', borderRadius:20, border:`1px solid ${g.color}30`, background:`${g.color}08`, color:g.color, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .15s' }}
                    onMouseEnter={e=>{ e.currentTarget.style.background=`${g.color}18`; e.currentTarget.style.transform='translateY(-1px)' }}
                    onMouseLeave={e=>{ e.currentTarget.style.background=`${g.color}08`; e.currentTarget.style.transform='none' }}
                  >
                    {exam}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          HOW IT WORKS — 3 steps
      ══════════════════════════════════════ */}
      <div style={{ marginBottom:32, animation:'abFadeUp .5s ease .25s both' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
          <div style={{ width:4, height:24, borderRadius:2, background:'linear-gradient(180deg,#f97316,#eab308)' }} />
          <div>
            <div style={{ fontSize:18, fontWeight:900 }}>How to Get Started</div>
            <div style={{ fontSize:12, color:'var(--muted)', marginTop:1 }}>कैसे शुरू करें</div>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
          {[
            { n:1, icon:'📋', title:'Select Your Exam',     hindi:'अपनी परीक्षा चुनें',    desc:'Choose from SSC, Railway, Banking, UPSC and more.',         color:'#FF9933' },
            { n:2, icon:'✏️', title:'Practice Topics',      hindi:'विषय का अभ्यास करें',   desc:'AI generates 10 fresh questions per topic per session.',     color:'#3b82f6' },
            { n:3, icon:'📊', title:'Track Progress',       hindi:'प्रगति देखें',           desc:'Your scores, streaks & weak areas update automatically.',    color:'#138808' },
            { n:4, icon:'🏆', title:'Crack the Exam',       hindi:'परीक्षा पास करें',       desc:'Daily practice builds the consistency that wins.',           color:'#a855f7' },
          ].map((s, i) => (
            <div key={s.n} style={{ background:'var(--surface)', border:`1px solid ${s.color}25`, borderRadius:16, padding:'18px 16px', position:'relative', overflow:'hidden', animation:`abFadeUp .4s ease ${i*.06}s both` }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${s.color},transparent)` }} />
              {/* Step number */}
              <div style={{ width:36, height:36, borderRadius:10, background:`${s.color}15`, border:`1.5px solid ${s.color}35`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                <span style={{ fontSize:18, fontWeight:900, color:s.color }}>{s.n}</span>
              </div>
              <div style={{ fontSize:26, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:14, fontWeight:800, marginBottom:2 }}>{s.title}</div>
              <div style={{ fontSize:11, color:s.color, fontWeight:600, marginBottom:6 }}>{s.hindi}</div>
              <div style={{ fontSize:12, color:'var(--muted2)', lineHeight:1.55 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          TRUST SIGNALS
      ══════════════════════════════════════ */}
      <div style={{ marginBottom:32, animation:'abFadeUp .5s ease .3s both' }}>
        <div style={{ background:'linear-gradient(135deg,rgba(255,153,51,.06),rgba(19,136,8,.04))', border:'1px solid rgba(255,153,51,.2)', borderRadius:18, padding:'24px 20px', position:'relative', overflow:'hidden' }}>

          {/* Mini chakra background */}
          <div style={{ position:'absolute', right:-20, top:-20, opacity:.06, pointerEvents:'none' }}>
            <AshokaChakra size={140} speed={30}/>
          </div>

          {/* Tricolor left bar */}
          <div style={{ position:'absolute', left:0, top:0, bottom:0, width:4, borderRadius:'18px 0 0 18px' }}>
            <div style={{ height:'33.3%', background:'#FF9933' }} />
            <div style={{ height:'33.3%', background:'white', opacity:.5 }} />
            <div style={{ height:'33.4%', background:'#138808' }} />
          </div>

          <div style={{ paddingLeft:14 }}>
            <div style={{ fontSize:16, fontWeight:900, marginBottom:16 }}>Why Trust ExamNova? &nbsp; <span style={{ fontSize:12, color:'var(--muted)', fontWeight:500 }}>हम पर भरोसा क्यों?</span></div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10 }}>
              {[
                { icon:'🆓', text:'100% Free Forever',       hindi:'सदा निःशुल्क',          color:'#138808' },
                { icon:'🤖', text:'AI-Verified Questions',   hindi:'एआई सत्यापित',          color:'#3b82f6' },
                { icon:'🔒', text:'Private & Secure',        hindi:'सुरक्षित डेटा',          color:'#a855f7' },
                { icon:'📱', text:'Mobile Friendly',         hindi:'मोबाइल अनुकूल',          color:'#f97316' },
                { icon:'🇮🇳', text:'Made in India',          hindi:'भारत में निर्मित',       color:'#FF9933' },
                { icon:'📰', text:'Live News Questions',     hindi:'ताज़ी खबरों पर',          color:'#22c55e' },
              ].map(t => (
                <div key={t.text} style={{ display:'flex', alignItems:'center', gap:10, background:'var(--surface)', border:`1px solid ${t.color}20`, borderRadius:10, padding:'10px 12px' }}>
                  <div style={{ width:34, height:34, borderRadius:9, background:`${t.color}12`, border:`1px solid ${t.color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>{t.icon}</div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>{t.text}</div>
                    <div style={{ fontSize:10, color:'var(--muted)' }}>{t.hindi}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <div style={{ animation:'abFadeUp .5s ease .4s both' }}>
        {/* Tricolor bottom strip */}
        <div style={{ display:'flex', height:4, borderRadius:4, overflow:'hidden', marginBottom:18 }}>
          <div style={{ flex:1, background:'#FF9933' }} />
          <div style={{ flex:1, background:'white', opacity:.5 }} />
          <div style={{ flex:1, background:'#138808' }} />
        </div>

        <div style={{ textAlign:'center' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:8 }}>
            <Logo size={36} />
            <div style={{ fontSize:22, fontWeight:900 }}>
              Exam<span style={{ color:'#FF9933' }}>Nova</span>
            </div>
          </div>
          <div style={{ fontSize:11, color:'var(--muted)', lineHeight:1.8 }}>
            AI-powered exam preparation for Indian Government Examinations<br/>
            भारतीय सरकारी परीक्षाओं के लिए एआई आधारित तैयारी मंच<br/>
            <span style={{ fontSize:10, opacity:.6 }}>Not affiliated with SSC, UPSC, RRB or any government body. All questions AI-generated for educational purposes.</span>
          </div>

          <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:16, flexWrap:'wrap' }}>
            {[['🏠 Home','home'],['📋 Exams','examhub'],['✏️ Practice','topics'],['📊 Progress','dashboard']].map(([label,screen]) => (
              <button key={screen} onClick={() => navigate(screen)}
                style={{ padding:'7px 16px', borderRadius:8, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--muted2)', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .15s' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)' }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--muted2)' }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}