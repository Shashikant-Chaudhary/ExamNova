// ─────────────────────────────────────────────
// bookmarkService.js
// Save/load/delete bookmarked questions
// Stored in Firestore: bookmarks/{userId}/questions/{id}
// ─────────────────────────────────────────────

import {
  doc, setDoc, deleteDoc, getDocs,
  collection, query, orderBy,
} from 'firebase/firestore'
import { db } from './firebase'
import { getActiveUser } from './authService'

function uid() {
  const user = getActiveUser()
  return user ? user.id : null
}

// ── SAVE BOOKMARK ──────────────────────────────
export async function saveBookmark(question, meta) {
  const userId = uid()
  if (!userId) return
  try {
    const id  = `bm_${Date.now()}`
    const ref = doc(db, 'bookmarks', userId, 'questions', id)
    await setDoc(ref, {
      id,
      question:    question.question,
      options:     question.options   || [],
      correct:     question.correct   ?? 0,
      explanation: question.explanation || '',
      subtopic:    question.subtopic  || meta.topic || '',
      exam:        meta.exam          || '',
      topic:       meta.topic         || '',
      level:       meta.level         || '',
      language:    meta.language      || 'english',
      savedAt:     new Date().toISOString(),
    })
    return id
  } catch (e) {
    console.error('saveBookmark error:', e)
  }
}

// ── REMOVE BOOKMARK ────────────────────────────
export async function removeBookmark(bookmarkId) {
  const userId = uid()
  if (!userId) return
  try {
    await deleteDoc(doc(db, 'bookmarks', userId, 'questions', bookmarkId))
  } catch (e) {
    console.error('removeBookmark error:', e)
  }
}

// ── GET ALL BOOKMARKS ──────────────────────────
export async function getBookmarks() {
  const userId = uid()
  if (!userId) return []
  try {
    const snap = await getDocs(
  collection(db, 'bookmarks', userId, 'questions')
)
    return snap.docs
  .map(d => ({ id: d.id, ...d.data() }))
  .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
  } catch (e) {
    console.error('getBookmarks error:', e)
    return []
  }
}

// ── CHECK IF BOOKMARKED ────────────────────────
// Returns bookmarkId if bookmarked, null otherwise
export async function checkBookmark(questionText) {
  const userId = uid()
  if (!userId) return null
  try {
    const snap = await getDocs(collection(db, 'bookmarks', userId, 'questions'))
    const match = snap.docs.find(d => d.data().question === questionText)
    return match ? match.id : null
  } catch (e) {
    return null
  }
}