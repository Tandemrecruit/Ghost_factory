import {
  Zap,
  Shield,
  Check,
  Clock,
  Star,
  Heart,
  Target,
  Award,
  Users,
  Mail,
  Phone,
  MapPin,
  Lock,
  CheckCircle,
  AlertCircle,
  X,
  Play,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Menu,
  Twitter,
  Facebook,
  Linkedin,
  Instagram,
  Youtube,
  type LucideProps,
} from 'lucide-react'

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

const iconMap: Record<IconName, React.ComponentType<LucideProps>> = {
  zap: Zap,
  shield: Shield,
  check: Check,
  clock: Clock,
  star: Star,
  heart: Heart,
  target: Target,
  award: Award,
  users: Users,
  mail: Mail,
  phone: Phone,
  'map-pin': MapPin,
  lock: Lock,
  'check-circle': CheckCircle,
  'alert-circle': AlertCircle,
  x: X,
  play: Play,
  'arrow-right': ArrowRight,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  menu: Menu,
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
}

interface IconProps extends LucideProps {
  name: IconName
}

export function Icon({ name, ...props }: IconProps) {
  const IconComponent = iconMap[name]

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`)
    return null
  }

  return <IconComponent {...props} />
}

export { iconMap }
