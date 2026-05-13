import { saveAskedQuestions, getAskedQuestions } from './storageService'
import EXAM_PATTERNS from '../data/examPatterns.js'

// ── API KEYS ───────────────────────────────────
const GROQ_KEY    = import.meta.env.VITE_GROQ_API_KEY

const GROQ_URL    = 'https://api.groq.com/openai/v1/chat/completions'

// ── WAIT HELPER ────────────────────────────────
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ── GLOBAL RATE LIMIT STATE ────────────────────
// Tracks when we're allowed to make the next request
let nextAllowedAt = 0          // timestamp in ms — don't call before this
let isRequesting  = false
const requestQueue = []

// Called when we get a 429 — sets a cooldown based on retry-after header
function setRateLimitCooldown(retryAfterSeconds) {
  const cooldownMs = (retryAfterSeconds + 2) * 1000  // add 2s buffer
  nextAllowedAt = Date.now() + cooldownMs
  console.log(`⏳ Rate limit cooldown set: ${retryAfterSeconds}s (until ${new Date(nextAllowedAt).toLocaleTimeString()})`)
}

async function queueRequest(fn) {
  return new Promise((resolve, reject) => {
    requestQueue.push({ fn, resolve, reject })
    processQueue()
  })
}

async function processQueue() {
  if (isRequesting || requestQueue.length === 0) return
  isRequesting = true
  const { fn, resolve, reject } = requestQueue.shift()
  try {
    // ── Wait out any active cooldown before firing ──
    const waitMs = nextAllowedAt - Date.now()
    if (waitMs > 0) {
      console.log(`⏳ Waiting ${Math.ceil(waitMs / 1000)}s for rate limit cooldown...`)
      await wait(waitMs)
    }
    const result = await fn()
    resolve(result)
  } catch (e) {
    reject(e)
  } finally {
    isRequesting = false
    await wait(2000) // minimum 2s gap between requests
    processQueue()
  }
}


