import { cn } from '@/lib/utils'
import { Icon, type IconName } from '@/lib/icons'

export interface FeatureGridItem {
  title: string
  description: string
  icon: IconName
}

export interface FeatureGridProps {
  eyebrow?: string
  heading: string
  subhead?: string
  features: FeatureGridItem[]
  columns?: 2 | 3 | 4
  className?: string
}

export function FeatureGrid({
  eyebrow,
  heading,
  subhead,
  features,
  columns = 3,
  className,
}: FeatureGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
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

        {/* Features Grid */}
        <div className={cn('grid gap-8', gridCols[columns])}>
          {features.map((feature, index) => (
            <div
              key={index}
              className="group rounded-xl border border-border bg-background p-6 transition-all duration-200 hover:border-primary/50 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <Icon name={feature.icon} className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeatureGrid
