/**
 * Daylight calculation for London (latitude 51.5074)
 * Uses the sunrise equation to compute daily daylight duration.
 */

const LONDON_LAT = 51.5074

function toRadians(deg: number): number {
  return deg * (Math.PI / 180)
}

function toDegrees(rad: number): number {
  return rad * (180 / Math.PI)
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * Calculate daylight duration in minutes for a given date and latitude.
 * Uses the standard zenith of 90.833° to account for atmospheric refraction
 * (~34 arcmin) and solar semi-diameter (~16 arcmin), matching official
 * sunrise/sunset times to within a few minutes.
 */
export function calculateDaylightMinutes(
  date: Date,
  latitude: number = LONDON_LAT
): number {
  const dayOfYear = getDayOfYear(date)

  // Solar declination angle
  const declination = toRadians(
    -23.45 * Math.cos(toRadians((360 / 365) * (dayOfYear + 10)))
  )

  // Hour angle at sunrise/sunset using official zenith (90.833°)
  const latRad = toRadians(latitude)
  const cosHourAngle =
    (Math.cos(toRadians(90.833)) - Math.sin(latRad) * Math.sin(declination)) /
    (Math.cos(latRad) * Math.cos(declination))

  // Clamp for extreme latitudes
  if (cosHourAngle < -1) return 24 * 60 // midnight sun
  if (cosHourAngle > 1) return 0 // polar night

  const hourAngle = toDegrees(Math.acos(cosHourAngle))

  // Daylight duration in minutes
  return (2 * hourAngle) / 15 * 60
}

function formatDaylight(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)
  return `${hours}h ${minutes}m`
}

function isNearSummerSolstice(date: Date): boolean {
  const m = date.getMonth()
  const d = date.getDate()
  return m === 5 && d >= 20 && d <= 22
}

function isNearWinterSolstice(date: Date): boolean {
  const m = date.getMonth()
  const d = date.getDate()
  return m === 11 && d >= 20 && d <= 23
}

/**
 * Full daylight phrase for display in the header.
 * e.g. "10h 42m of light -- getting longer"
 */
export function getDaylightPhrase(date: Date = new Date()): string {
  const todayMinutes = calculateDaylightMinutes(date)
  const formatted = formatDaylight(todayMinutes)

  if (isNearSummerSolstice(date)) {
    return `${formatted} of light - the longest day`
  }

  if (isNearWinterSolstice(date)) {
    return `${formatted} of light - the shortest day`
  }

  const yesterday = new Date(date)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayMinutes = calculateDaylightMinutes(yesterday)

  const direction =
    todayMinutes >= yesterdayMinutes ? 'the day is getting longer' :  'the day is getting shorter'

  return `${formatted} of light - ${direction}`
}

/**
 * Just the directional phrase, for metadata.
 * e.g. "the days are getting longer"
 */
export function getDaylightDirection(date: Date = new Date()): string {
  if (isNearSummerSolstice(date)) return 'the longest day'
  if (isNearWinterSolstice(date)) return 'the shortest day'

  const todayMinutes = calculateDaylightMinutes(date)
  const yesterday = new Date(date)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayMinutes = calculateDaylightMinutes(yesterday)

  return todayMinutes >= yesterdayMinutes
    ? 'the days are getting longer'
    : 'the days are getting shorter'
}
