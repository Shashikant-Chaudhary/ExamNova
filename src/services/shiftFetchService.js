// ─────────────────────────────────────────────
// shiftFetchService.js
// Fetches real shift papers from web using Tavily
// Then uses Groq to structure into question format
// ─────────────────────────────────────────────

const TAVILY_KEY = import.meta.env.VITE_TAVILY_API_KEY
const TAVILY_URL = 'https://api.tavily.com/search'
const GROQ_KEY   = import.meta.env.VITE_GROQ_API_KEY
const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions'

// ── SITES THAT PUBLISH SHIFT PAPERS ───────────
const SHIFT_DOMAINS = [
  'sscadda.com',
  'testbook.com',
  'gradeup.co',
  'adda247.com',
  'oliveboard.in',
  'bankersadda.com',
  'jagranjosh.com',
  'careerpower.in',
  'affairscloud.com',
  'cracku.in',
]

// ── SEARCH QUERIES PER EXAM ────────────────────
const EXAM_QUERIES = {
  'SSC CGL':      (year, shift) => `SSC CGL ${year} ${shift} question paper with answers`,
  'SSC CHSL':     (year, shift) => `SSC CHSL ${year} ${shift} question paper with answers`,
  'SSC MTS':      (year, shift) => `SSC MTS ${year} ${shift} question paper with answers`,
  'SSC GD':       (year, shift) => `SSC GD Constable ${year} ${shift} question paper`,
  'RRB NTPC':     (year, shift) => `RRB NTPC ${year} ${shift} question paper with answers`,
  'RRB Group D':  (year, shift) => `RRB Group D ${year} ${shift} question paper`,
  'RRB ALP':      (year, shift) => `RRB ALP ${year} ${shift} question paper with answers`,
  'IBPS PO':      (year, shift) => `IBPS PO ${year} ${shift} question paper with answers`,
  'IBPS Clerk':   (year, shift) => `IBPS Clerk ${year} ${shift} question paper`,
  'SBI PO':       (year, shift) => `SBI PO ${year} ${shift} question paper with answers`,
  'SBI Clerk':    (year, shift) => `SBI Clerk ${year} ${shift} question paper`,
  'UPSC Prelims': (year, shift) => `UPSC Prelims ${year} GS Paper 1 questions answers`,
  'UPSC CDS':     (year, shift) => `UPSC CDS ${year} ${shift} question paper`,
  'State PSC':    (year, shift) => `State PSC ${year} ${shift} question paper with answers`,
}

// ── STEP 1: SEARCH WEB FOR SHIFT PAPER ────────
async function searchShiftPaper({ exam, year, shift }) {
  const queryFn = EXAM_QUERIES[exam] || ((y, s) => `${exam} ${y} ${s} question paper`)
  const query   = queryFn(year, shift)

  console.log(`🔍 Searching: ${query}`)

  const response = await fetch(TAVILY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key:             TAVILY_KEY,
      query,
      search_depth:        'advanced',
      include_answer:      true,
      include_raw_content: true,
      max_results:         5,
      include_domains:     SHIFT_DOMAINS,
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err?.message || 'Tavily search failed')
  }

  const data = await response.json()

  // combine all raw content
  const results  = data.results || []
  const answer   = data.answer  || ''

  // prefer raw_content (full page text) over just snippets
  const content = [
    answer,
    ...results.map(r => {
      const source = r.url || ''
      const text   = r.raw_content || r.content || ''
      return `[SOURCE: ${source}]\n${text}`
    }),
  ].filter(Boolean).join('\n\n---\n\n')

  console.log(`✅ Got ${results.length} sources, ${content.length} chars`)
  return { content, sources: results.map(r => r.url) }
}


const wait = (ms) => new Promise(r => setTimeout(r, ms))

