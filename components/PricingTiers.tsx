import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Icon } from '@/lib/icons'

export interface PricingTier {
  name: string
  price: string
  period: 'month' | 'year' | 'one-time'
  description: string
  features: string[]
  ctaLabel: string
  ctaHref: string
  highlighted?: boolean
  badge?: string
}

export interface PricingTiersProps {
  eyebrow?: string
  heading: string
  subhead?: string
  tiers: PricingTier[]
  className?: string
}

export function PricingTiers({
  eyebrow,
  heading,
  subhead,
  tiers,
  className,
}: PricingTiersProps) {
  const periodLabels = {
    month: '/mo',
    year: '/yr',
    'one-time': '',
  }

  return (
    <section className={cn('section-padding', className)}>
      <div className="container-wide">
        {/* Header */}
        <div className="mb-12 text-center md:mb-16">
          {eyebrow && (
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
              {eyebrow}
            </span>
          )}
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            {heading}
          </h2>
          {subhead && (
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {subhead}
            </p>
          )}
        </div>

        {/* Pricing Cards */}
        <div
          className={cn(
            'grid gap-8',
            tiers.length === 2 && 'mx-auto max-w-4xl md:grid-cols-2',
            tiers.length === 3 && 'lg:grid-cols-3',
            tiers.length >= 4 && 'md:grid-cols-2 lg:grid-cols-4'
          )}
        >
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={cn(
                'relative flex flex-col rounded-2xl border p-8',
                tier.highlighted
                  ? 'border-primary bg-primary/5 shadow-xl ring-2 ring-primary'
                  : 'border-border bg-background shadow-sm'
              )}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-primary px-4 py-1 text-sm font-semibold text-white">
                    {tier.badge}
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="mb-2 text-xl font-bold text-foreground">
                {tier.name}
              </h3>

              {/* Price */}
              <div className="mb-4">
                <span className="text-4xl font-bold text-foreground md:text-5xl">
                  {tier.price}
                </span>
                <span className="text-muted-foreground">
                  {periodLabels[tier.period]}
                </span>
              </div>

              {/* Description */}
              <p className="mb-6 text-muted-foreground">{tier.description}</p>

              {/* CTA Button */}
              <Link
                href={tier.ctaHref}
                className={cn(
                  'mb-8 block w-full rounded-lg py-3 text-center font-semibold transition-colors',
                  tier.highlighted
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                )}
              >
                {tier.ctaLabel}
              </Link>

              {/* Features */}
              <ul className="flex-1 space-y-3">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Icon
                      name="check"
                      className={cn(
                        'mt-0.5 h-5 w-5 flex-shrink-0',
                        tier.highlighted ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PricingTiers
