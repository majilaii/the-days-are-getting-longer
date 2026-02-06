import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import WeatherFavicon from '@/components/WeatherFavicon'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Journal',
    template: '%s',
  },
  description: 'A shared journal by Jacky and Dom.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} antialiased`}
      >
        <WeatherFavicon />
        {children}
      </body>
    </html>
  )
}
