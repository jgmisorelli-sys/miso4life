export function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function todayIsoDate(): string {
  return startOfToday().toISOString().slice(0, 10)
}
