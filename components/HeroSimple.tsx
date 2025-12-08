import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface HeroSimpleProps {
  heading: string
  subhead: string
  primaryCtaLabel: string
  primaryCtaHref: string
  className?: string
}

export function HeroSimple({
  heading,
  subhead,
  primaryCtaLabel,
  primaryCtaHref,
  className,
}: HeroSimpleProps) {
  return (
    <section
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
        >
          {primaryCtaLabel}
        </Link>
      </div>
    </section>
  )
}

export default HeroSimple
