mport Link from 'next/link'
import { siteConfig } from '@/lib/site'

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Dashboard', href: '/#features' },
      { label: 'Desktop Preview', href: '/docs#desktop-preview' },
      { label: 'Proxy Mode', href: '/docs#proxy-mode' },
      { label: 'Budget Controls', href: '/#features' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Docs', href: '/docs' },
      { label: 'GitHub', href: siteConfig.github, external: true },
      { label: 'Waitlist', href: '/waitlist' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Privacy',
    links: [
      { label: 'No prompt storage', href: '/#privacy' },
      { label: 'Local-first', href: '/#privacy' },
      { label: 'SQLite ledger', href: '/#privacy' },
      { label: 'Opt-in sync', href: '/#privacy' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-[13px] font-bold text-background">
                C
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-foreground">
                {siteConfig.name}
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Built for developers who want to know the cost without exposing the work.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
              <ul className="mt-4 flex flex-col gap-3 text-sm">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Cost AI. Local-first by default.</span>
          <span className="font-mono">SQLite ledger · No prompt storage · Opt-in sync</span>
        </div>
      </div>
    </footer>
  )
}
