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
  /** Block ID for metrics tracking - defaults to 'hero_split_v1' */
  blockId?: string
  className?: string
}

/**
 * Renders a two-column hero section with heading, subhead, primary CTA, and an image, allowing the image to appear on the left or right.
 *
 * @param heading - Main heading text displayed prominently.
 * @param subhead - Supporting paragraph text shown below the heading.
 * @param imageSrc - URL or path to the hero image.
 * @param imageAlt - Alt text for the hero image for accessibility.
 * @param primaryCtaLabel - Text for the primary call-to-action button.
 * @param primaryCtaHref - Destination URL for the primary call-to-action.
 * @param imagePosition - Placement of the image; `"right"` (default) or `"left"` which reorders columns on large screens.
 * @param blockId - Optional block identifier added to the section's `data-gf-block` attribute for metrics (defaults to `"hero_split_v1"`).
 * @param className - Optional additional CSS class names applied to the top-level section.
 * @returns A section element containing the hero layout with responsive text and image columns.
 */
export function HeroSplit({
  heading,
  subhead,
  imageSrc,
  imageAlt,
  primaryCtaLabel,
  primaryCtaHref,
  imagePosition = 'right',
  blockId = 'hero_split_v1',
  className,
}: HeroSplitProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <section data-gf-block={blockId} className={cn('py-16 md:py-20 lg:py-24', className)}>
      <div className="container-wide">
        <div
          className={cn(
            'grid items-center gap-8 lg:grid-cols-2 lg:gap-12',
            imagePosition === 'left' && 'lg:[&>*:first-child]:order-2'
          )}
        >
          {/* Content */}
          <div className="flex flex-col items-start">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              {heading}
            </h1>
            <p className="mb-8 max-w-xl text-lg text-slate-700 md:text-xl">
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