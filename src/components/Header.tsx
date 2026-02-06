import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import { DaylightTitle } from './DaylightTitle'

export function Header() {
  const currentYear = new Date().getFullYear()

  return (
    <header className="border-b border-border-light dark:border-border-dark">
      <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="font-typewriter text-sm text-ink dark:text-ink-light tracking-tight hover:text-accent dark:hover:text-accent-light transition-colors"
        >
          <DaylightTitle />
        </Link>
        <nav className="flex items-center gap-8">
          <Link
            href="/journal"
            className="text-sm text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-light transition-colors"
          >
            Journal
          </Link>
          <Link
            href={`/${currentYear}`}
            className="text-sm text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-light transition-colors"
          >
            {currentYear}
          </Link>
          <Link
            href="/about"
            className="text-sm text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-light transition-colors"
          >
            About
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
