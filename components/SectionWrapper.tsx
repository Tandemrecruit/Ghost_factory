import { cn } from '@/lib/utils'

export interface SectionWrapperProps {
  background?: 'white' | 'gray' | 'dark' | 'primary' | 'gradient'
  paddingY?: 'small' | 'medium' | 'large'
  children: React.ReactNode
  className?: string
}

export function SectionWrapper({
  background = 'white',
  paddingY = 'medium',
  children,
  className,
}: SectionWrapperProps) {
  const backgroundClasses = {
    white: 'bg-background',
    gray: 'bg-muted',
    dark: 'bg-foreground text-background [&_h1]:text-background [&_h2]:text-background [&_h3]:text-background [&_p]:text-background/80',
    primary: 'bg-primary text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_p]:text-white/90',
    gradient: 'bg-gradient-to-br from-primary to-accent text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_p]:text-white/90',
  }

  const paddingClasses = {
    small: 'py-8 md:py-12',
    medium: 'py-16 md:py-20 lg:py-24',
    large: 'py-24 md:py-32 lg:py-40',
  }

  return (
    <section
      className={cn(
        backgroundClasses[background],
        paddingClasses[paddingY],
        className
      )}
    >
      {children}
    </section>
  )
}

export default SectionWrapper
