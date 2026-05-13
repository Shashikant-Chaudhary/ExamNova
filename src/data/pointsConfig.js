// ─────────────────────────────────────────────
// pointsConfig.js
// Points awarded per mock test based on score %
// Cumulative per exam — each mock adds points
// ─────────────────────────────────────────────

export const POINTS_TABLE = [
  { min: 90, max: 100, points: 10, label: 'Outstanding', color: '#F59E0B', emoji: '🏆' },
  { min: 80, max: 89,  points: 8,  label: 'Excellent',   color: '#10B981', emoji: '🥇' },
  { min: 70, max: 79,  points: 6,  label: 'Very Good',   color: '#3B82F6', emoji: '🥈' },
  { min: 60, max: 69,  points: 4,  label: 'Good',        color: '#8B5CF6', emoji: '🥉' },
  { min: 50, max: 59,  points: 2,  label: 'Average',     color: '#F97316', emoji: '📚' },
  { min: 0,  max: 49,  points: 1,  label: 'Attempted',   color: '#6B7280', emoji: '✍️' },
]

export function calcPoints(percent) {
  const row = POINTS_TABLE.find(r => percent >= r.min && percent <= r.max)
  return row || POINTS_TABLE[POINTS_TABLE.length - 1]
}

// Rank badge based on total cumulative points
export const RANK_BADGES = [
  { min: 100, label: 'Grandmaster', icon: '👑', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  { min: 60,  label: 'Expert',      icon: '💎', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  { min: 30,  label: 'Pro',         icon: '⚡', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
  { min: 10,  label: 'Rising Star', icon: '🌟', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  { min: 0,   label: 'Beginner',    icon: '🎯', color: '#6B7280', bg: 'rgba(107,114,128,0.15)' },
]

export function getRankBadge(totalPoints) {
  return RANK_BADGES.find(r => totalPoints >= r.min) || RANK_BADGES[RANK_BADGES.length - 1]
}