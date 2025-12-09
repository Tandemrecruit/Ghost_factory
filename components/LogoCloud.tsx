'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface Logo {
  name: string
  src: string
  href?: string
}

export interface LogoCloudProps {
  eyebrow?: string
  heading?: string
  logos: Logo[]
  grayscale?: boolean
  className?: string
}

export function LogoCloud({
  eyebrow,
  heading,
  logos,
  grayscale = true,
  className,
}: LogoCloudProps) {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }))
  }

  return (
    <section className={cn('section-padding-sm', className)}>
      <div className="container-wide">
        {/* Header */}
        {(eyebrow || heading) && (
          <div className="mb-8 text-center md:mb-12">
            {eyebrow && (
              <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
                {eyebrow}
              </span>
            )}
            {heading && (
              <h2 className="text-xl font-semibold text-muted-foreground md:text-2xl">
                {heading}
              </h2>
            )}
          </div>
        )}

        {/* Logo Grid */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
          {logos.map((logo, index) => {
            if (imageErrors[index]) {
              return (
                <div
                  key={index}
                  className={cn(
                    'flex h-8 w-24 items-center justify-center text-xs text-muted-foreground md:h-10 md:w-32'
                  )}
                >
                  {logo.name}
                </div>
              )
            }

            const logoImage = (
              <div
                className={cn(
                  'relative h-8 w-24 transition-all duration-200 md:h-10 md:w-32',
                  grayscale && 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                )}
              >
                <Image
                  src={logo.src}
                  alt={logo.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 96px, 128px"
                  onError={() => handleImageError(index)}
                />
              </div>
            )

            if (logo.href) {
              return (
                <a
                  key={index}
                  href={logo.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {logoImage}
                </a>
              )
            }

            return <div key={index}>{logoImage}</div>
          })}
        </div>
      </div>
    </section>
  )
}

export default LogoCloud
