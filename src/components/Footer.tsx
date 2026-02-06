export function Footer() {
  return (
    <footer className="border-t border-border-light dark:border-border-dark">
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <p className="text-sm text-muted dark:text-muted-dark">
          Jacky &amp; Dom &middot; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
