// ─────────────────────────────────────────────
// leaderboardService.js
// Manages exam-wise cumulative points
// Collection: leaderboard/{examKey}/users/{userId}
// ─────────────────────────────────────────────

import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy, limit, increment } from 'firebase/firestore'
import { db }            from './firebase'
import { getActiveUser } from './authService'
import { calcPoints }    from '../data/pointsConfig'

// safe exam key for Firestore doc id
function examKey(exam) {
  return exam.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '_')
}

// ── ADD POINTS after mock test ─────────────────
export async function addMockPoints({ exam, percent, userName }) {
  try {
    const user = getActiveUser()
    if (!user) return null

    const pointRow = calcPoints(percent)
    const points   = pointRow.points
    const key      = examKey(exam)
    const ref      = doc(db, 'leaderboard', key, 'users', user.id)
    const snap     = await getDoc(ref)

    if (snap.exists()) {
      const existing = snap.data()
      await updateDoc(ref, {
        totalPoints: (existing.totalPoints || 0) + points,
        totalMocks:  (existing.totalMocks  || 0) + 1,
        bestScore:   Math.max(existing.bestScore || 0, percent),
        lastScore:   percent,
        lastUpdated: new Date().toISOString(),
        userName:    userName || existing.userName || 'Student',
      })
      return {
        points,
        totalPoints: (existing.totalPoints || 0) + points,
        pointRow,
      }
    } else {
      await setDoc(ref, {
        userId:      user.id,
        userName:    userName || 'Student',
        totalPoints: points,
        totalMocks:  1,
        bestScore:   percent,
        lastScore:   percent,
        lastUpdated: new Date().toISOString(),
        exam,
      })
      return { points, totalPoints: points, pointRow }
    }
  } catch (e) {
    console.error('addMockPoints error:', e)
    return null
  }
}

// ── GET LEADERBOARD for one exam ───────────────
export async function getLeaderboard(exam, limitCount = 100) {
  try {
    const key  = examKey(exam)
    const ref  = collection(db, 'leaderboard', key, 'users')
    const q    = query(ref, orderBy('totalPoints', 'desc'), limit(limitCount))
    const snap = await getDocs(q)
    return snap.docs.map((d, i) => ({
      rank: i + 1,
      ...d.data(),
      userId: d.id,
    }))
  } catch (e) {
    console.error('getLeaderboard error:', e)
    return []
  }
}

// ── GET MY RANK for one exam ───────────────────
export async function getMyRank(exam) {
  try {
    const user = getActiveUser()
    if (!user) return null

    const key     = examKey(exam)
    const ref     = doc(db, 'leaderboard', key, 'users', user.id)
    const snap    = await getDoc(ref)
    if (!snap.exists()) return null

    // get all scores to compute rank
    const all  = await getLeaderboard(exam, 500)
    const rank = all.findIndex(u => u.userId === user.id) + 1

    return {
      rank: rank || null,
      ...snap.data(),
    }
  } catch (e) {
    console.error('getMyRank error:', e)
    return null
  }
}