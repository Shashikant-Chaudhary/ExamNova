// ─────────────────────────────────────────────
// ShiftUploader.jsx
// Admin component to upload shift papers
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { saveShiftPaper, getAllShifts, deleteShift, analyseShift } from '../services/shiftService'
import { fetchShiftPaperFromWeb } from '../services/shiftFetchService'

const EXAMS = [
  'SSC CGL', 'SSC CHSL', 'SSC MTS', 'SSC GD',
  'RRB NTPC', 'RRB Group D', 'RRB ALP',
  'IBPS PO', 'IBPS Clerk', 'SBI PO', 'SBI Clerk',
  'UPSC Prelims', 'UPSC CDS', 'State PSC',
]

const TOPICS = {
  'SSC CGL':      ['Quantitative Aptitude', 'General Intelligence & Reasoning', 'English Language', 'General Awareness', 'Current Affairs'],
  'SSC CHSL':     ['Quantitative Aptitude', 'General Intelligence', 'English Language', 'General Awareness', 'Current Affairs'],
  'SSC MTS':      ['Numerical & Mathematical Ability', 'Reasoning Ability & Problem Solving', 'General English', 'General Awareness'],
  'SSC GD':       ['Elementary Mathematics', 'General Intelligence & Reasoning', 'English Language', 'General Knowledge & Awareness'],
  'RRB NTPC':     ['Mathematics', 'General Intelligence & Reasoning', 'General Awareness', 'Current Affairs'],
  'RRB Group D':  ['Mathematics', 'General Intelligence & Reasoning', 'General Science', 'General Awareness & Current Affairs'],
  'RRB ALP':      ['Mathematics', 'General Intelligence & Reasoning', 'Basic Science & Engineering', 'General Awareness'],
  'IBPS PO':      ['Reasoning Ability', 'Quantitative Aptitude', 'English Language', 'General Awareness'],
  'IBPS Clerk':   ['Reasoning Ability', 'Quantitative Aptitude', 'English Language', 'General Awareness'],
  'SBI PO':       ['Reasoning & Computer Aptitude', 'Data Analysis & Interpretation', 'English Language', 'General Awareness'],
  'SBI Clerk':    ['Reasoning Ability & Computer Aptitude', 'Quantitative Aptitude', 'General English', 'General Awareness'],
  'UPSC Prelims': ['Indian History', 'Indian & World Geography', 'Indian Polity & Governance', 'Indian Economy', 'General Science & Technology', 'Current Affairs'],
  'UPSC CDS':     ['English', 'General Knowledge', 'Elementary Mathematics'],
  'State PSC':    ['History & Culture', 'Geography', 'Polity & Governance', 'Economy', 'General Science', 'Current Affairs'],
}

