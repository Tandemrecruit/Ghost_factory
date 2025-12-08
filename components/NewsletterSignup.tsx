'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Icon } from '@/lib/icons'

export interface NewsletterSignupProps {
  eyebrow?: string
  heading: string
  subhead?: string
  placeholder?: string
  submitLabel?: string
  successMessage?: string
  privacyText?: string
  layout?: 'stacked' | 'inline'
  className?: string
}

export function NewsletterSignup({
  eyebrow,
  heading,
  subhead,
  placeholder = 'Enter your email',
  submitLabel = 'Subscribe',
  successMessage = 'Thanks for subscribing!',
  privacyText,
  layout = 'stacked',
  className,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setIsSuccess(true)
    setEmail('')
  }

  return (
    <section className={cn('section-padding', className)}>
      <div className="container-narrow">
        <div className="text-center">
          {/* Header */}
          {eyebrow && (
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
              {eyebrow}
            </span>
          )}
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {heading}
          </h2>
          {subhead && (
            <p className="mb-8 text-lg text-muted-foreground">{subhead}</p>
          )}

          {/* Form */}
          {isSuccess ? (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 p-4 text-green-700">
              <Icon name="check-circle" className="h-5 w-5" />
              <span className="font-medium">{successMessage}</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className={cn(
                layout === 'inline'
                  ? 'flex flex-col items-center gap-3 sm:flex-row sm:justify-center'
                  : 'mx-auto max-w-md space-y-4'
              )}
            >
              <div className={cn(layout === 'inline' ? 'w-full sm:w-auto sm:flex-1 sm:max-w-sm' : 'w-full')}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={placeholder}
                  className={cn(
                    'w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                    error && 'border-red-500'
                  )}
                />
                {error && (
                  <p className="mt-1 text-left text-sm text-red-500">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'w-full rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50',
                  layout === 'inline' && 'sm:w-auto'
                )}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Subscribing...
                  </span>
                ) : (
                  submitLabel
                )}
              </button>
            </form>
          )}

          {/* Privacy Text */}
          {privacyText && !isSuccess && (
            <p className="mt-4 text-sm text-muted-foreground">{privacyText}</p>
          )}
        </div>
      </div>
    </section>
  )
}

export default NewsletterSignup
