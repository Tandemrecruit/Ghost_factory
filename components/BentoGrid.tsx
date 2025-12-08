import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Icon, type IconName } from '@/lib/icons'

export interface BentoItem {
  title: string
  description: string
  icon?: IconName
  imageSrc?: string
  imageAlt?: string
  size?: 'small' | 'medium' | 'large'
}

export interface BentoGridProps {
  eyebrow?: string
  heading: string
  subhead?: string
  items: BentoItem[]
  className?: string
}

export function BentoGrid({
  eyebrow,
  heading,
  subhead,
  items,
  className,
}: BentoGridProps) {
  // Get size classes for grid items
  const getSizeClasses = (size: BentoItem['size'], index: number) => {
    // Default pattern if no size specified
    if (!size) {
      // Create visual interest with default sizes based on position
      const patterns = [
        'md:col-span-2 md:row-span-2', // Large
        'md:col-span-1 md:row-span-1', // Small
        'md:col-span-1 md:row-span-1', // Small
        'md:col-span-1 md:row-span-2', // Tall
        'md:col-span-2 md:row-span-1', // Wide
        'md:col-span-1 md:row-span-1', // Small
      ]
      return patterns[index % patterns.length]
    }

    switch (size) {
      case 'large':
        return 'md:col-span-2 md:row-span-2'
      case 'medium':
        return 'md:col-span-2 md:row-span-1'
      default:
        return 'md:col-span-1 md:row-span-1'
    }
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

        {/* Bento Grid */}
        <div className="grid auto-rows-[180px] gap-4 md:grid-cols-3 md:auto-rows-[200px]">
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                'group relative overflow-hidden rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg',
                getSizeClasses(item.size, index)
              )}
            >
              {/* Background Image (if provided) */}
              {item.imageSrc && (
                <>
                  <Image
                    src={item.imageSrc}
                    alt={item.imageAlt || item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </>
              )}

              {/* Content */}
              <div
                className={cn(
                  'relative z-10 flex h-full flex-col',
                  item.imageSrc ? 'justify-end text-white' : 'justify-between'
                )}
              >
                {/* Icon */}
                {item.icon && !item.imageSrc && (
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon name={item.icon} className="h-6 w-6" />
                  </div>
                )}

                {/* Text */}
                <div>
                  <h3
                    className={cn(
                      'mb-2 text-xl font-semibold',
                      item.imageSrc ? 'text-white' : 'text-foreground'
                    )}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={cn(
                      'text-sm',
                      item.imageSrc ? 'text-white/80' : 'text-muted-foreground'
                    )}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BentoGrid
