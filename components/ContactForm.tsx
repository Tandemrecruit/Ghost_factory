'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, Loader2 } from 'lucide-react'

export interface FormField {
  name: string
  type: 'text' | 'email' | 'phone' | 'textarea'
  placeholder: string
  required?: boolean
}

export interface ContactFormProps {
  eyebrow?: string
  heading: string
  subhead?: string
  fields: FormField[]
  submitLabel: string
  successMessage?: string
  className?: string
}

export function ContactForm({
  eyebrow,
  heading,
  subhead,
  fields,
  submitLabel,
  successMessage = 'Thank you! We\'ll be in touch soon.',
  className,
}: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (isSubmitted) {
    return (
      <section className={cn('section-padding', className)}>
        <div className="container-narrow">
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-background p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">
              {successMessage}
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={cn('section-padding', className)}>
      <div className="container-narrow">
        {/* Header */}
        <div className="mb-8 text-center md:mb-12">
          {eyebrow && (
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
              {eyebrow}
            </span>
          )}
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {heading}
          </h2>
          {subhead && (
            <p className="mx-auto max-w-xl text-lg text-muted-foreground">
              {subhead}
            </p>
          )}
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-lg space-y-6 rounded-xl border border-border bg-background p-6 shadow-sm md:p-8"
        >
          {fields.map((field, index) => (
            <div key={index}>
              <label
                htmlFor={field.name}
                className="mb-2 block text-sm font-medium text-foreground"
              >
                {field.placeholder}
                {field.required && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={4}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              ) : (
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              submitLabel
            )}
          </button>
        </form>
      </div>
    </section>
  )
}

export default ContactForm
