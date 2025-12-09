'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

export interface Testimonial {
  quote: string
  name: string
  role: string
  company: string
  avatarSrc?: string
}

export interface TestimonialCardsProps {
  eyebrow?: string
  heading: string
  testimonials: Testimonial[]
  className?: string
}

export function TestimonialCards({
  eyebrow,
  heading,
  testimonials,
  className,
}: TestimonialCardsProps) {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }))
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
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex flex-col rounded-xl border border-border bg-background p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-accent text-accent"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="mb-6 flex-1 text-foreground">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                {testimonial.avatarSrc && !imageErrors[index] ? (
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    <Image
                      src={testimonial.avatarSrc}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                      onError={() => handleImageError(index)}
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                    {testimonial.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialCards
