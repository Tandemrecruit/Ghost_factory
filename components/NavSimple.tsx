'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Icon } from '@/lib/icons'

export interface NavLink {
  label: string
  href: string
}

export interface NavSimpleProps {
  logoSrc?: string
  logoAlt?: string
  links: NavLink[]
  ctaLabel?: string
  ctaHref?: string
  className?: string
}

export function NavSimple({
  logoSrc,
  logoAlt = 'Logo',
  links,
  ctaLabel,
  ctaHref,
  className,
}: NavSimpleProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <header className={cn('border-b border-border bg-background', className)}>
      <nav className="container-wide">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            {logoSrc && !imageError ? (
              <Image
                src={logoSrc}
                alt={logoAlt}
                width={140}
                height={40}
                className="h-8 w-auto md:h-10"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-xl font-bold text-foreground">
                {logoAlt}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {links.map((link, index) => {
              const isHashLink = link.href.startsWith('#')
              const Component = isHashLink ? 'a' : Link
              const props = isHashLink
                ? {
                    href: link.href,
                    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault()
                      const element = document.querySelector(link.href)
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    },
                  }
                : { href: link.href }
              return (
                <Component
                  key={index}
                  {...props}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Component>
              )
            })}
            {ctaLabel && ctaHref && (
              <Link href={ctaHref} className="btn-primary text-sm">
                {ctaLabel}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <Icon name="x" className="h-6 w-6" />
            ) : (
              <Icon name="menu" className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-200 md:hidden',
            isMobileMenuOpen ? 'max-h-96 pb-6' : 'max-h-0'
          )}
        >
          <div className="flex flex-col gap-4 pt-4">
            {links.map((link, index) => {
              const isHashLink = link.href.startsWith('#')
              const Component = isHashLink ? 'a' : Link
              const props = isHashLink
                ? {
                    href: link.href,
                    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault()
                      setIsMobileMenuOpen(false)
                      const element = document.querySelector(link.href)
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    },
                  }
                : {
                    href: link.href,
                    onClick: () => setIsMobileMenuOpen(false),
                  }
              return (
                <Component
                  key={index}
                  {...props}
                  className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Component>
              )
            })}
            {ctaLabel && ctaHref && (
              <Link
                href={ctaHref}
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-primary mt-2 text-center"
              >
                {ctaLabel}
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default NavSimple
