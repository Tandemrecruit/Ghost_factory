import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Twitter, Facebook, Linkedin, Instagram, Youtube } from 'lucide-react'

export interface FooterLink {
  label: string
  href: string
}

export interface SocialLink {
  platform: 'twitter' | 'facebook' | 'linkedin' | 'instagram' | 'youtube'
  href: string
}

export interface FooterSimpleProps {
  companyName: string
  links?: FooterLink[]
  socialLinks?: SocialLink[]
  copyrightText?: string
  className?: string
}

const socialIcons = {
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
}

export function FooterSimple({
  companyName,
  links = [],
  socialLinks = [],
  copyrightText,
  className,
}: FooterSimpleProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={cn('border-t border-border bg-background', className)}>
      <div className="container-wide py-8 md:py-12">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          {/* Company Name & Copyright */}
          <div className="text-center md:text-left">
            <p className="font-semibold text-foreground">{companyName}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {copyrightText || `\u00A9 ${currentYear} ${companyName}. All rights reserved.`}
            </p>
          </div>

          {/* Links */}
          {links.length > 0 && (
            <nav className="flex flex-wrap justify-center gap-6">
              {links.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => {
                const Icon = socialIcons[social.platform]
                return (
                  <Link
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-white"
                    aria-label={`Follow on ${social.platform}`}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}

export default FooterSimple