// ── BUILD PROMPT ───────────────────────────────
function buildPrompt({ exam, topic, subtopics, level, language, count, alreadyAsked, useFullPattern = true }) {
  const sessionId = Math.random().toString(36).substring(7)
  const timestamp = new Date().toISOString()

  const subtopicsArray = Array.isArray(subtopics) 
    ? subtopics 
    : subtopics 
    ? [subtopics] 
    : []

  const languageInstruction = language === 'hindi'
    ? `LANGUAGE: Write ALL questions, options, and explanations in Hindi (Devanagari script). Do not translate English grammar terms or proper nouns.`
    : `LANGUAGE: Write all questions, options, and explanations in English.`

  const avoidSection = alreadyAsked.length > 0
    ? `QUESTIONS ALREADY ASKED — DO NOT REPEAT:\n${alreadyAsked.slice(-20).map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n`
    : ''

  // get exam pattern data
  const pattern = EXAM_PATTERNS[exam]
  const topicPattern = pattern?.topics?.[topic]

  // build pattern context
  const patternContext = !topicPattern
  ? `Match real ${exam} exam pattern for ${topic}.`
  : useFullPattern
  ? `
EXAM PATTERN ANALYSIS FOR ${exam} — ${topic}:
Exam Info: ${pattern.examInfo}
Overall Difficulty: ${pattern.overallDifficulty}
Questions in exam: ${topicPattern.questionsInExam}
Section Difficulty: ${topicPattern.difficulty}

Most Frequently Asked Subtopics:
${topicPattern.frequentSubtopics.map(s =>
  `- ${s.name}: ${s.frequency} frequency, ${s.questionsPerPaper} questions per paper`
).join('\n')}

Question Style:
${topicPattern.questionStyle}

Sample Questions:
${topicPattern.sampleQuestions?.map((q, i) => `${i + 1}. ${q}`).join('\n') || ''}
`
  : `
EXAM: ${exam} | TOPIC: ${topic} | DIFFICULTY: ${topicPattern.difficulty}
TOP SUBTOPICS: ${topicPattern.frequentSubtopics.slice(0, 5).map(s => s.name).join(', ')}
Continue generating questions in the same style and difficulty as established.
`

const currentYear  = new Date().getFullYear()
const nextExamYear = currentYear

const difficultyInstruction = level === 'same' ? `
DIFFICULTY — PREDICTED LEVEL FOR UPCOMING ${exam} EXAM ${nextExamYear}:

Your job is to PREDICT what questions will appear in the NEXT ${exam} exam.

To predict correctly follow this approach:
1. ANALYSE the pattern from last 3 years of ${exam} papers
2. IDENTIFY which subtopics are trending — being asked more recently
3. NOTICE difficulty shift — is exam getting harder or easier year by year
4. PREDICT based on current affairs and syllabus changes
5. GENERATE questions that a student MUST practice to clear upcoming exam

Prediction rules:
- If a subtopic was asked in 2022 and 2023 but not 2024 — HIGH chance in 2025
- If difficulty increased each year — match the latest difficulty
- Include questions on topics that are NEW in syllabus
- Include current affairs topics relevant to exam date
- Mix of sure-shot questions (80%) and surprise questions (20%)
- Questions should feel like they came from the NEXT real ${exam} paper
- A well prepared student should score 70-75% on these questions
- Options should be realistic — same style as actual exam options

GOAL: Student who practices these questions should feel fully prepared
for the upcoming ${exam} exam with zero surprises.
` : `
DIFFICULTY — HARDER THAN CURRENT YEAR EXAM:
- Make questions NOTICEABLY harder than actual ${exam} exam
- Take the same topics but increase complexity:
  * Math: add extra steps, combine 2 concepts in one question
  * Reasoning: add more variables, longer puzzles, more conditions
  * GK: ask lesser known facts, deeper knowledge required
  * English: use advanced vocabulary, complex sentence structures
- Options should be very close — even prepared students must think twice
- A topper of ${exam} should find these challenging
- This level is meant for students who want to go beyond exam level
`


  return `You are a senior question setter who has set papers for ${exam} for 10 years.

SESSION: ${sessionId}
TIME: ${timestamp}
EXAM: ${exam}
TOPIC: ${topic}
SUBTOPICS TO FOCUS ON: ${subtopics && subtopics.length > 0 ? subtopics.join(', ') : 'Follow frequency data above'}
NUMBER OF QUESTIONS: ${count}
${languageInstruction}

${patternContext}

${difficultyInstruction}

${avoidSection}

QUALITY RULES:
1. Every question must match the style shown in sample questions
2. Follow topic frequency — ask from high frequency subtopics more
3. Verify every answer mathematically before writing
4. All 4 options must be plausible — no obviously wrong options
5. Options for Math: within 10-15% of correct answer
6. Explanation: show full step by step solution
7. Never ask direct multiplication or trivial calculations
8. Each question must require genuine knowledge to answer

CRITICAL: Before finalizing each question verify:
- Is the correct answer actually correct?
- Does it match real ${exam} exam style?
- Are all options different and plausible?
- Does difficulty match requirement?

RESPOND ONLY WITH VALID JSON — no markdown, no extra text.

EXPLANATION FORMAT — Write exactly like a teacher explaining to a student in class. Short, clear, friendly. NOT a textbook. NOT a summary paragraph.

For MATH questions:
"💡 Trick: [one line shortcut or smart approach if any]\n
✏️ [State what is given in one line]\n
Step 1: [what to do first — very short]\n
Step 2: [next calculation]\n
Step 3: [if needed]\n
✅ [final answer with unit]\n"

For REASONING questions:
"💡 Trick: [pattern or logic in one line]\n
Step 1: [break down the question simply]\n
Step 2: [apply the logic]\n
✅ [final answer]\n
⚠️ Trap: [common mistake to avoid — only if relevant]\n"

For GK/CURRENT AFFAIRS questions:
"🔑 [The key fact in one bold line — most important thing to remember]\n
📖 [One line of context — why it matters]\n
💡 Memory tip: [easy way to remember — rhyme, abbreviation, association]\n"

For ENGLISH questions:
"📝 Rule: [the grammar rule in simple words]\n
✅ Why correct: [one line why answer is right]\n
❌ Common mistake: [what students usually get wrong]\n
💡 Remember: [simple rule to remember forever]\n"

IMPORTANT: Never write a long paragraph. Every explanation must feel like a teacher saying it out loud — short sentences, easy language, exam-focused. Always put the trick or shortcut FIRST before steps.

REQUIRED JSON FORMAT:
[
  {
    "question": "Question text here?",
    "subtopic": "Subtopic name",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Detailed explanation here.",
    "difficulty": 5,
    "questionType": "mcq"
  }
]`
}


