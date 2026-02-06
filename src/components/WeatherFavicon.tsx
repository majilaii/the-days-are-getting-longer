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

  const url = canvas.toDataURL('image/png')

  // Remove existing favicons
  const existing = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')
  existing.forEach((el) => el.remove())

  const link = document.createElement('link')
  link.rel = 'icon'
  link.type = 'image/png'
  link.href = url
  document.head.appendChild(link)
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
    // Fallback to time-based
    const hour = new Date().getHours()
    setFaviconEmoji(hour >= 6 && hour < 20 ? '☀️' : '🌙')
  }
}

export default function WeatherFavicon() {
  useEffect(() => {
    // Try geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeather(pos.coords.latitude, pos.coords.longitude)
        },
        () => {
          // Geolocation denied — fall back to time of day
          const hour = new Date().getHours()
          setFaviconEmoji(hour >= 6 && hour < 20 ? '☀️' : '🌙')
        },
        { timeout: 5000 }
      )
    } else {
      const hour = new Date().getHours()
      setFaviconEmoji(hour >= 6 && hour < 20 ? '☀️' : '🌙')
    }

    // Refresh every 15 minutes
    const interval = setInterval(() => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
          () => {}
        )
      }
    }, 15 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return null
}