export default function ShiftUploader() {

  const [uploadTab,    setUploadTab]    = useState('fetch')  // fetch | json | manual
  const [exam,         setExam]         = useState('SSC CGL')
  const [date,         setDate]         = useState('')
  const [shift,        setShift]        = useState('Morning Shift 1')
  const [year,         setYear]         = useState('2026')
  const [jsonText,     setJsonText]     = useState('')
  const [jsonStatus,   setJsonStatus]   = useState('')
  const [uploading,    setUploading]    = useState(false)
  const [allShifts,    setAllShifts]    = useState([])
  const [loadingShifts,setLoadingShifts]= useState(false)
  const [analysing,    setAnalysing]    = useState(null)
  const [deleting,     setDeleting]     = useState(null)
  const [viewTab,      setViewTab]      = useState('upload') // upload | manage

  // manual question form
  const [manualQuestions, setManualQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState({
    question: '', optionA: '', optionB: '', optionC: '', optionD: '',
    correct: '0', explanation: '', topic: 'Quantitative Aptitude',
    subtopic: '', difficulty: '5', questionType: 'conceptual',
  })
  const [manualStatus, setManualStatus] = useState('')

  // fetch from web state
  const [fetchStatus,    setFetchStatus]    = useState('')
  const [fetching,       setFetching]       = useState(false)
  const [fetchedQuestions, setFetchedQuestions] = useState([])
  const [fetchSources,   setFetchSources]   = useState([])
  const [savingFetched,  setSavingFetched]  = useState(false)
  const [previewQ,       setPreviewQ]       = useState(null)

  useEffect(() => { loadShifts() }, [])

  const loadShifts = async () => {
    setLoadingShifts(true)
    const data = await getAllShifts()
    setAllShifts(data)
    setLoadingShifts(false)
  }

  // ── Fetch from Web ──
  const handleFetchFromWeb = async () => {
    if (!date) return setFetchStatus('❌ Please select exam date first')
    setFetching(true)
    setFetchStatus('🔍 Searching web for shift papers...')
    setFetchedQuestions([])
    setFetchSources([])
    try {
      setFetchStatus('🌐 Fetching from SSCAdda, Testbook, Adda247...')
      const result = await fetchShiftPaperFromWeb({ exam, year, shift })
      setFetchedQuestions(result.questions)
      setFetchSources(result.sources)
      setFetchStatus(`✅ Found ${result.questions.length} questions from web! Review below and click Save.`)
    } catch (e) {
      setFetchStatus(`❌ ${e.message}`)
    }
    setFetching(false)
  }

  // ── Save Fetched Questions ──
  const handleSaveFetched = async () => {
    if (!date)                        return setFetchStatus('❌ Please select exam date')
    if (fetchedQuestions.length === 0) return setFetchStatus('❌ No questions to save')
    setSavingFetched(true)
    setFetchStatus('💾 Saving to Firebase...')
    try {
      const id = await saveShiftPaper({
        exam, date, shift, year: parseInt(year),
        totalQuestions: fetchedQuestions.length,
        questions:      fetchedQuestions,
        source:         `Web Fetch — ${fetchSources[0] || 'Auto'}`,
        uploadedBy:     'Admin',
      })
      setFetchStatus(`✅ Saved! ${fetchedQuestions.length} questions published. ID: ${id}`)
      setFetchedQuestions([])
      setFetchSources([])
      await loadShifts()
    } catch (e) {
      setFetchStatus(`❌ Save failed: ${e.message}`)
    }
    setSavingFetched(false)
  }

  // ── Delete a fetched question before saving ──
  const removeFetchedQuestion = (index) => {
    setFetchedQuestions(prev => prev.filter((_, i) => i !== index))
  }

  // ── JSON Upload ──
  const handleJsonUpload = async () => {
    if (!date) return setJsonStatus('❌ Please select exam date')
    try {
      setJsonStatus('🔍 Parsing JSON...')
      const questions = JSON.parse(jsonText)
      if (!Array.isArray(questions)) return setJsonStatus('❌ Must be a JSON array')

      const valid = questions.filter(q =>
        q.question && Array.isArray(q.options) &&
        q.options.length === 4 && typeof q.correct === 'number'
      )
      if (valid.length === 0) return setJsonStatus('❌ No valid questions found')

      setUploading(true)
      setJsonStatus(`💾 Uploading ${valid.length} questions...`)

      const id = await saveShiftPaper({
        exam, date, shift, year: parseInt(year),
        totalQuestions: valid.length,
        questions: valid,
        source: 'Manual JSON Upload',
        uploadedBy: 'Admin',
      })

      setJsonStatus(`✅ Uploaded! ${valid.length} questions saved. ID: ${id}`)
      setJsonText('')
      await loadShifts()

    } catch (e) {
      setJsonStatus(`❌ Error: ${e.message}`)
    }
    setUploading(false)
  }

  // ── Manual Question Add ──
  const handleAddQuestion = () => {
    if (!currentQ.question || !currentQ.optionA || !currentQ.optionB ||
        !currentQ.optionC || !currentQ.optionD || !currentQ.explanation) {
      setManualStatus('❌ Fill all required fields')
      return
    }

    const q = {
      question:    currentQ.question.trim(),
      options:     [currentQ.optionA.trim(), currentQ.optionB.trim(), currentQ.optionC.trim(), currentQ.optionD.trim()],
      correct:     parseInt(currentQ.correct),
      explanation: currentQ.explanation.trim(),
      topic:       currentQ.topic,
      subtopic:    currentQ.subtopic.trim() || currentQ.topic,
      difficulty:  parseInt(currentQ.difficulty),
      questionType: currentQ.questionType,
    }

    setManualQuestions(prev => [...prev, q])
    setManualStatus(`✅ Question ${manualQuestions.length + 1} added!`)
    setCurrentQ(prev => ({
      ...prev,
      question: '', optionA: '', optionB: '', optionC: '', optionD: '',
      explanation: '', subtopic: '',
    }))
  }

  const handleManualUpload = async () => {
    if (!date)                      return setManualStatus('❌ Please select exam date')
    if (manualQuestions.length === 0) return setManualStatus('❌ Add at least 1 question')

    setUploading(true)
    setManualStatus(`💾 Uploading ${manualQuestions.length} questions...`)

    try {
      const id = await saveShiftPaper({
        exam, date, shift, year: parseInt(year),
        totalQuestions: manualQuestions.length,
        questions: manualQuestions,
        source: 'Manual Entry',
        uploadedBy: 'Admin',
      })

      setManualStatus(`✅ Uploaded! ${manualQuestions.length} questions saved.`)
      setManualQuestions([])
      await loadShifts()
    } catch (e) {
      setManualStatus(`❌ Error: ${e.message}`)
    }
    setUploading(false)
  }

  const handleAnalyse = async (shiftId) => {
    setAnalysing(shiftId)
    await analyseShift(shiftId)
    await loadShifts()
    setAnalysing(null)
  }

  const handleDelete = async (shiftId) => {
    if (!window.confirm('Delete this shift paper?')) return
    setDeleting(shiftId)
    await deleteShift(shiftId)
    await loadShifts()
    setDeleting(null)
  }

  const difficultyColor = (avg) => {
    if (!avg) return 'var(--muted)'
    if (avg <= 3) return 'var(--green)'
    if (avg <= 7) return '#f59e0b'
    return 'var(--red)'
  }

  const difficultyLabel = (avg) => {
    if (!avg) return 'Not analysed'
    if (avg <= 3) return 'Easy'
    if (avg <= 7) return 'Medium'
    return 'Hard'
  }

  return (
    <div>

      {/* View tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { id: 'upload', label: '⬆️ Upload Paper' },
          { id: 'manage', label: `📋 Manage Papers (${allShifts.length})` },
        ].map(t => (
          <button key={t.id}
            style={{
              padding: '8px 18px', borderRadius: '8px', border: '1px solid',
              borderColor: viewTab === t.id ? 'var(--accent)' : 'var(--border)',
              background: viewTab === t.id ? 'rgba(249,115,22,.1)' : 'var(--surface)',
              color: viewTab === t.id ? 'var(--accent)' : 'var(--muted)',
              cursor: 'pointer', fontSize: '13px', fontWeight: '600',
            }}
            onClick={() => setViewTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── UPLOAD TAB ── */}
      {viewTab === 'upload' && (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* LEFT — paper info */}
          <div style={{ width: '260px', flexShrink: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
              Paper Details
            </div>

            {/* Exam */}
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Exam</label>
              <select style={inputStyle} value={exam} onChange={e => setExam(e.target.value)}>
                {EXAMS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            {/* Date */}
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Exam Date *</label>
              <input style={inputStyle} type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            {/* Shift */}
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Shift Name</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="e.g. Morning Shift 1"
                value={shift}
                onChange={e => setShift(e.target.value)}
              />
            </div>

            {/* Year */}
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Year</label>
              <select style={inputStyle} value={year} onChange={e => setYear(e.target.value)}>
                {['2026', '2025', '2024', '2023'].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Common shifts presets */}
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '6px' }}>Quick Shifts</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {['Morning Shift 1', 'Morning Shift 2', 'Afternoon Shift 1', 'Afternoon Shift 2', 'Evening Shift 1', 'Evening Shift 2'].map(s => (
                  <button key={s}
                    style={{
                      padding: '3px 8px', borderRadius: '5px', border: '1px solid',
                      borderColor: shift === s ? 'var(--accent)' : 'var(--border)',
                      background: shift === s ? 'rgba(249,115,22,.1)' : 'transparent',
                      color: shift === s ? 'var(--accent)' : 'var(--muted)',
                      cursor: 'pointer', fontSize: '10px',
                    }}
                    onClick={() => setShift(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — questions input */}
          <div style={{ flex: 1, minWidth: '300px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>

            {/* Upload method tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
              {[
                { id: 'fetch',  label: '🌐 Fetch from Web' },
                { id: 'json',   label: '📋 JSON Paste' },
                { id: 'manual', label: '✍️ Manual Entry' },
              ].map(t => (
                <button key={t.id}
                  style={{
                    padding: '8px 14px', background: 'transparent', border: 'none',
                    cursor: 'pointer', fontSize: '13px',
                    borderBottom: uploadTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                    color: uploadTab === t.id ? 'var(--accent)' : 'var(--muted)',
                    fontWeight: uploadTab === t.id ? '700' : '400',
                  }}
                  onClick={() => setUploadTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── FETCH FROM WEB TAB ── */}
            {uploadTab === 'fetch' && (
              <div>

                {/* How it works info box */}
                <div style={{ background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.2)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--blue)', marginBottom: '6px' }}>
                    🌐 How Fetch from Web works
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted2)', lineHeight: '1.7' }}>
                    1. Select exam, year and shift from Paper Details on left<br />
                    2. Click Fetch — searches SSCAdda, Testbook, Adda247 etc.<br />
                    3. AI extracts and structures questions automatically<br />
                    4. Review questions, remove any wrong ones<br />
                    5. Click Save to publish for all students
                  </div>
                </div>

                {/* Fetch button */}
                <button
                  style={{
                    width: '100%', padding: '12px', borderRadius: '10px',
                    background: fetching ? 'var(--surface2)' : 'var(--blue)',
                    border: '1px solid var(--blue)',
                    color: fetching ? 'var(--muted)' : 'white',
                    fontSize: '14px', fontWeight: '700', cursor: fetching ? 'not-allowed' : 'pointer',
                    marginBottom: '12px',
                  }}
                  onClick={handleFetchFromWeb}
                  disabled={fetching}
                >
                  {fetching ? '⏳ Fetching from web...' : '🌐 Fetch Shift Paper from Web'}
                </button>

                {/* Status message */}
                {fetchStatus && (
                  <div style={{
                    padding: '10px 14px', borderRadius: '8px', marginBottom: '14px',
                    fontSize: '12px', lineHeight: '1.6',
                    background: fetchStatus.startsWith('✅') ? 'rgba(34,197,94,.08)' : fetchStatus.startsWith('❌') ? 'rgba(239,68,68,.08)' : 'rgba(59,130,246,.06)',
                    border: `1px solid ${fetchStatus.startsWith('✅') ? 'var(--green)' : fetchStatus.startsWith('❌') ? 'var(--red)' : 'rgba(59,130,246,.3)'}`,
                    color: fetchStatus.startsWith('✅') ? 'var(--green)' : fetchStatus.startsWith('❌') ? 'var(--red)' : 'var(--blue)',
                  }}>
                    {fetchStatus}
                  </div>
                )}

                {/* Sources found */}
                {fetchSources.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                      Sources Found
                    </div>
                    {fetchSources.slice(0, 3).map((src, i) => (
                      <div key={i} style={{ fontSize: '11px', color: 'var(--blue)', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        🔗 {src}
                      </div>
                    ))}
                  </div>
                )}

                {/* Preview of fetched questions */}
                {fetchedQuestions.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>
                        📝 {fetchedQuestions.length} Questions Fetched — Review Before Saving
                      </div>
                      <button
                        style={{
                          padding: '8px 20px', borderRadius: '8px',
                          background: savingFetched ? 'var(--surface2)' : 'var(--green)',
                          border: 'none', color: 'white',
                          fontSize: '13px', fontWeight: '700',
                          cursor: savingFetched ? 'not-allowed' : 'pointer',
                        }}
                        onClick={handleSaveFetched}
                        disabled={savingFetched}
                      >
                        {savingFetched ? '💾 Saving...' : '💾 Save & Publish'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                      {fetchedQuestions.map((q, i) => (
                        <div key={i} style={{
                          background: 'var(--surface2)', border: '1px solid var(--border)',
                          borderRadius: '10px', padding: '12px 14px',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', gap: '6px', marginBottom: '5px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '10px', padding: '2px 7px', background: 'rgba(249,115,22,.1)', border: '1px solid rgba(249,115,22,.2)', borderRadius: '4px', color: 'var(--accent)' }}>
                                  {q.topic}
                                </span>
                                <span style={{ fontSize: '10px', padding: '2px 7px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--muted)' }}>
                                  Difficulty: {q.difficulty}/10
                                </span>
                              </div>
                              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '6px', lineHeight: '1.5' }}>
                                Q{i + 1}. {q.question}
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
                                {q.options?.map((opt, oi) => (
                                  <div key={oi} style={{
                                    fontSize: '11px', padding: '4px 8px', borderRadius: '5px',
                                    background: oi === q.correct ? 'rgba(34,197,94,.08)' : 'var(--surface)',
                                    border: `1px solid ${oi === q.correct ? 'var(--green)' : 'var(--border)'}`,
                                    color: oi === q.correct ? 'var(--green)' : 'var(--muted2)',
                                  }}>
                                    <span style={{ fontWeight: '700' }}>{['A','B','C','D'][oi]}.</span> {opt}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <button
                              style={{
                                padding: '4px 8px', borderRadius: '6px', flexShrink: 0,
                                background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)',
                                color: 'var(--red)', fontSize: '11px', cursor: 'pointer',
                              }}
                              onClick={() => removeFetchedQuestion(i)}
                              title="Remove this question"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* JSON Tab */}
            {uploadTab === 'json' && (
              <div>
                <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '10px 12px', marginBottom: '10px', fontSize: '11px', color: 'var(--muted)', fontFamily: 'monospace', lineHeight: '1.6' }}>
                  {`[
  {
    "question": "What is 2+2?",
    "options": ["3","4","5","6"],
    "correct": 1,
    "explanation": "2+2=4",
    "topic": "Quantitative Aptitude",
    "subtopic": "Basic Math",
    "difficulty": 2,
    "questionType": "calculation"
  }
]`}
                </div>

                <textarea
                  style={{ width: '100%', height: '220px', padding: '10px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '12px', resize: 'vertical', fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none' }}
                  placeholder="Paste your shift paper JSON here..."
                  value={jsonText}
                  onChange={e => setJsonText(e.target.value)}
                />

                <button
                  style={{ marginTop: '10px', padding: '10px 24px', background: jsonText.trim() ? 'var(--accent)' : 'var(--surface2)', border: 'none', borderRadius: '8px', color: jsonText.trim() ? 'white' : 'var(--muted)', fontSize: '13px', fontWeight: '700', cursor: jsonText.trim() ? 'pointer' : 'default', opacity: uploading ? 0.7 : 1 }}
                  onClick={handleJsonUpload}
                  disabled={uploading || !jsonText.trim()}
                >
                  {uploading ? '⏳ Uploading...' : '⬆️ Upload Shift Paper'}
                </button>

                {jsonStatus && (
                  <div style={{ marginTop: '10px', padding: '9px 12px', background: jsonStatus.startsWith('✅') ? 'rgba(34,197,94,.08)' : jsonStatus.startsWith('❌') ? 'rgba(239,68,68,.08)' : 'var(--surface2)', border: `1px solid ${jsonStatus.startsWith('✅') ? 'var(--green)' : jsonStatus.startsWith('❌') ? 'var(--red)' : 'var(--border)'}`, borderRadius: '8px', fontSize: '12px' }}>
                    {jsonStatus}
                  </div>
                )}
              </div>
            )}

            {/* Manual Entry Tab */}
            {uploadTab === 'manual' && (
              <div>
                {/* Questions added so far */}
                {manualQuestions.length > 0 && (
                  <div style={{ background: 'rgba(34,197,94,.06)', border: '1px solid var(--green)', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px', fontSize: '12px', color: 'var(--green)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>✅ {manualQuestions.length} questions added</span>
                    <button
                      style={{ padding: '4px 12px', background: 'var(--accent)', border: 'none', borderRadius: '6px', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer', opacity: uploading ? 0.7 : 1 }}
                      onClick={handleManualUpload}
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : '⬆️ Upload All'}
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>

                  {/* Topic + Subtopic row */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Topic *</label>
                      <select style={inputStyle} value={currentQ.topic} onChange={e => setCurrentQ(p => ({ ...p, topic: e.target.value }))}>
                        {(TOPICS[exam] || []).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Subtopic</label>
                      <input style={inputStyle} placeholder="e.g. Profit & Loss" value={currentQ.subtopic} onChange={e => setCurrentQ(p => ({ ...p, subtopic: e.target.value }))} />
                    </div>
                  </div>

                  {/* Difficulty + Type row */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Difficulty (1-10)</label>
                      <input style={inputStyle} type="number" min="1" max="10" value={currentQ.difficulty} onChange={e => setCurrentQ(p => ({ ...p, difficulty: e.target.value }))} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Question Type</label>
                      <select style={inputStyle} value={currentQ.questionType} onChange={e => setCurrentQ(p => ({ ...p, questionType: e.target.value }))}>
                        <option value="calculation">Calculation</option>
                        <option value="conceptual">Conceptual</option>
                        <option value="factual">Factual</option>
                        <option value="analytical">Analytical</option>
                      </select>
                    </div>
                  </div>

                  {/* Question */}
                  <div>
                    <label style={labelStyle}>Question *</label>
                    <textarea style={{ ...inputStyle, height: '70px', resize: 'vertical' }} placeholder="Enter question text..." value={currentQ.question} onChange={e => setCurrentQ(p => ({ ...p, question: e.target.value }))} />
                  </div>

                  {/* Options */}
                  {['A','B','C','D'].map((opt, i) => (
                    <div key={opt}>
                      <label style={labelStyle}>Option {opt} *</label>
                      <input style={inputStyle} placeholder={`Option ${opt}`} value={currentQ[`option${opt}`]} onChange={e => setCurrentQ(p => ({ ...p, [`option${opt}`]: e.target.value }))} />
                    </div>
                  ))}

                  {/* Correct Answer */}
                  <div>
                    <label style={labelStyle}>Correct Answer *</label>
                    <select style={inputStyle} value={currentQ.correct} onChange={e => setCurrentQ(p => ({ ...p, correct: e.target.value }))}>
                      {['Option A','Option B','Option C','Option D'].map((o,i) => <option key={i} value={i}>{o}</option>)}
                    </select>
                  </div>

                  {/* Explanation */}
                  <div>
                    <label style={labelStyle}>Explanation *</label>
                    <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' }} placeholder="Step by step explanation..." value={currentQ.explanation} onChange={e => setCurrentQ(p => ({ ...p, explanation: e.target.value }))} />
                  </div>

                </div>

                <button
                  style={{ padding: '9px 20px', background: 'var(--accent)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                  onClick={handleAddQuestion}
                >
                  + Add Question
                </button>

                {manualStatus && (
                  <div style={{ marginTop: '8px', padding: '8px 12px', background: manualStatus.startsWith('✅') ? 'rgba(34,197,94,.08)' : 'rgba(239,68,68,.08)', border: `1px solid ${manualStatus.startsWith('✅') ? 'var(--green)' : 'var(--red)'}`, borderRadius: '8px', fontSize: '12px' }}>
                    {manualStatus}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MANAGE TAB ── */}
      {viewTab === 'manage' && (
        <div>
          {loadingShifts ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : allShifts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
              No shift papers uploaded yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {allShifts.map(s => (
                <div key={s.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>
                        {s.exam} — {s.shift}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <span>📅 {s.date}</span>
                        <span>📝 {s.totalQuestions} questions</span>
                        <span>📅 {s.year}</span>
                        {s.analysis && (
                          <span style={{ color: difficultyColor(s.analysis.avgDifficulty), fontWeight: '600' }}>
                            {difficultyLabel(s.analysis.avgDifficulty)} ({s.analysis.avgDifficulty}/10)
                          </span>
                        )}
                      </div>
                      {s.analysis && (
                        <div style={{ marginTop: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {s.analysis.keyTopics?.map(t => (
                            <span key={t} style={{ fontSize: '10px', padding: '2px 7px', background: 'rgba(249,115,22,.08)', border: '1px solid rgba(249,115,22,.2)', borderRadius: '4px', color: 'var(--accent)' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        style={{ padding: '6px 12px', background: s.analysis ? 'rgba(34,197,94,.08)' : 'var(--surface2)', border: `1px solid ${s.analysis ? 'var(--green)' : 'var(--border)'}`, borderRadius: '7px', color: s.analysis ? 'var(--green)' : 'var(--muted)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', opacity: analysing === s.id ? 0.7 : 1 }}
                        onClick={() => handleAnalyse(s.id)}
                        disabled={analysing === s.id}
                      >
                        {analysing === s.id ? '⏳ Analysing...' : s.analysis ? '🔄 Re-analyse' : '📊 Analyse'}
                      </button>
                      <button
                        style={{ padding: '6px 12px', background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', borderRadius: '7px', color: 'var(--red)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', opacity: deleting === s.id ? 0.7 : 1 }}
                        onClick={() => handleDelete(s.id)}
                        disabled={deleting === s.id}
                      >
                        {deleting === s.id ? '⏳' : '🗑️ Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const labelStyle = {
  fontSize: '11px', fontWeight: '700', color: 'var(--muted)',
  textTransform: 'uppercase', letterSpacing: '0.5px',
  marginBottom: '5px', display: 'block',
}

const inputStyle = {
  width: '100%', padding: '8px 10px',
  background: 'var(--surface2)', border: '1px solid var(--border)',
  borderRadius: '8px', color: 'var(--text)', fontSize: '12px',
  boxSizing: 'border-box', outline: 'none',
}