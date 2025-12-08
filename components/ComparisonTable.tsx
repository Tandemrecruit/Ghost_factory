import { cn } from '@/lib/utils'
import { Icon } from '@/lib/icons'

export interface ComparisonFeature {
  name: string
  values: ('yes' | 'no' | 'partial' | string)[]
}

export interface ComparisonTableProps {
  eyebrow?: string
  heading: string
  subhead?: string
  columns: string[]
  features: ComparisonFeature[]
  highlightColumn?: number
  className?: string
}

export function ComparisonTable({
  eyebrow,
  heading,
  subhead,
  columns,
  features,
  highlightColumn,
  className,
}: ComparisonTableProps) {
  const renderValue = (value: string, isHighlighted: boolean) => {
    if (value === 'yes') {
      return (
        <Icon
          name="check"
          className={cn(
            'h-5 w-5',
            isHighlighted ? 'text-primary' : 'text-green-500'
          )}
        />
      )
    }
    if (value === 'no') {
      return <Icon name="x" className="h-5 w-5 text-muted-foreground/50" />
    }
    if (value === 'partial') {
      return <Icon name="minus" className="h-5 w-5 text-amber-500" />
    }
    return (
      <span
        className={cn(
          'text-sm',
          isHighlighted ? 'font-semibold text-foreground' : 'text-muted-foreground'
        )}
      >
        {value}
      </span>
    )
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            {/* Header Row */}
            <thead>
              <tr>
                <th className="border-b border-border p-4 text-left text-sm font-semibold text-muted-foreground">
                  Features
                </th>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={cn(
                      'border-b border-border p-4 text-center',
                      highlightColumn === index
                        ? 'bg-primary/5 text-primary'
                        : 'text-foreground'
                    )}
                  >
                    <span className="text-lg font-bold">{column}</span>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Feature Rows */}
            <tbody>
              {features.map((feature, featureIndex) => (
                <tr
                  key={featureIndex}
                  className={cn(
                    featureIndex % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'
                  )}
                >
                  <td className="border-b border-border/50 p-4 text-foreground">
                    {feature.name}
                  </td>
                  {feature.values.map((value, valueIndex) => (
                    <td
                      key={valueIndex}
                      className={cn(
                        'border-b border-border/50 p-4 text-center',
                        highlightColumn === valueIndex && 'bg-primary/5'
                      )}
                    >
                      <div className="flex items-center justify-center">
                        {renderValue(value, highlightColumn === valueIndex)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default ComparisonTable