// ── CALL GROQ ──────────────────────────────────
async function callGroq(prompt) {
  return queueRequest(async () => {
    console.log('Trying Groq...')
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model:       'llama-3.3-70b-versatile',
        messages:    [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens:  4000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log('Groq failed:', errorText)

      if (response.status === 429) {
        // ── Parse retry-after from response body ──
        let retryAfter = 35  // default wait
        try {
          const errorJson = JSON.parse(errorText)
          const msg = errorJson?.error?.message || ''
          // Groq includes "Please try again in 27.96s" in message
          const match = msg.match(/try again in ([\d.]+)s/i)
          if (match) retryAfter = Math.ceil(parseFloat(match[1]))
        } catch (_) {}

        setRateLimitCooldown(retryAfter)
        throw new Error('RATE_LIMIT')
      }
      throw new Error(`Groq error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  })
}


// ── IS RATE LIMIT ERROR ────────────────────────
function isRateLimit(e) {
  return e.message === 'RATE_LIMIT' || e.message?.includes('429')
}


// ── PARSE JSON FROM AI RESPONSE ────────────────
function parseJSON(raw) {
  try {
    // remove markdown code blocks if present
    const cleaned = raw
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    return JSON.parse(cleaned)
  } catch (e) {
    // try to extract JSON array from response
    const match = raw.match(/\[[\s\S]*\]/)
    if (match) {
      try {
        let jsonStr = match[0]
        // Fix trailing commas in objects and arrays
        jsonStr = jsonStr.replace(/,\s*([\}\]])/g, '$1')
        return JSON.parse(jsonStr)
      } catch (parseErr) {
        // If still failed, try to find complete objects
        try {
          const objectMatches = raw.match(/\{[^{}]*"correct"[^{}]*\}/g)
          if (objectMatches && objectMatches.length > 0) {
            // Build valid JSON array from found objects
            const fixedJson = '[' + objectMatches.map(obj => {
              let fixed = obj.replace(/,\s*([\}\]])/g, '$1')
              return fixed
            }).join(',') + ']'
            return JSON.parse(fixedJson)
          }
        } catch (_) {}
      }
    }
    console.error('JSON parse failed:', raw.substring(0, 200))
    throw new Error('PARSE_ERROR')
  }
}


// ── GENERATE A SINGLE BATCH ────────────────────
async function generateBatch({
  exam, topic, subtopics, level, language, count, alreadyAsked, useFullPattern
}) {
  const prompt = buildPrompt({
    exam, topic, subtopics, level, language,
    count, alreadyAsked, useFullPattern,
  })

  try {
    const raw = await callGroq(prompt)
    return parseJSON(raw)
  } catch (e) {
    console.log('Groq failed:', e.message)
    if (isRateLimit(e)) throw new Error('RATE_LIMIT')
    throw e
  }
}


// ── GENERATE QUESTIONS (used by TestScreen directly) ──
export async function generateQuestions({
  exam, topic, subtopics, level, language = 'english', count = 10
}) {
  try {
    const alreadyAsked = getAskedQuestions(exam, topic) || []

    const questions = await generateBatch({
      exam, topic, subtopics, level, language,
      count, alreadyAsked, useFullPattern: true,
    })

    saveAskedQuestions(exam, topic, questions.map(q => q.question))
    return questions
  } catch (error) {
    console.error('AI generation error:', error)

    // ── Bank fallback — generateForBank directly ──
    if (!isRateLimit(error)) {
      console.log('Bank failed — generating directly...')
      try {
        return await generateForBank({ exam, topic, subtopics, level, language, count })
      } catch (e2) {
        throw e2
      }
    }
    throw error
  }
}


// ── GENERATE SIMILAR QUESTIONS ─────────────────
export async function generateSimilarQuestions({ question, exam, count = 5 }) {
  const prompt = `Generate ${count} questions similar to this one for ${exam} exam practice.

Original question: ${question.question}
Topic: ${question.subtopic || 'General'}

RESPOND ONLY WITH VALID JSON.

[
  {
    "question": "...",
    "subtopic": "...",
    "options": ["A", "B", "C", "D"],
    "correct": 0,
    "explanation": "..."
  }
]`

  try {
    const raw = await callGroq(prompt)
    return parseJSON(raw)
  } catch (error) {
    console.error('Similar questions error:', error)
    throw error
  }
}


// ── GENERATE FOR QUESTION BANK ─────────────────
// ── FIXED: smaller batches + smart retry-after wait ──
export async function generateForBank({
  exam, topic, subtopics, level, language = 'english', count = 12
}) {
  const subtopicsArray = Array.isArray(subtopics) 
    ? subtopics 
    : subtopics ? [subtopics] : []

  try {
    // ── REDUCED batch size to stay well under 12k TPM ──
    // Each request: ~700 token prompt + ~800 token response = ~1500 tokens
    // At 4 questions per batch, response is smaller = safer
    const BATCH_SIZE   = 4
    const allQuestions = []
    let remaining      = count
    let batchNumber    = 0

    while (remaining > 0) {
      // ── Wait between batches to space out token usage ──
      // First batch: no wait (queue handles cooldowns)
      // Subsequent batches: 12s gap = ~4 batches/min = ~6000 tokens/min (safe under 12k)
      if (batchNumber > 0) {
        console.log(`⏳ Batch ${batchNumber + 1}: waiting 12s before next batch...`)
        await wait(12000)
      }

      const batchCount = Math.min(BATCH_SIZE, remaining)

      try {
        const batch = await generateBatch({
          exam,
          topic,
          subtopics:      subtopicsArray,
          level,
          language,
          count:          batchCount,
          alreadyAsked:   allQuestions.map(q => q.question),
          useFullPattern: batchNumber === 0,
        })

        allQuestions.push(...batch)
        remaining -= batchCount
        batchNumber++

      } catch (batchError) {
        if (batchError.message === 'RATE_LIMIT') {
          // cooldown is already set in callGroq — the queue will wait it out
          // retry this batch once after cooldown clears
          console.log(`⚠️ Batch ${batchNumber + 1} rate limited — will retry after cooldown...`)

          // wait for cooldown + small buffer, then retry once
          const waitMs = Math.max(nextAllowedAt - Date.now(), 0) + 2000
          await wait(waitMs)

          const retryBatch = await generateBatch({
            exam,
            topic,
            subtopics:      subtopicsArray,
            level,
            language,
            count:          batchCount,
            alreadyAsked:   allQuestions.map(q => q.question),
            useFullPattern: batchNumber === 0,
          })

          allQuestions.push(...retryBatch)
          remaining -= batchCount
          batchNumber++
        } else {
          throw batchError
        }
      }
    }

    return allQuestions

  } catch (error) {
    console.error('Generate for bank error:', error)
    if (error.message === 'RATE_LIMIT') throw new Error('RATE_LIMIT')
    throw error
  }
}


// ── GENERATE CURRENT AFFAIRS QUESTIONS ─────────
export async function generateCurrentAffairsQuestions({
  exam, topic, year, count = 15, language = 'english'
}) {
  try {
    const { fetchNews } = await import('./newsService.js')
    const newsContext = await fetchNews({ topic, year })

    const languageInstruction = language === 'hindi'
      ? `LANGUAGE: Write ALL questions, options, and explanations in Hindi (Devanagari script).`
      : `LANGUAGE: Write all questions, options, and explanations in English.`

    const prompt = `You are a senior current affairs question setter for Indian government competitive exams.

EXAM: ${exam}
TOPIC: ${topic}
YEAR: ${year}
NUMBER OF QUESTIONS: ${count}
${languageInstruction}

REAL NEWS CONTEXT — use these actual events to make questions:
${newsContext}

EXAM PATTERN RULES FOR ${exam}:
${getExamPattern(exam)}

STRICT RULES:
1. ONLY make questions based on the real news context above
2. Every question must be about a REAL event, person, or fact
3. All 4 options must be plausible — no obviously wrong answers
4. Questions must match exact pattern of ${exam}
5. Cover different events — do not repeat same topic
6. For appointments — ask about the person and their role
7. For schemes — ask about launch date, benefit, ministry
8. For sports — ask about winner, venue, record
9. For science — ask about mission name, achievement, date
10. Explanation must mention the real fact clearly

RESPOND ONLY WITH VALID JSON — no markdown, no extra text.

Format:
[
  {
    "question": "Question text here?",
    "subtopic": "${topic}",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Real fact explanation here."
  }
]`

    try {
      const raw = await callGroq(prompt)
      return parseJSON(raw)
    } catch (e) {
      console.log('Groq failed for CA:', e.message)
      throw new Error('RATE_LIMIT')
    }

  } catch (error) {
    console.error('Current affairs generation error:', error)
    throw error
  }
}


// ── EXAM DIFFICULTY STANDARD ───────────────────
function getExamDifficulty(exam) {
  const standards = {
    'SSC CGL': `SSC CGL Tier 1 standard — Math questions involve 2-3 step calculations with percentages, ratios combined. Reasoning has complex analogies and series. English has difficult one word substitutions and idioms. GK asks specific facts from history, polity, science.`,
    'SSC CHSL': `SSC CHSL standard — slightly easier than CGL but not basic. Math involves direct formula application with tricky numbers. Reasoning has moderate puzzles. English has fill in blanks with close options.`,
    'SSC MTS': `SSC MTS standard — moderate difficulty. Math is calculation based. Reasoning is direct but not obvious. English is simple grammar based.`,
    'SSC GD': `SSC GD Constable standard — moderate. Basic math with tricks. Simple reasoning. Easy English. GK from news and sports.`,
    'RRB NTPC': `RRB NTPC standard — Math involves profit loss, SI CI, time work with realistic numbers. Reasoning has coding decoding, blood relations. GK covers railway, science, current affairs specific to railway exam.`,
    'RRB Group D': `RRB Group D standard — Math is moderate level. Science questions cover physics, chemistry, biology basics with application. GK is current affairs and railway focused.`,
    'RRB ALP': `RRB ALP standard — Heavy on basic science and engineering. Math is moderate. Questions test technical knowledge relevant to loco pilot role.`,
    'IBPS PO': `IBPS PO standard — High difficulty. Reasoning has complex puzzles with 5-6 variables. Quant has DI sets with calculations. English has RC with inferential questions. Banking awareness included.`,
    'IBPS Clerk': `IBPS Clerk standard — Moderate to high difficulty. Reasoning has seating arrangements. Quant has simplification and DI. English has cloze test and error detection.`,
    'SBI PO': `SBI PO standard — Highest banking exam difficulty. Complex DI with multiple tables. Reasoning has machine input output and complex puzzles. English has advanced RC.`,
    'SBI Clerk': `SBI Clerk standard — Moderate difficulty. Number series, simplification, basic DI. Reasoning has coding and arrangements. English is moderate.`,
    'UPSC Prelims': `UPSC Prelims standard — High analytical difficulty. Questions are statement based, elimination based. History asks about specific events and their significance. Polity asks about articles and constitutional provisions. Economy asks about policies and their impact. Science asks applied concepts.`,
    'UPSC CDS': `UPSC CDS standard — Defence focused GK. Math is moderate to hard. English is advanced grammar and comprehension. GK covers defence, international relations, history.`,
    'State PSC': `State PSC standard — Mix of state specific and national questions. History covers state history. Geography covers state geography. Polity covers state government structure. Current affairs covers state events.`,
  }
  return standards[exam] || `Questions must match the exact difficulty and pattern of real ${exam} examination papers.`
}


// ── EXAM PATTERN HELPER ────────────────────────
function getExamPattern(exam) {
  const patterns = {
    'SSC CGL':      'Ask about schemes, appointments, sports winners, science achievements. Keep questions factual and direct.',
    'SSC CHSL':     'Ask about national events, awards, sports, government schemes. Simple factual questions.',
    'SSC MTS':      'Basic current affairs — national events, sports, awards. Simple language.',
    'SSC GD':       'Basic current affairs — national events, sports, awards. Very simple questions.',
    'RRB NTPC':     'Ask about railway news, national events, sports, science. Include railway budget and new schemes.',
    'RRB Group D':  'Basic national current affairs, sports, science discoveries.',
    'RRB ALP':      'Science and technology news, national events, sports.',
    'IBPS PO':      'Banking news, RBI policies, economic events, financial appointments, GDP data.',
    'IBPS Clerk':   'Banking and finance news, RBI updates, economic events.',
    'SBI PO':       'Banking news, RBI policies, economic events, international finance.',
    'SBI Clerk':    'Banking news, national events, RBI updates.',
    'UPSC Prelims': 'Deep questions on policies, international relations, environment, economy, science. Multi-dimensional questions.',
    'UPSC CDS':     'Defence news, international relations, national security, sports, appointments.',
    'State PSC':    'State and national events, government schemes, appointments, sports.',
  }
  return patterns[exam] || 'Ask factual questions about real events matching exam pattern.'
}