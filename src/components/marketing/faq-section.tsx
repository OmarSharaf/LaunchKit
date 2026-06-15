'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { SectionHeading } from '@/components/marketing/section-heading'
import { FAQ_ITEMS } from '@/lib/marketing'
import { cn } from '@/lib/utils'

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="marketing-section">
      <div className="container">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="For builders forking the repo and for teams evaluating the live demo before signup."
        />

        <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-2">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index
            const panelId = `faq-panel-${index}`
            return (
              <div
                key={item.question}
                className={cn(
                  'rounded-xl border bg-card transition-colors',
                  isOpen
                    ? 'border-primary/30 shadow-md shadow-primary/5'
                    : 'border-border hover:border-border/80'
                )}
              >
                <button
                  type="button"
                  id={`faq-trigger-${index}`}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left text-sm font-medium"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <span className="pr-2">{item.question}</span>
                  <ChevronDown
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300',
                      isOpen && 'rotate-180 text-primary'
                    )}
                    aria-hidden
                  />
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={`faq-trigger-${index}`}
                  className={cn(
                    'grid transition-[grid-template-rows] duration-300 ease-out',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
