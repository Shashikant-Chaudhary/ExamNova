// ─────────────────────────────────────────────
// newsService.js
// Fetches latest news using Tavily API
// Then passes to AI for question generation
// ─────────────────────────────────────────────

const TAVILY_KEY = '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'
const TAVILY_URL = 'https://api.tavily.com/search'

// ── TOPIC SEARCH QUERIES ───────────────────────
// Each topic has specific search terms for India
const TOPIC_QUERIES = {
  'Government Schemes & Policies': [
    'India government schemes policies 2025 2026',
    'PM Modi new scheme launch India 2025',
    'central government policy announcement India 2025 2026',
  ],
  'Sports & Games': [
    'India sports achievement 2025 2026',
    'Indian cricket hockey badminton 2025 2026 winner',
    'Olympics Commonwealth Games India 2025 2026',
  ],
  'Awards & Honours': [
    'India national awards padma bharat ratna 2025 2026',
    'Indian achievement international award 2025',
    'Nobel prize Booker prize Indian 2025 2026',
  ],
  'Science & Space': [
    'ISRO mission India space 2025 2026',
    'India science technology discovery 2025',
    'DRDO defence technology India 2025 2026',
  ],
  'Economy & Banking': [
    'RBI repo rate India economy 2025 2026',
    'India GDP budget finance 2025 2026',
    'Indian banking finance news 2025',
  ],
  'International Relations': [
    'India foreign relations summit 2025 2026',
    'India UN bilateral agreement 2025',
    'India China Pakistan relations 2025 2026',
  ],
  'Environment & Climate': [
    'India environment climate policy 2025 2026',
    'India renewable energy solar 2025',
    'India wildlife conservation 2025 2026',
  ],
  'Appointments & Elections': [
    'India important appointments 2025 2026',
    'India election results 2025 2026',
    'new governor chief minister India 2025',
  ],
  'Defence & Security': [
    'India defence military 2025 2026',
    'Indian army navy airforce 2025',
    'India defence deal weapon 2025 2026',
  ],
  'Art & Culture': [
    'India culture heritage UNESCO 2025 2026',
    'Indian festival event culture 2025',
    'India art literature 2025 2026',
  ],
}

// ── FETCH NEWS FROM TAVILY ─────────────────────
export async function fetchNews({ topic, year }) {
  try {
    const queries = TOPIC_QUERIES[topic] || [
      `India ${topic} news ${year}`,
    ]

    // pick one query randomly for variety
    const query = queries[Math.floor(Math.random() * queries.length)]

    // add year filter to query
    const finalQuery = `${query} ${year}`

    const response = await fetch(TAVILY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key:          TAVILY_KEY,
        query:            finalQuery,
        search_depth:     'advanced',
        include_answer:   true,
        include_raw_content: false,
        max_results:      8,
        include_domains:  [
          'timesofindia.com',
          'thehindu.com',
          'ndtv.com',
          'hindustantimes.com',
          'indianexpress.com',
          'pib.gov.in',
          'bbc.com',
          'reuters.com',
          'economictimes.indiatimes.com',
          'livemint.com',
        ]
      })
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err?.message || 'Tavily search failed')
    }

    const data = await response.json()

    // extract news content
    const articles = data.results || []
    const answer   = data.answer || ''

    // combine all content into one context string
    const context = [
      answer,
      ...articles.map(a => `${a.title}: ${a.content}`)
    ].filter(Boolean).join('\n\n')

    return context

  } catch (error) {
    console.error('News fetch error:', error)
    throw error
  }
}