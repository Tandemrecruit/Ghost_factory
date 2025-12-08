import { cn } from '@/lib/utils'
import { Icon, type IconName } from '@/lib/icons'

export interface GuaranteeBlockProps {
  heading: string
  description: string
  badgeText?: string
  icon?: IconName
  className?: string
}

export function GuaranteeBlock({
  heading,
  description,
  badgeText,
  icon = 'shield',
  className,
}: GuaranteeBlockProps) {
  return (
    <section className={cn('section-padding', className)}>
      <div className="container-narrow">
        <div className="flex flex-col items-center rounded-2xl border-2 border-primary/20 bg-primary/5 p-8 text-center md:p-12">
          {/* Icon */}
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Icon name={icon} className="h-10 w-10 text-primary" />
          </div>

          {/* Badge */}
          {badgeText && (
            <span className="mb-4 inline-block rounded-full bg-primary px-4 py-1 text-sm font-semibold text-white">
              {badgeText}
            </span>
          )}

          {/* Heading */}
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
            {heading}
          </h2>

          {/* Description */}
          <p className="max-w-xl text-lg text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </section>
  )
}

export default GuaranteeBlock
