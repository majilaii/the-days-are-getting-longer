'use client'

import { useEffect } from 'react'

// Open-Meteo WMO weather codes → emoji
function weatherEmoji(code: number, isDay: boolean): string {
  // Night + clear/partly cloudy → moon
  if (!isDay && code <= 3) {
    if (code === 0) return '🌙'
    return '☁️'
  }

  if (code === 0) return '☀️'                    // Clear sky
  if (code <= 3) return '⛅'                      // Partly cloudy
  if (code <= 48) return '🌫️'                    // Fog
  if (code <= 57) return '🌧️'                    // Drizzle
  if (code <= 67) return '🌧️'                    // Rain
  if (code <= 77) return '❄️'                     // Snow
  if (code <= 82) return '🌦️'                    // Rain showers
  if (code <= 86) return '🌨️'                    // Snow showers
  if (code <= 99) return '⛈️'                     // Thunderstorm

  return isDay ? '☀️' : '🌙'
}

function setFavicon(href: string, type = 'image/png') {
  // Remove existing favicons
  const existing = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')
  existing.forEach((el) => el.remove())

  const link = document.createElement('link')
  link.rel = 'icon'
  link.type = type
  link.href = href
  document.head.appendChild(link)
}

function setFaviconEmoji(emoji: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.font = '56px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, 32, 36)

  setFavicon(canvas.toDataURL('image/png'))
}

/** Use the static photo favicon (the summery green default) */
function setFaviconPhoto() {
  setFavicon('/icon.png')
}

async function fetchWeather(lat: number, lon: number) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,is_day`
    )
    const data = await res.json()
    const code: number = data.current.weather_code
    const isDay: boolean = data.current.is_day === 1
    setFaviconEmoji(weatherEmoji(code, isDay))
  } catch {
    // Weather fetch failed — use the photo fallback
    setFaviconPhoto()
  }
}

const LOCATION_KEY = 'weather-favicon-loc'
const LOCATION_DENIED_KEY = 'weather-favicon-denied'

/** Get cached location or null */
function getCachedLocation(): { lat: number; lon: number } | null {
  try {
    const raw = localStorage.getItem(LOCATION_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function cacheLocation(lat: number, lon: number) {
  try {
    localStorage.setItem(LOCATION_KEY, JSON.stringify({ lat, lon }))
  } catch {}
}

function wasLocationDenied(): boolean {
  try {
    return localStorage.getItem(LOCATION_DENIED_KEY) === '1'
  } catch {
    return false
  }
}

function markLocationDenied() {
  try {
    localStorage.setItem(LOCATION_DENIED_KEY, '1')
  } catch {}
}

export default function WeatherFavicon() {
  useEffect(() => {
    // If user already denied, just use the photo and don't ask again
    if (wasLocationDenied()) {
      setFaviconPhoto()
      return
    }

    // If we have a cached location, use it immediately (no prompt)
    const cached = getCachedLocation()
    if (cached) {
      fetchWeather(cached.lat, cached.lon)

      // Silently refresh location in the background for next time
      // (this won't prompt — permissions API remembers the grant)
      navigator.geolocation?.getCurrentPosition(
        (pos) => cacheLocation(pos.coords.latitude, pos.coords.longitude),
        () => {}
      )
      return
    }

    // First visit — ask once
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          cacheLocation(pos.coords.latitude, pos.coords.longitude)
          fetchWeather(pos.coords.latitude, pos.coords.longitude)
        },
        () => {
          // User denied — remember it, never ask again
          markLocationDenied()
          setFaviconPhoto()
        },
        { timeout: 5000 }
      )
    } else {
      setFaviconPhoto()
    }
  }, [])

  return null
}
