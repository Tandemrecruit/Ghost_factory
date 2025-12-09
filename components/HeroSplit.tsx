'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface HeroSplitProps {
  heading: string
  subhead: string
  imageSrc: string
  imageAlt: string
  primaryCtaLabel: string
  primaryCtaHref: string
  imagePosition?: 'left' | 'right'
  className?: string
}

export function HeroSplit({
  heading,
  subhead,
  imageSrc,
  imageAlt,
  primaryCtaLabel,
  primaryCtaHref,
  imagePosition = 'right',
  className,
}: HeroSplitProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <section className={cn('py-16 md:py-20 lg:py-24', className)}>
      <div className="container-wide">
        <div
          className={cn(
            'grid items-center gap-8 lg:grid-cols-2 lg:gap-12',
            imagePosition === 'left' && 'lg:[&>*:first-child]:order-2'
          )}
        >
          {/* Content */}
          <div className="flex flex-col items-start">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {heading}
            </h1>
            <p className="mb-8 max-w-xl text-lg text-muted-foreground md:text-xl">
              {subhead}
            </p>
            <Link
              href={primaryCtaHref}
              className="btn-primary inline-flex items-center gap-2 text-lg"
            >
              {primaryCtaLabel}
            </Link>
          </div>

          {/* Image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl lg:aspect-[4/3]">
            {!imageError ? (
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                <span className="text-sm">Image unavailable</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSplit
