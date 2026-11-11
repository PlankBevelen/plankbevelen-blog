export function isPinned(value: unknown): boolean {
  return value === true
}

export function resolvePinFields(
  currentPinned: unknown,
  currentPinnedAt: Date | null | undefined,
  nextPinned: unknown,
  now: Date
): { pinned: boolean; pinnedAt: Date | null } {
  const wasPinned = isPinned(currentPinned)
  if (typeof nextPinned !== 'boolean') {
    return {
      pinned: wasPinned,
      pinnedAt: wasPinned ? currentPinnedAt ?? null : null
    }
  }
  if (nextPinned && !wasPinned) return { pinned: true, pinnedAt: now }
  if (!nextPinned) return { pinned: false, pinnedAt: null }
  return { pinned: true, pinnedAt: currentPinnedAt ?? now }
}

export const pinnedRankStage = {
  $addFields: {
    pinnedRank: { $cond: [{ $eq: ['$pinned', true] }, 1, 0] }
  }
}

export function sortPinnedFirst(rest: Record<string, -1 | 1>) {
  return { pinnedRank: -1, pinnedAt: -1, ...rest }
}
