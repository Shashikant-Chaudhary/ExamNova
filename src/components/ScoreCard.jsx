// ─────────────────────────────────────────────
// ScoreCard.jsx  —  Viral shareable result card
// Professional Testbook-level design
// Fix: close button outside overflow:hidden card
// ─────────────────────────────────────────────

import { useState, useEffect } from "react"

const SITE_URL  = "https://examnova.vercel.app"
const SITE_NAME = "ExamNova"

// ── Helpers ──────────────────────────────────

function getRank(pct) {
  if (pct >= 90) return { label: "Outstanding",     emoji: "🏆", color: "#F59E0B", glow: "#F59E0B" }
  if (pct >= 75) return { label: "Excellent",        emoji: "🥇", color: "#10B981", glow: "#10B981" }
  if (pct >= 60) return { label: "Good",             emoji: "🥈", color: "#3B82F6", glow: "#3B82F6" }
  if (pct >= 45) return { label: "Average",          emoji: "🥉", color: "#8B5CF6", glow: "#8B5CF6" }
  return           { label: "Keep Practicing",  emoji: "📚", color: "#EF4444", glow: "#EF4444" }
}

function getBg(pct) {
  if (pct >= 90) return ["#1a0a00", "#3d1f00", "#7c3600"]
  if (pct >= 75) return ["#001a0f", "#003d1f", "#006b38"]
  if (pct >= 60) return ["#000d2e", "#001a5c", "#003399"]
  if (pct >= 45) return ["#150025", "#2d0052", "#520099"]
  return                 ["#1a0000", "#3d0000", "#7a0000"]
}

