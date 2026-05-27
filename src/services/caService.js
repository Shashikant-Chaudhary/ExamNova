import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

const CA_CACHE_DAYS = 30  // refresh cache after 30 days

function caKey(exam, topic, year, language = 'english') {
  return `CA__${topic}__${year}__${language}`
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '_')
}

export async function loadCABank(exam, topic, year, language = 'english') {
  try {
    const key  = caKey(exam, topic, year, language)
    const snap = await getDoc(doc(db, 'caBank', key))
    if (!snap.exists()) return []
    const data = snap.data()
    // check if cache is stale
    const age = Date.now() - new Date(data.updatedAt).getTime()
    if (age > CA_CACHE_DAYS * 24 * 60 * 60 * 1000) return []
    return data.questions || []
  } catch (e) {
    return []
  }
}

export async function saveCABank(exam, topic, year, questions, language = 'english') {
  try {
    const key = caKey(exam, topic, year, language)
    const ref = doc(db, 'caBank', key)
    const snap = await getDoc(ref)
    const now = new Date().toISOString()
    if (snap.exists()) {
      await updateDoc(ref, { questions, count: questions.length, updatedAt: now })
    } else {
      await setDoc(ref, { topic, year, questions, count: questions.length, createdAt: now, updatedAt: now })
    }
    console.log(`✅ CA bank saved: ${questions.length} questions`)
  } catch (e) {
    console.error('CA bank save failed:', e)
    // Don't throw - allow app to continue even if caching fails
    // User can still use the questions in memory for this session
  }
}

export async function getCAQuestions({ exam, topic, year, count = 15, language = 'english', generateFn }) {
  // Step 1 — try cache
  const cached = await loadCABank(exam, topic, year, language)
  if (cached.length >= count) {
    console.log(`CA: serving ${count} from cache`)
    return cached.sort(() => Math.random() - 0.5).slice(0, count)
  }

  // Step 2 — cache miss → generate and save
  console.log(`CA: cache empty — generating...`)
  const generated = await generateFn({ exam, topic, year, count, language })
  await saveCABank(exam, topic, year, generated, language)
  return generated.slice(0, count)
}