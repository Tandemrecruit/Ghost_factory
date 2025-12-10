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
  /** Block ID for metrics tracking - defaults to 'pricing_simple_v1' */
  blockId?: string
  className?: string
}

/**
 * Render a centered pricing card with a heading, price, feature list, and a primary call-to-action.
 *
 * Renders optional eyebrow text, description, and guarantee text when provided. The component sets a
 * data-gf-block attribute on the root section using `blockId` to support metrics/analytics hooks.
 *
 * @param period - One of `"month"`, `"year"`, or `"one-time"`; determines the period label shown next to the price.
 * @param features - An array of feature description strings to render as the feature list.
 * @param blockId - Optional block identifier injected into the root element as `data-gf-block`; defaults to `"pricing_simple_v1"`.
 * @param className - Optional additional CSS classes applied to the root section.
 * @returns The pricing card React element.
 */
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
  blockId = 'pricing_simple_v1',
  className,
}: PricingSimpleProps) {
  const periodLabel = {
    month: '/month',
    year: '/year',
    'one-time': ' one-time',
  }

  return (
    <section data-gf-block={blockId} className={cn('section-padding', className)}>
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
            data-gf-cta="primary"
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