// Animated circular progress ring
function Ring({ pct, color, size = 148 }) {
  const [cur, setCur] = useState(0)
  const r    = (size - 14) / 2
  const circ = 2 * Math.PI * r

  useEffect(() => {
    const t = setTimeout(() => {
      let v = 0
      const step = () => {
        v = Math.min(v + 2, pct)
        setCur(v)
        if (v < pct) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, 300)
    return () => clearTimeout(t)
  }, [pct])

  const offset = circ - (cur / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="rgba(255,255,255,0.08)" strokeWidth={11} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={16} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        opacity={0.18} style={{ filter: "blur(5px)" }} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={11} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset} />
    </svg>
  )
}

// Section bar
function SectionBar({ name, score, total }) {
  const pct   = Math.round((score / total) * 100)
  const color = pct >= 70 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444"
  return (
    <div style={{ marginBottom: 7 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{name}</span>
        <span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>
          {score}/{total} <span style={{ color, fontSize: 11 }}>({pct}%)</span>
        </span>
      </div>
      <div style={{ height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, borderRadius: 99,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: `0 0 8px ${color}55`,
          transition: "width 1.2s cubic-bezier(0.4,0,0.2,1) 0.4s",
        }} />
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────

export default function ScoreCard({
  userName       = "Student",
  examName       = "SSC CGL 2025",
  score          = 72,
  totalQuestions = 100,
  correct        = 72,
  wrong          = 18,
  unattempted    = 10,
  timeTaken      = "45:30",
  rank           = "Top 12%",
  topic          = null,
  isMockTest     = false,
  sectionScores  = [],
  cutoff         = null,
  onClose,
}) {
  const [copyState, setCopyState] = useState("idle")
  const [visible,   setVisible]   = useState(false)

  const pct          = Math.round((correct / totalQuestions) * 100)
  const rankInfo     = getRank(pct)
  const [c1, c2, c3] = getBg(pct)
  const passedCutoff = cutoff != null ? pct >= cutoff : null

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => onClose?.(), 280)
  }

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) handleClose()
  }

  // ── Build share messages ───────────────────

  const stars = ["⭐","⭐⭐","⭐⭐⭐","⭐⭐⭐⭐","⭐⭐⭐⭐⭐"][
    pct >= 90 ? 4 : pct >= 75 ? 3 : pct >= 60 ? 2 : pct >= 45 ? 1 : 0
  ]
  const bar = "█".repeat(Math.round(pct / 10)) + "░".repeat(10 - Math.round(pct / 10))

  const sectionLines = isMockTest && sectionScores.length
    ? "\n\n📊 Section Scores:\n" + sectionScores.map(s => `   ${s.name}: ${s.score}/${s.total}`).join("\n")
    : ""

  const cutoffLine = passedCutoff != null
    ? `\n${passedCutoff ? "✅ Cutoff Cleared! 🎉" : `❌ ${Math.abs(pct - cutoff)}% below cutoff — need to improve`}`
    : ""

  // Full rich text for copy / native share
  const richText =
`${stars} ${rankInfo.emoji} ${rankInfo.label}! — ${examName}

📊 Score  : ${pct}%  (${correct}/${totalQuestions})
${bar} ${pct}%

✅ Correct   : ${correct}
❌ Wrong     : ${wrong}
⏭️ Skipped  : ${unattempted}
⏱️ Time      : ${timeTaken}${topic ? `\n📚 Topic     : ${topic}` : ""}${sectionLines}${cutoffLine}

🔥 Preparing for Govt Exams on ${SITE_NAME}
📲 Join FREE → ${SITE_URL}

#ExamNova #${examName.replace(/\s+/g, "")} #GovtJobs #SSC #UPSC #Banking`

  // WhatsApp — bold formatting with *asterisks*
  const waText =
`${rankInfo.emoji} *${rankInfo.label}!*

I scored *${pct}%* on *${examName}*${topic ? ` _(${topic})_` : ""}

✅ *${correct} Correct* | ❌ *${wrong} Wrong* | ⏱️ *${timeTaken}*
${bar} *${pct}%*
${cutoffLine}

🔥 Preparing on *${SITE_NAME}* — Try for FREE!
👉 ${SITE_URL}`

  // Tweet — short and punchy
  const tweetText =
`${rankInfo.emoji} Just scored ${pct}% on ${examName}! ${rankInfo.label} ${stars}

✅ ${correct} correct · ❌ ${wrong} wrong · ⏱️ ${timeTaken}

Preparing with @ExamNova 🔥
${SITE_URL}

#ExamNova #GovtJobs #${examName.replace(/\s+/g, "")}`

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: `My ${examName} Score — ${pct}%`, text: richText, url: SITE_URL })
        setCopyState("shared")
      } catch (_) {}
    } else {
      await navigator.clipboard.writeText(richText)
      setCopyState("copied")
      setTimeout(() => setCopyState("idle"), 3000)
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(`${SITE_URL}?ref=score`)
    setCopyState("link")
    setTimeout(() => setCopyState("idle"), 2500)
  }

  // ── Render ────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes scPulse   { 0%,100%{opacity:1} 50%{opacity:0.55} }
        @keyframes scPopIn   { 0%{transform:scale(0.3);opacity:0} 65%{transform:scale(1.07)} 100%{transform:scale(1);opacity:1} }
        @keyframes scShimmer { 0%{transform:translateX(-120%)} 100%{transform:translateX(220%)} }
        .sc-btn {
          border: 1.5px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.08);
          color: #fff; border-radius: 10px;
          padding: 8px 7px; font-size: 11px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center;
          justify-content: center; gap: 6px;
          transition: background .18s, transform .15s, border-color .18s;
          text-decoration: none; letter-spacing: 0.2px;
        }
        .sc-btn:hover  { background: rgba(255,255,255,0.16); transform: translateY(-2px); border-color: rgba(255,255,255,0.32); }
        .sc-btn:active { transform: scale(0.96); }
        .sc-main {
          background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1));
          border: 1.5px solid rgba(255,255,255,0.32);
          border-radius: 12px; color: #fff;
          font-size: 13px; font-weight: 800;
          padding: 10px 14px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          width: 100%; position: relative; overflow: hidden;
          letter-spacing: 0.3px;
          transition: transform .15s, background .2s;
        }
        .sc-main::after {
          content: ''; position: absolute;
          top: 0; left: 0; width: 55%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent);
          animation: scShimmer 2.8s infinite;
        }
        .sc-main:hover  { transform: translateY(-2px); background: linear-gradient(135deg,rgba(255,255,255,0.26),rgba(255,255,255,0.14)); }
        .sc-main:active { transform: scale(0.97); }
      `}</style>

      {/* Backdrop */}
      <div onClick={handleBackdrop} style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.28s ease",
      }}>

        {/* Card wrapper — NOT overflow:hidden so close btn never clips */}
        <div style={{
          position: "relative", width: "100%", maxWidth: 360,
          transform: visible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.94)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.34s cubic-bezier(0.34,1.4,0.64,1), opacity 0.28s ease",
        }}>

          {/* ✕ CLOSE BUTTON — positioned on wrapper, above card */}
          <button
            onClick={handleClose}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,38,38,0.9)"; e.currentTarget.style.transform = "scale(1.12)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(20,20,30,0.96)"; e.currentTarget.style.transform = "scale(1)" }}
            style={{
              position: "absolute", top: -15, right: -15,
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(20,20,30,0.96)",
              border: "1.5px solid rgba(255,255,255,0.28)",
              color: "#fff", fontSize: 16, fontWeight: 700,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 10001, lineHeight: 1,
              transition: "background .18s, transform .15s",
              boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
            }}
          >✕</button>

          {/* THE CARD */}
          <div style={{
            borderRadius: 24, overflow: "hidden",
            background: `linear-gradient(150deg, ${c1} 0%, ${c2} 45%, ${c3} 100%)`,
            boxShadow: `0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.06), 0 0 70px ${rankInfo.glow}1a`,
          }}>

            {/* Color accent bar */}
            <div style={{
              height: 4,
              background: `linear-gradient(90deg, transparent 0%, ${rankInfo.color}99 30%, ${rankInfo.color} 50%, ${rankInfo.color}99 70%, transparent 100%)`,
            }} />

            <div style={{ padding: "16px 14px 14px" }}>

              {/* HEADER */}
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 99, padding: "2px 8px", marginBottom: 6,
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: rankInfo.color, boxShadow: `0 0 6px ${rankInfo.color}`,
                    animation: "scPulse 2s infinite",
                  }} />
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.2, color: "rgba(255,255,255,0.65)", textTransform: "uppercase" }}>
                    {isMockTest ? "Full Mock Test" : "Practice Test"} · Result
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", letterSpacing: -0.2, lineHeight: 1.3 }}>
                  {examName}
                </div>
                {topic && (
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.48)", marginTop: 2, fontWeight: 500 }}>{topic}</div>
                )}
              </div>

              {/* SCORE RING */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 3 }}>
                <div style={{ position: "relative", width: 120, height: 120 }}>
                  <Ring pct={pct} color={rankInfo.color} size={120} />
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{
                      fontSize: 30, fontWeight: 900, color: "#fff", lineHeight: 1,
                      textShadow: `0 0 24px ${rankInfo.color}88`,
                      animation: "scPopIn 0.55s 0.5s both",
                    }}>{pct}%</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 2, fontWeight: 500 }}>
                      {correct} / {totalQuestions}
                    </div>
                  </div>
                </div>
              </div>

              {/* RANK BADGE */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: `linear-gradient(135deg, ${rankInfo.color}1a, ${rankInfo.color}33)`,
                  border: `1.5px solid ${rankInfo.color}55`,
                  borderRadius: 99, padding: "4px 12px",
                  boxShadow: `0 4px 20px ${rankInfo.color}2a`,
                  animation: "scPopIn 0.5s 0.85s both",
                }}>
                  <span style={{ fontSize: 15 }}>{rankInfo.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: rankInfo.color }}>{rankInfo.label}</span>
                  {rank && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>· {rank}</span>}
                </div>
              </div>

              {/* STATS */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
                {[
                  { label: "Correct",  val: correct,     color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.22)"  },
                  { label: "Wrong",    val: wrong,       color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.22)"  },
                  { label: "Skipped",  val: unattempted, color: "rgba(255,255,255,0.48)", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)" },
                ].map(s => (
                  <div key={s.label} style={{
                    background: s.bg, border: `1px solid ${s.border}`,
                    borderRadius: 10, padding: "8px 4px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 700 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* TIME + CUTOFF */}
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <div style={{
                  flex: 1, background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10, padding: "7px 8px",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⏱️</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{timeTaken}</div>
                    <div style={{ fontSize: 7, color: "rgba(255,255,255,0.38)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>Time Taken</div>
                  </div>
                </div>
                {cutoff != null && (
                  <div style={{
                    flex: 1,
                    background: passedCutoff ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                    border: `1px solid ${passedCutoff ? "rgba(34,197,94,0.28)" : "rgba(239,68,68,0.28)"}`,
                    borderRadius: 10, padding: "7px 8px",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: passedCutoff ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                      {passedCutoff ? "✅" : "🎯"}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: passedCutoff ? "#22c55e" : "#ef4444" }}>
                        {passedCutoff ? "Cutoff Met!" : `Need ${cutoff - pct}% more`}
                      </div>
                      <div style={{ fontSize: 7, color: "rgba(255,255,255,0.38)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>Cutoff: {cutoff}%</div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION BREAKDOWN */}
              {isMockTest && sectionScores.length > 0 && (
                <div style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 10, padding: "8px 10px 4px", marginBottom: 8,
                }}>
                  <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 1.2, color: "rgba(255,255,255,0.38)", textTransform: "uppercase", marginBottom: 8 }}>
                    Section Breakdown
                  </div>
                  {sectionScores.map(s => <SectionBar key={s.name} {...s} />)}
                </div>
              )}

              {/* USER ROW */}
              <div style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "7px 8px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 9, marginBottom: 10,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: `linear-gradient(135deg, ${rankInfo.color}44, ${rankInfo.color}88)`,
                  border: `2px solid ${rankInfo.color}55`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 900, color: "#fff",
                }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.38)", fontWeight: 500 }}>via {SITE_NAME}</div>
                </div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.28)", fontStyle: "italic", letterSpacing: 0.2 }}>examai.vercel.app</div>
              </div>

              {/* MAIN SHARE BUTTON */}
              <button className="sc-main" onClick={handleShare} style={{ marginBottom: 7 }}>
                <span style={{ fontSize: 18 }}>🚀</span>
                {copyState === "copied" ? "✅  Copied to Clipboard!" : copyState === "shared" ? "✅  Shared Successfully!" : "Share My Score"}
              </button>

              {/* SECONDARY SHARE BUTTONS */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                <a href={`https://wa.me/?text=${encodeURIComponent(waText)}`}
                  target="_blank" rel="noreferrer" className="sc-btn"
                  style={{ textDecoration: "none", borderColor: "rgba(37,211,102,0.35)", background: "rgba(37,211,102,0.09)" }}>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="#25D366" style={{ flexShrink: 0 }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.137.564 4.14 1.544 5.874L.057 23.882l6.18-1.618A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 01-5.003-1.366l-.36-.212-3.667.96.979-3.573-.234-.372A9.823 9.823 0 012.182 12c0-5.42 4.398-9.818 9.818-9.818 5.42 0 9.818 4.398 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z"/>
                  </svg>
                  WhatsApp
                </a>

                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
                  target="_blank" rel="noreferrer" className="sc-btn"
                  style={{ textDecoration: "none", borderColor: "rgba(255,255,255,0.18)", background: "rgba(0,0,0,0.25)" }}>
                  <span style={{ fontSize: 13, fontWeight: 900 }}>𝕏</span>
                  Twitter
                </a>

                <button className="sc-btn" onClick={copyLink}
                  style={{
                    borderColor: copyState === "link" ? "rgba(34,197,94,0.45)" : "rgba(255,255,255,0.15)",
                    background:  copyState === "link" ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.06)",
                  }}>
                  <span style={{ fontSize: 13 }}>{copyState === "link" ? "✅" : "🔗"}</span>
                  {copyState === "link" ? "Copied!" : "Copy Link"}
                </button>
              </div>

              {/* BOTTOM CTA */}
              <div style={{
                marginTop: 10, padding: "7px 9px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8, textAlign: "center",
              }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>
                  🔥 Challenge your friends — can they beat your score?
                  <br />
                  <span style={{ color: "rgba(255,255,255,0.52)", fontWeight: 600 }}>Free practice · examai.vercel.app</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}