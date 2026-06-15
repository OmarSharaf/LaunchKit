import { Card, CardContent } from '@/components/ui/card'
import { SectionHeading } from '@/components/marketing/section-heading'
import { TESTIMONIALS, TESTIMONIALS_SECTION } from '@/lib/marketing'

export function TestimonialsSection() {
  return (
    <section className="border-b border-border bg-muted/30 py-20 md:py-28">
      <div className="container">
        <SectionHeading
          eyebrow={TESTIMONIALS_SECTION.eyebrow}
          title={TESTIMONIALS_SECTION.title}
          description={TESTIMONIALS_SECTION.description}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <Card key={item.author} className="border-border/80">
              <CardContent className="pt-6">
                <blockquote className="text-sm leading-relaxed text-foreground">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <footer className="mt-6 border-t border-border pt-4">
                  <p className="text-sm font-semibold">{item.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.role}, {item.company}
                  </p>
                </footer>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
