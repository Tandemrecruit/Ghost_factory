'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Icon } from '@/lib/icons'

export interface VideoEmbedProps {
  eyebrow?: string
  heading?: string
  subhead?: string
  thumbnailSrc: string
  thumbnailAlt: string
  videoUrl: string
  aspectRatio?: '16:9' | '4:3' | '1:1'
  className?: string
}

export function VideoEmbed({
  eyebrow,
  heading,
  subhead,
  thumbnailSrc,
  thumbnailAlt,
  videoUrl,
  aspectRatio = '16:9',
  className,
}: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const aspectRatioClasses = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
  }

  // Extract video ID and platform from URL
  const getEmbedUrl = (url: string): string => {
    // YouTube
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/
    )
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
    }

    // Return original URL if no match
    return url
  }

  return (
    <section className={cn('section-padding', className)}>
      <div className="container-medium">
        {/* Header */}
        {(eyebrow || heading || subhead) && (
          <div className="mb-8 text-center md:mb-12">
            {eyebrow && (
              <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
                {eyebrow}
              </span>
            )}
            {heading && (
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                {heading}
              </h2>
            )}
            {subhead && (
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                {subhead}
              </p>
            )}
          </div>
        )}

        {/* Video Container */}
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl shadow-xl',
            aspectRatioClasses[aspectRatio]
          )}
        >
          {isPlaying ? (
            <iframe
              src={getEmbedUrl(videoUrl)}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              {/* Thumbnail */}
              <Image
                src={thumbnailSrc}
                alt={thumbnailAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1024px"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30" />

              {/* Play Button */}
              <button
                onClick={() => setIsPlaying(true)}
                className="group absolute inset-0 flex items-center justify-center"
                aria-label="Play video"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-200 group-hover:scale-110">
                  <Icon name="play" className="ml-1 h-8 w-8 text-primary" />
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default VideoEmbed
