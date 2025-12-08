import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines class names using clsx and tailwind-merge
 * This allows for conditional classes and proper Tailwind CSS class merging
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-primary', className)
 * cn('text-sm', 'text-lg') // Returns 'text-lg' (later classes override)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Type-safe icon name type for lucide-react icons
 * Used across components to ensure valid icon names
 */
export type IconName =
  | 'zap'
  | 'shield'
  | 'check'
  | 'clock'
  | 'star'
  | 'heart'
  | 'target'
  | 'award'
  | 'users'
  | 'mail'
  | 'phone'
  | 'map-pin'
  | 'lock'
  | 'check-circle'
  | 'alert-circle'
  | 'x'
  | 'play'
  | 'arrow-right'
  | 'chevron-down'
  | 'chevron-up'
  | 'menu'
  | 'twitter'
  | 'facebook'
  | 'linkedin'
  | 'instagram'
  | 'youtube'
