// ─────────────────────────────────────────────
// profileService.js
// Handles profile photo (base64), daily goal,
// streak history for heatmap, daily progress
// ─────────────────────────────────────────────

import { doc, getDoc, updateDoc, setDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from './firebase'
import { getActiveUser } from './authService'

function uid() {
  const user = getActiveUser()
  return user ? user.id : null
}


// ── DAILY GOAL ─────────────────────────────────
export function saveDailyGoal(goal) {
  localStorage.setItem('examai_daily_goal', String(goal))
}

export function getDailyGoal() {
  return parseInt(localStorage.getItem('examai_daily_goal') || '20', 10)
}

// ── PROFILE PHOTO ──────────────────────────────
// Compress image to 80x80 base64 using canvas
export function compressPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width  = 80
        canvas.height = 80
        const ctx = canvas.getContext('2d')
        // Crop to square from center
        const size = Math.min(img.width, img.height)
        const sx   = (img.width  - size) / 2
        const sy   = (img.height - size) / 2
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 80, 80)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function saveProfilePhoto(base64) {
  const userId = uid()
  if (!userId) return
  try {
    const ref = doc(db, 'users', userId)
    await updateDoc(ref, { photoBase64: base64 })
  } catch (e) {
    // doc might not exist — try setDoc
    try {
      await setDoc(doc(db, 'users', userId), { photoBase64: base64 }, { merge: true })
    } catch (e2) {
      console.error('saveProfilePhoto error:', e2)
    }
  }
}

export async function getProfilePhoto(userId) {
  try {
    const snap = await getDoc(doc(db, 'users', userId))
    return snap.exists() ? snap.data().photoBase64 || null : null
  } catch (e) {
    return null
  }
}

// ── DAILY PROGRESS ─────────────────────────────
// Count questions answered today from history
export async function getDailyProgress() {
  const userId = uid()
  if (!userId) return 0
  try {
    const today = new Date().toDateString()
    const snap  = await getDocs(collection(db, 'history', userId, 'tests'))
    const todayTests = snap.docs
      .map(d => d.data())
      .filter(t => new Date(t.date).toDateString() === today)
    // sum up total questions from today's tests
    return todayTests.reduce((sum, t) => sum + (t.total || 0), 0)
  } catch (e) {
    return 0
  }
}

// ── STREAK HISTORY FOR HEATMAP ─────────────────
// Returns map of { 'YYYY-MM-DD': questionsCount }
// for last 180 days — built from history collection
export async function getStreakHistory() {
  const userId = uid()
  if (!userId) return {}
  try {
    const snap = await getDocs(
      query(collection(db, 'history', userId, 'tests'), orderBy('date', 'desc'), limit(500))
    )
    const map = {}
    snap.docs.forEach(d => {
      const data    = d.data()
      const dateKey = new Date(data.date).toISOString().split('T')[0] // YYYY-MM-DD
      map[dateKey]  = (map[dateKey] || 0) + (data.total || 0)
    })
    return map
  } catch (e) {
    return {}
  }
}

// ── GET USER PROFILE DATA ──────────────────────
export async function getUserProfile() {
  const userId = uid()
  if (!userId) return null
  try {
    const snap = await getDoc(doc(db, 'users', userId))
    return snap.exists() ? snap.data() : null
  } catch (e) {
    return null
  }
}