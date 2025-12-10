import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface CtaBannerProps {
  eyebrow?: string
  heading: string
  subhead?: string
  primaryCtaLabel: string
  primaryCtaHref: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  background?: 'primary' | 'dark' | 'gradient'
  /** Block ID for metrics tracking - defaults to 'cta_banner_v1' */
  blockId?: string
  className?: string
}

export function CtaBanner({
  eyebrow,
  heading,
  subhead,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  background = 'primary',
  blockId = 'cta_banner_v1',
  className,
}: CtaBannerProps) {
  const backgroundClasses = {
    primary: 'bg-primary',
    dark: 'bg-foreground',
    gradient: 'bg-gradient-to-r from-primary to-accent',
  }

  return (
    <section
      data-gf-block={blockId}
      className={cn(
        'py-16 md:py-20',
        backgroundClasses[background],
        className
      )}
    >
      <div className="container-wide">
        <div className="text-center">
          {eyebrow && (
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-white/80">
              {eyebrow}
            </span>
          )}
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            {heading}
          </h2>
          {subhead && (
            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
              {subhead}
            </p>
          )}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={primaryCtaHref}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 font-semibold text-primary shadow-lg transition-all duration-200 hover:bg-white/90"
              data-gf-cta="primary"
            >
              {primaryCtaLabel}
            </Link>
            {secondaryCtaLabel && secondaryCtaHref && (
              <Link
                href={secondaryCtaHref}
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 px-8 py-4 font-semibold text-white transition-all duration-200 hover:border-white hover:bg-white/10"
              >
                {secondaryCtaLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CtaBanner