// ── STEP 2: GROQ STRUCTURES RAW TEXT ──────────
// Groq 70b limit: ~12000 TPM
// Our prompt overhead: ~800 tokens
// Safe content size: ~2500 chars (~700 tokens)
async function structureWithGroq({ rawContent, exam, year, shift, chunkIndex = 0 }, retryCount = 0) {

  const CHUNK_SIZE = 2500
  const start      = chunkIndex * CHUNK_SIZE
  const chunk      = rawContent.substring(start, start + CHUNK_SIZE)

  if (!chunk.trim()) return []

  const prompt = `Extract MCQ questions from this text. Exam: ${exam} ${year} ${shift}.

TEXT:
${chunk}

INSTRUCTIONS:
1. Find ALL multiple choice questions in this content
2. Each question must have exactly 4 options and 1 correct answer
3. correct field must be 0-indexed (0=A, 1=B, 2=C, 3=D)
4. If explanation is available, include it — otherwise write a brief one
5. Identify the topic for each question based on subject matter
6. Estimate difficulty 1-10 based on question complexity

TOPIC MAPPING for ${exam}:
- Math/Calculation questions → "Quantitative Aptitude" or "Mathematics"  
- Logical/Reasoning questions → "General Intelligence & Reasoning"
- English/Grammar questions → "English Language"
- GK/History/Geography/Science → "General Awareness"
- Current events → "General Awareness"

RULES:
- Only extract questions that are clearly complete (have question + 4 options + answer)
- Skip incomplete or unclear questions
- If you cannot find any real questions, return empty array []
- Do NOT invent or make up questions — only extract from the content above

RESPOND ONLY WITH VALID JSON ARRAY — no markdown, no explanation:

[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Brief explanation of the correct answer.",
    "topic": "General Awareness",
    "subtopic": "History",
    "difficulty": 5,
    "questionType": "factual"
  }
]`

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model:       'llama-3.3-70b-versatile',
      max_tokens:  2000,
      temperature: 0.1,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    if (response.status === 429 || response.status === 413) {
      if (retryCount < 2) {
        const waitTime = response.status === 429 ? 35000 : 5000
        console.log(`Groq ${response.status} — waiting ${waitTime/1000}s before retry ${retryCount + 1}...`)
        await wait(waitTime)
        return structureWithGroq({ rawContent, exam, year, shift, chunkIndex }, retryCount + 1)
      }
      throw new Error('RATE_LIMIT')
    }
    throw new Error(err?.error?.message || 'Groq failed')
  }

  const data = await response.json()
  const raw  = data.choices?.[0]?.message?.content || '[]'

  // parse JSON safely
  try {
    const clean = raw.replace(/```json|```/g, '').trim()
    const questions = JSON.parse(clean)
    if (!Array.isArray(questions)) return []

    // validate each question
    return questions.filter(q =>
      q.question &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      typeof q.correct === 'number' &&
      q.correct >= 0 && q.correct <= 3
    )
  } catch (e) {
    console.error('JSON parse error:', e)
    return []
  }
}


// ── MAIN EXPORT: FETCH + STRUCTURE ────────────
export async function fetchShiftPaperFromWeb({ exam, year, shift }) {
  try {
    // Step 1 — search web
    const { content, sources } = await searchShiftPaper({ exam, year, shift })

    if (!content || content.length < 200) {
      throw new Error('No content found on web for this shift paper')
    }

    // Step 2 — structure with Groq in small chunks with delays
    const CHUNK_SIZE  = 2500
    const totalChunks = Math.min(6, Math.ceil(content.length / CHUNK_SIZE)) // max 6 chunks
    let   allQuestions = []

    console.log(`Processing ${totalChunks} chunks of content...`)

    for (let i = 0; i < totalChunks; i++) {
      if (i > 0) await wait(8000) // wait 8s between chunks to avoid rate limit
      console.log(`Processing chunk ${i + 1}/${totalChunks}...`)
      try {
        const chunkQuestions = await structureWithGroq({
          rawContent: content, exam, year, shift, chunkIndex: i
        })
        allQuestions.push(...chunkQuestions)
        console.log(`Chunk ${i + 1}: found ${chunkQuestions.length} questions (total: ${allQuestions.length})`)
        // stop early if we have enough
        if (allQuestions.length >= 25) break
      } catch (e) {
        console.log(`Chunk ${i + 1} failed:`, e.message)
        if (e.message === 'RATE_LIMIT') break
      }
    }

    // deduplicate by question text
    const seen     = new Set()
    const questions = allQuestions.filter(q => {
      const key = q.question.substring(0, 40)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    if (questions.length === 0) {
      throw new Error(`No questions found for ${exam} ${year} ${shift}. This paper may not be published online yet. Try 2024 or 2023.`)
    }

    return {
      questions,
      sources,
      totalFound: questions.length,
    }

  } catch (error) {
    console.error('fetchShiftPaperFromWeb error:', error)
    throw error
  }
}