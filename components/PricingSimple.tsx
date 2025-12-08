import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Check, Shield } from 'lucide-react'

export interface PricingSimpleProps {
  eyebrow?: string
  heading: string
  price: string
  period: 'month' | 'year' | 'one-time'
  description?: string
  features: string[]
  ctaLabel: string
  ctaHref: string
  guaranteeText?: string
  className?: string
}

export function PricingSimple({
  eyebrow,
  heading,
  price,
  period,
  description,
  features,
  ctaLabel,
  ctaHref,
  guaranteeText,
  className,
}: PricingSimpleProps) {
  const periodLabel = {
    month: '/month',
    year: '/year',
    'one-time': ' one-time',
  }

  return (
    <section className={cn('section-padding', className)}>
      <div className="container-narrow">
        <div className="mx-auto max-w-lg rounded-2xl border border-border bg-background p-8 shadow-xl md:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            {eyebrow && (
              <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
                {eyebrow}
              </span>
            )}
            <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
              {heading}
            </h2>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>

          {/* Price */}
          <div className="mb-8 text-center">
            <span className="text-5xl font-bold text-foreground md:text-6xl">
              {price}
            </span>
            <span className="text-lg text-muted-foreground">
              {periodLabel[period]}
            </span>
          </div>

          {/* Features */}
          <ul className="mb-8 space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <span className="text-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            href={ctaHref}
            className="btn-primary block w-full text-center text-lg"
          >
            {ctaLabel}
          </Link>

          {/* Guarantee */}
          {guaranteeText && (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>{guaranteeText}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default PricingSimple
