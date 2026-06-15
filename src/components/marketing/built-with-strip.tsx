import Link from 'next/link'
import { BUILT_WITH } from '@/lib/marketing-content'
import { Badge } from '@/components/ui/badge'

export function BuiltWithStrip() {
  return (
    <section
      aria-label="Built with"
      className="border-b border-border bg-muted/30 py-6"
    >
      <div className="container flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="secondary" className="font-normal">
            100% TypeScript
          </Badge>
          <Badge variant="secondary" className="font-normal">
            MIT License
          </Badge>
          <Badge variant="secondary" className="font-normal">
            Production-ready
          </Badge>
        </div>
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {BUILT_WITH.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
