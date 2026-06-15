import { LOGO_CLOUD, LOGO_CLOUD_TAGLINE } from '@/lib/marketing'

export function LogoCloud() {
  return (
    <section className="border-b border-border/60 py-14">
      <div className="container">
        <p className="mb-10 text-center text-sm font-medium text-muted-foreground">
          {LOGO_CLOUD_TAGLINE}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {LOGO_CLOUD.map((name) => (
            <div
              key={name}
              className="flex h-10 items-center justify-center rounded-lg border border-border/60 bg-card/50 px-5 text-sm font-semibold tracking-wide text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
