'use client'

import React, { useEffect, useRef } from 'react'
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
     * Locate the nearest ancestor element that defines a block identifier.
     *
     * Searches upward from the given element for the closest ancestor with a `data-gf-block`
     * attribute and returns that attribute's value.
     *
     * @param element - The element to start the search from.
     * @returns The `data-gf-block` attribute value of the nearest ancestor, or `undefined` if none exists.
     */
    function findBlockId(element: Element): string | undefined {
      const blockElement = element.closest('[data-gf-block]')
      return blockElement?.getAttribute('data-gf-block') || undefined
    }

    /**
     * Extracts a human-readable CTA label from a DOM element.
     *
     * Prefers the element's `data-gf-cta-label` attribute; if absent, uses the element's visible text trimmed and truncated to 100 characters. Returns `undefined` when no label can be determined.
     *
     * @param element - DOM element to derive the CTA label from
     * @returns The extracted label, or `undefined` if none is available
     */
    function getCtaLabel(element: Element): string | undefined {
      // First check for explicit label override
      const explicitLabel = element.getAttribute('data-gf-cta-label')
      if (explicitLabel) return explicitLabel

      // Fall back to innerText or textContent (truncated for safety)
      const htmlElement = element as HTMLElement
      const text = (htmlElement.innerText || htmlElement.textContent)?.trim()
      if (text) {
        return text.slice(0, 100) // Limit label length
      }

      return undefined
    }

    /**
     * Handle document click events for primary CTAs and send CTA click metrics.
     *
     * Finds the nearest ancestor of the click target with `data-gf-cta="primary"`, resolves its
     * block identifier and a human-readable CTA label (if available), and calls `trackCtaClick`
     * with the collected context and optional `cta_label` metadata.
     *
     * @param event - The click event from the document; only clicks that originate from or within
     *                an element marked with `data-gf-cta="primary"` will trigger tracking.
     */
    function handleClick(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof Element)) return
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
     * Detects clicks on primary conversion anchors or non-submit conversion buttons and records a conversion using the element's block id.
     *
     * @param event - Mouse event used to locate the nearest conversion element (anchor[data-gf-conversion="primary"] or button[data-gf-conversion="primary"]:not([type="submit"])) and extract its block id for tracking
     */
    function handleConversionClick(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof Element)) return
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
     * Handle form submit events and record a conversion for forms marked as primary.
     *
     * Processes the given submit `event`; if the event target is an HTMLFormElement
     * with `data-gf-conversion="primary"`, finds the nearest `data-gf-block`
     * ancestor and calls `trackConversion` including `blockId` and `metadata: { trigger: 'form_submit' }`.
     *
     * @param event - The submit event whose `target` is expected to be the submitted form
     */
    function handleSubmit(event: Event) {
      const form = event.target
      if (!(form instanceof HTMLFormElement)) return

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