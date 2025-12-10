import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface HeroSimpleProps {
  heading: string
  subhead: string
  primaryCtaLabel: string
  primaryCtaHref: string
  /** Block ID for metrics tracking - defaults to 'hero_simple_v1' */
  blockId?: string
  className?: string
}

/**
 * Render a centered hero section with a heading, subhead, and a primary call-to-action.
 *
 * @param blockId - Optional identifier injected as `data-gf-block` on the root section for metrics/tracking (defaults to `"hero_simple_v1"`).
 * @returns A JSX element containing the hero section markup.
 */
export function HeroSimple({
  heading,
  subhead,
  primaryCtaLabel,
  primaryCtaHref,
  blockId = 'hero_simple_v1',
  className,
}: HeroSimpleProps) {
  return (
    <section
      data-gf-block={blockId}
      className={cn(
        'flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center',
        className
      )}
    >
      <div className="container-medium">
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          {heading}
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
          {subhead}
        </p>
        <Link
          href={primaryCtaHref}
          className="btn-primary inline-flex items-center gap-2 text-lg"
          data-gf-cta="primary"
        >
          {primaryCtaLabel}
        </Link>
      </div>
    </section>
  )
}

export default HeroSimple