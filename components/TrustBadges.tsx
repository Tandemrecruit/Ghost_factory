import { cn } from '@/lib/utils'
import { Icon, type IconName } from '@/lib/icons'

export interface TrustBadge {
  icon: IconName
  label: string
}

export interface TrustBadgesProps {
  heading?: string
  badges: TrustBadge[]
  className?: string
}

export function TrustBadges({
  heading,
  badges,
  className,
}: TrustBadgesProps) {
  return (
    <section className={cn('py-8 md:py-12', className)}>
      <div className="container-wide">
        {heading && (
          <p className="mb-6 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {heading}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Icon name={badge.icon} className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustBadges
