import { cn } from '@/lib/utils'

export interface FeatureStep {
  stepNumber: string
  title: string
  description: string
}

export interface FeatureStepsProps {
  eyebrow?: string
  heading: string
  subhead?: string
  steps: FeatureStep[]
  className?: string
}

export function FeatureSteps({
  eyebrow,
  heading,
  subhead,
  steps,
  className,
}: FeatureStepsProps) {
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

        {/* Steps */}
        <div className="relative">
          {/* Connector Line (hidden on mobile) */}
          <div className="absolute left-8 top-0 hidden h-full w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent md:left-1/2 md:block md:-translate-x-1/2" />

          <div className="space-y-8 md:space-y-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  'relative flex flex-col gap-4 md:flex-row md:items-center md:gap-8',
                  index % 2 === 1 && 'md:flex-row-reverse'
                )}
              >
                {/* Step Number */}
                <div className="flex md:w-1/2 md:justify-center">
                  <div className="relative z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-4 border-background bg-primary text-2xl font-bold text-white shadow-lg">
                    {step.stepNumber}
                  </div>
                </div>

                {/* Content */}
                <div
                  className={cn(
                    'flex-1 rounded-xl border border-border bg-background p-6 shadow-sm md:w-1/2',
                    index % 2 === 0 ? 'md:text-left' : 'md:text-right'
                  )}
                >
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeatureSteps
