import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Icon, type IconName } from '@/lib/icons'

export interface TeamMember {
  name: string
  role: string
  bio?: string
  imageSrc?: string
  socialLinks?: {
    platform: 'twitter' | 'linkedin' | 'instagram'
    href: string
  }[]
}

export interface TeamGridProps {
  eyebrow?: string
  heading: string
  subhead?: string
  members: TeamMember[]
  columns?: 2 | 3 | 4
  className?: string
}

export function TeamGrid({
  eyebrow,
  heading,
  subhead,
  members,
  columns = 3,
  className,
}: TeamGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }

  const platformIcons: Record<string, IconName> = {
    twitter: 'twitter',
    linkedin: 'linkedin',
    instagram: 'instagram',
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
          {subhead && (
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {subhead}
            </p>
          )}
        </div>

        {/* Team Grid */}
        <div className={cn('grid gap-8', gridCols[columns])}>
          {members.map((member, index) => (
            <div
              key={index}
              className="group text-center"
            >
              {/* Avatar */}
              <div className="relative mx-auto mb-4 h-40 w-40 overflow-hidden rounded-full">
                {member.imageSrc ? (
                  <Image
                    src={member.imageSrc}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="160px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-4xl font-bold text-primary">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <h3 className="mb-1 text-xl font-semibold text-foreground">
                {member.name}
              </h3>
              <p className="mb-2 text-sm font-medium text-primary">{member.role}</p>
              {member.bio && (
                <p className="mb-4 text-sm text-muted-foreground">{member.bio}</p>
              )}

              {/* Social Links */}
              {member.socialLinks && member.socialLinks.length > 0 && (
                <div className="flex justify-center gap-3">
                  {member.socialLinks.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-white"
                    >
                      <Icon name={platformIcons[link.platform]} className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TeamGrid
