import { Quote, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeading } from '@/components/marketing/section-heading'
import { TESTIMONIALS, TESTIMONIALS_SECTION } from '@/lib/marketing'

export function TestimonialsSection() {
  return (
    <section className="marketing-section bg-muted/30">
      <div className="container">
        <SectionHeading
          eyebrow={TESTIMONIALS_SECTION.eyebrow}
          title={TESTIMONIALS_SECTION.title}
          description={TESTIMONIALS_SECTION.description}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <Card
              key={item.author}
              className="marketing-card-hover relative overflow-hidden border-border/80"
            >
              <div
                className="absolute right-4 top-4 text-primary/15"
                aria-hidden
              >
                <Quote className="h-10 w-10" />
              </div>
              <CardContent className="relative pt-6">
                <div className="mb-4 flex gap-0.5 text-amber-500" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
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
