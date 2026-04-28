/**
 * Shared priority visual configuration used across TaskCard, TaskDetailModal, etc.
 */
export const priorityConfig = {
  High: {
    border: 'border-l-red-500',
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    dot: 'bg-red-500',
    glow: 'shadow-red-500/10',
    label: 'High – Sangat mendesak',
    emoji: '🔴',
  },
  Medium: {
    border: 'border-l-amber-400',
    badge: 'bg-amber-400/15 text-amber-400 border-amber-400/30',
    dot: 'bg-amber-400',
    glow: 'shadow-amber-400/10',
    label: 'Medium – Perlu diperhatikan',
    emoji: '🟡',
  },
  Low: {
    border: 'border-l-blue-400',
    badge: 'bg-blue-400/15 text-blue-400 border-blue-400/30',
    dot: 'bg-blue-400',
    glow: 'shadow-blue-400/10',
    label: 'Low – Tidak mendesak',
    emoji: '🔵',
  },
}

export const priorityEmoji = { Low: '🔵', Medium: '🟡', High: '🔴' }
export const priorityDesc  = { Low: 'Tidak mendesak', Medium: 'Perlu diperhatikan', High: 'Sangat mendesak' }
