import { cn } from '@/lib/utils'
import { Icon, type IconName } from '@/lib/icons'

export interface Stat {
  value: string
  label: string
  icon?: IconName
}

export interface StatsHighlightProps {
  eyebrow?: string
  heading?: string
  stats: Stat[]
  className?: string
}

export function StatsHighlight({
  eyebrow,
  heading,
  stats,
  className,
}: StatsHighlightProps) {
  return (
    <section className={cn('section-padding', className)}>
      <div className="container-wide">
        {/* Header */}
        {(eyebrow || heading) && (
          <div className="mb-12 text-center">
            {eyebrow && (
              <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
                {eyebrow}
              </span>
            )}
            {heading && (
              <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                {heading}
              </h2>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center"
            >
              {stat.icon && (
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Icon name={stat.icon} className="h-7 w-7 text-primary" />
                </div>
              )}
              <p className="text-4xl font-bold text-foreground md:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsHighlight
