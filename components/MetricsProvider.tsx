'use client'

import { useEffect, useRef } from 'react'
import {
  setMetricsEnabled,
  trackPageView,
  trackCtaClick,
  trackConversion,
} from '@/lib/metrics'

export interface MetricsProviderProps {
  /** The client ID from the URL path */
  clientId: string
  /** Optional page ID - defaults to clientId if not provided */
  pageId?: string
  /** Optional variant ID for A/B testing */
  variantId?: string
  /** Whether metrics are enabled - should be passed from server component */
  enabled?: boolean
  /** Children to render */
  children?: React.ReactNode
}

/**
 * MetricsProvider - Client component for tracking page metrics
 *
 * Wraps client pages to provide:
 * - Automatic page view tracking on mount
 * - CTA click tracking via data-gf-cta="primary" attribute
 * - Conversion tracking via data-gf-conversion="primary" attribute
 * - Block ID detection via data-gf-block="block-id" ancestor
 *
 * Usage:
 * ```tsx
 * // In a server component
 * import { MetricsProvider } from '@/components/MetricsProvider'
 *
 * export default function Page({ params }) {
 *   return (
 *     <MetricsProvider
 *       clientId={params.clientId}
 *       enabled={process.env.GF_METRICS_ENABLED === 'true'}
 *     >
 *       <YourPageContent />
 *     </MetricsProvider>
 *   )
 * }
 * ```
 */
export function MetricsProvider({
  clientId,
  pageId,
  variantId,
  enabled = false,
  children,
}: MetricsProviderProps) {
  const effectivePageId = pageId || clientId
  const hasTrackedPageView = useRef(false)

  // Set metrics enabled state
  useEffect(() => {
    setMetricsEnabled(enabled)
  }, [enabled])

  // Track page view once on mount or when clientId/pageId changes
  useEffect(() => {
    if (!enabled || hasTrackedPageView.current) return

    trackPageView({
      clientId,
      pageId: effectivePageId,
      variantId,
    })
    hasTrackedPageView.current = true

    // Reset tracking flag when clientId or pageId changes
    return () => {
      hasTrackedPageView.current = false
    }
  }, [enabled, clientId, effectivePageId, variantId])

  // Set up CTA click and conversion tracking
  useEffect(() => {
    if (!enabled) return

    /**
     * Find the nearest ancestor with data-gf-block attribute
     */
    function findBlockId(element: Element): string | undefined {
      const blockElement = element.closest('[data-gf-block]')
      return blockElement?.getAttribute('data-gf-block') || undefined
    }

    /**
     * Get CTA label from element
     */
    function getCtaLabel(element: Element): string | undefined {
      // First check for explicit label override
      const explicitLabel = element.getAttribute('data-gf-cta-label')
      if (explicitLabel) return explicitLabel

      // Fall back to innerText (truncated for safety)
      const text = (element as HTMLElement).innerText?.trim()
      if (text) {
        return text.slice(0, 100) // Limit label length
      }

      return undefined
    }

    /**
     * Handle CTA clicks
     */
    function handleClick(event: MouseEvent) {
      const target = event.target as Element
      const ctaElement = target.closest('[data-gf-cta="primary"]')

      if (ctaElement) {
        const blockId = findBlockId(ctaElement)
        const ctaLabel = getCtaLabel(ctaElement)

        trackCtaClick({
          clientId,
          pageId: effectivePageId,
          variantId,
          blockId,
          metadata: ctaLabel ? { cta_label: ctaLabel } : undefined,
        })
      }
    }

    /**
     * Handle conversion clicks (for button/link based conversions)
     */
    function handleConversionClick(event: MouseEvent) {
      const target = event.target as Element
      const conversionElement = target.closest(
        'a[data-gf-conversion="primary"], button[data-gf-conversion="primary"]:not([type="submit"])'
      )

      if (conversionElement) {
        const blockId = findBlockId(conversionElement)

        trackConversion({
          clientId,
          pageId: effectivePageId,
          variantId,
          blockId,
        })
      }
    }

    /**
     * Handle form submissions
     */
    function handleSubmit(event: Event) {
      const form = event.target as HTMLFormElement

      // Check if form has conversion attribute
      if (form.getAttribute('data-gf-conversion') !== 'primary') {
        return
      }

      // Only track successful submissions
      // Note: This fires before actual submission - for async forms,
      // the form should call trackConversion manually on success
      const blockId = findBlockId(form)

      trackConversion({
        clientId,
        pageId: effectivePageId,
        variantId,
        blockId,
        metadata: { trigger: 'form_submit' },
      })
    }

    // Attach event listeners
    document.addEventListener('click', handleClick, { capture: true })
    document.addEventListener('click', handleConversionClick, { capture: true })
    document.addEventListener('submit', handleSubmit, { capture: true })

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick, { capture: true })
      document.removeEventListener('click', handleConversionClick, { capture: true })
      document.removeEventListener('submit', handleSubmit, { capture: true })
    }
  }, [enabled, clientId, effectivePageId, variantId])

  return <>{children}</>
}

export default MetricsProvider
