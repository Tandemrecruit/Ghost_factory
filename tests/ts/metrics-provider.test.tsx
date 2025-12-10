/**
 * Integration tests for MetricsProvider component
 *
 * Tests event listener initialization, cleanup, and DOM attribute metadata extraction.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, cleanup, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

// Mock the metrics module
const mockTrackPageView = vi.fn()
const mockTrackCtaClick = vi.fn()
const mockTrackConversion = vi.fn()
const mockSetMetricsEnabled = vi.fn()

vi.mock('@/lib/metrics', () => ({
  trackPageView: (...args: unknown[]) => mockTrackPageView(...args),
  trackCtaClick: (...args: unknown[]) => mockTrackCtaClick(...args),
  trackConversion: (...args: unknown[]) => mockTrackConversion(...args),
  setMetricsEnabled: (...args: unknown[]) => mockSetMetricsEnabled(...args),
}))

// Import after mocking
import { MetricsProvider } from '@/components/MetricsProvider'

describe('MetricsProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  describe('initialization', () => {
    it('calls setMetricsEnabled with enabled prop value', () => {
      render(
        <MetricsProvider clientId="test-client" enabled={true}>
          <div>Content</div>
        </MetricsProvider>
      )

      expect(mockSetMetricsEnabled).toHaveBeenCalledWith(true)
    })

    it('calls setMetricsEnabled with false when disabled', () => {
      render(
        <MetricsProvider clientId="test-client" enabled={false}>
          <div>Content</div>
        </MetricsProvider>
      )

      expect(mockSetMetricsEnabled).toHaveBeenCalledWith(false)
    })

    it('tracks page view on mount when enabled', () => {
      render(
        <MetricsProvider clientId="ember-roasters" enabled={true}>
          <div>Content</div>
        </MetricsProvider>
      )

      expect(mockTrackPageView).toHaveBeenCalledWith({
        clientId: 'ember-roasters',
        pageId: 'ember-roasters',
        variantId: undefined,
      })
    })

    it('uses custom pageId when provided', () => {
      render(
        <MetricsProvider
          clientId="ember-roasters"
          pageId="landing-v2"
          enabled={true}
        >
          <div>Content</div>
        </MetricsProvider>
      )

      expect(mockTrackPageView).toHaveBeenCalledWith({
        clientId: 'ember-roasters',
        pageId: 'landing-v2',
        variantId: undefined,
      })
    })

    it('includes variantId when provided', () => {
      render(
        <MetricsProvider
          clientId="ember-roasters"
          variantId="variant_b"
          enabled={true}
        >
          <div>Content</div>
        </MetricsProvider>
      )

      expect(mockTrackPageView).toHaveBeenCalledWith({
        clientId: 'ember-roasters',
        pageId: 'ember-roasters',
        variantId: 'variant_b',
      })
    })

    it('does NOT track page view when disabled', () => {
      render(
        <MetricsProvider clientId="ember-roasters" enabled={false}>
          <div>Content</div>
        </MetricsProvider>
      )

      expect(mockTrackPageView).not.toHaveBeenCalled()
    })

    it('tracks page view only once per mount', () => {
      const { rerender } = render(
        <MetricsProvider clientId="ember-roasters" enabled={true}>
          <div>Content</div>
        </MetricsProvider>
      )

      // Re-render with same props
      rerender(
        <MetricsProvider clientId="ember-roasters" enabled={true}>
          <div>Content Updated</div>
        </MetricsProvider>
      )

      // Should still only have been called once
      expect(mockTrackPageView).toHaveBeenCalledTimes(1)
    })
  })

  describe('event listener cleanup', () => {
    it('removes event listeners on unmount', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      const { unmount } = render(
        <MetricsProvider clientId="test-client" enabled={true}>
          <div>Content</div>
        </MetricsProvider>
      )

      // Should have added click and submit listeners
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'click',
        expect.any(Function),
        { capture: true }
      )
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'submit',
        expect.any(Function),
        { capture: true }
      )

      unmount()

      // Should have removed click and submit listeners
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'click',
        expect.any(Function),
        { capture: true }
      )
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'submit',
        expect.any(Function),
        { capture: true }
      )

      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
    })

    it('does NOT add event listeners when disabled', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

      render(
        <MetricsProvider clientId="test-client" enabled={false}>
          <div>Content</div>
        </MetricsProvider>
      )

      // Should not have added click or submit listeners for metrics
      // (Note: React may add its own listeners, so we check the call args)
      const metricsListenerCalls = addEventListenerSpy.mock.calls.filter(
        (call) => call[2]?.capture === true
      )
      expect(metricsListenerCalls).toHaveLength(0)

      addEventListenerSpy.mockRestore()
    })
  })

  describe('CTA click tracking', () => {
    it('tracks CTA clicks on elements with data-gf-cta="primary"', async () => {
      const { getByTestId } = render(
        <MetricsProvider clientId="ember-roasters" enabled={true}>
          <button data-testid="cta-btn" data-gf-cta="primary">
            Book Now
          </button>
        </MetricsProvider>
      )

      fireEvent.click(getByTestId('cta-btn'))

      await waitFor(() => {
        expect(mockTrackCtaClick).toHaveBeenCalledWith({
          clientId: 'ember-roasters',
          pageId: 'ember-roasters',
          variantId: undefined,
          blockId: undefined,
          metadata: { cta_label: 'Book Now' },
        })
      })
    })

    it('extracts blockId from ancestor data-gf-block attribute', async () => {
      const { getByTestId } = render(
        <MetricsProvider clientId="ember-roasters" enabled={true}>
          <section data-gf-block="hero_simple_v1">
            <button data-testid="cta-btn" data-gf-cta="primary">
              Get Started
            </button>
          </section>
        </MetricsProvider>
      )

      fireEvent.click(getByTestId('cta-btn'))

      await waitFor(() => {
        expect(mockTrackCtaClick).toHaveBeenCalledWith({
          clientId: 'ember-roasters',
          pageId: 'ember-roasters',
          variantId: undefined,
          blockId: 'hero_simple_v1',
          metadata: { cta_label: 'Get Started' },
        })
      })
    })

    it('uses data-gf-cta-label override when present', async () => {
      const { getByTestId } = render(
        <MetricsProvider clientId="ember-roasters" enabled={true}>
          <button
            data-testid="cta-btn"
            data-gf-cta="primary"
            data-gf-cta-label="Custom Label"
          >
            Button Text
          </button>
        </MetricsProvider>
      )

      fireEvent.click(getByTestId('cta-btn'))

      await waitFor(() => {
        expect(mockTrackCtaClick).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: { cta_label: 'Custom Label' },
          })
        )
      })
    })

    it('does NOT track clicks on elements without data-gf-cta', async () => {
      const { getByTestId } = render(
        <MetricsProvider clientId="ember-roasters" enabled={true}>
          <button data-testid="regular-btn">Regular Button</button>
        </MetricsProvider>
      )

      fireEvent.click(getByTestId('regular-btn'))

      // Wait a tick to ensure async handlers have run
      await waitFor(() => {
        expect(mockTrackCtaClick).not.toHaveBeenCalled()
      })
    })

    it('tracks clicks on nested elements within CTA', async () => {
      const { getByTestId } = render(
        <MetricsProvider clientId="ember-roasters" enabled={true}>
          <button data-gf-cta="primary">
            <span data-testid="inner-span">Click Me</span>
          </button>
        </MetricsProvider>
      )

      fireEvent.click(getByTestId('inner-span'))

      await waitFor(() => {
        expect(mockTrackCtaClick).toHaveBeenCalled()
      })
    })
  })

  describe('conversion tracking', () => {
    it('tracks form submissions with data-gf-conversion="primary"', async () => {
      const { getByTestId } = render(
        <MetricsProvider clientId="ember-roasters" enabled={true}>
          <section data-gf-block="pricing_simple_v1">
            <form data-testid="contact-form" data-gf-conversion="primary">
              <button type="submit">Submit</button>
            </form>
          </section>
        </MetricsProvider>
      )

      fireEvent.submit(getByTestId('contact-form'))

      await waitFor(() => {
        expect(mockTrackConversion).toHaveBeenCalledWith({
          clientId: 'ember-roasters',
          pageId: 'ember-roasters',
          variantId: undefined,
          blockId: 'pricing_simple_v1',
          metadata: { trigger: 'form_submit' },
        })
      })
    })

    it('tracks link clicks with data-gf-conversion="primary"', async () => {
      const { getByTestId } = render(
        <MetricsProvider clientId="ember-roasters" enabled={true}>
          <section data-gf-block="cta_banner_v1">
            <a
              data-testid="conversion-link"
              href="https://calendly.com/book"
              data-gf-conversion="primary"
            >
              Book Now
            </a>
          </section>
        </MetricsProvider>
      )

      fireEvent.click(getByTestId('conversion-link'))

      await waitFor(() => {
        expect(mockTrackConversion).toHaveBeenCalledWith({
          clientId: 'ember-roasters',
          pageId: 'ember-roasters',
          variantId: undefined,
          blockId: 'cta_banner_v1',
        })
      })
    })

    it('does NOT track form submissions without data-gf-conversion', async () => {
      const { getByTestId } = render(
        <MetricsProvider clientId="ember-roasters" enabled={true}>
          <form data-testid="regular-form">
            <button type="submit">Submit</button>
          </form>
        </MetricsProvider>
      )

      fireEvent.submit(getByTestId('regular-form'))

      await waitFor(() => {
        expect(mockTrackConversion).not.toHaveBeenCalled()
      })
    })
  })

  describe('DOM attribute metadata extraction', () => {
    it('finds blockId from deeply nested ancestor', async () => {
      const { getByTestId } = render(
        <MetricsProvider clientId="ember-roasters" enabled={true}>
          <div data-gf-block="feature_grid_v1">
            <div className="wrapper">
              <div className="inner">
                <button data-testid="nested-cta" data-gf-cta="primary">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </MetricsProvider>
      )

      fireEvent.click(getByTestId('nested-cta'))

      await waitFor(() => {
        expect(mockTrackCtaClick).toHaveBeenCalledWith(
          expect.objectContaining({
            blockId: 'feature_grid_v1',
          })
        )
      })
    })

    it('uses closest blockId when multiple ancestors have data-gf-block', async () => {
      const { getByTestId } = render(
        <MetricsProvider clientId="ember-roasters" enabled={true}>
          <section data-gf-block="outer_section_v1">
            <div data-gf-block="inner_card_v1">
              <button data-testid="cta" data-gf-cta="primary">
                Click
              </button>
            </div>
          </section>
        </MetricsProvider>
      )

      fireEvent.click(getByTestId('cta'))

      await waitFor(() => {
        expect(mockTrackCtaClick).toHaveBeenCalledWith(
          expect.objectContaining({
            blockId: 'inner_card_v1', // Should use closest ancestor
          })
        )
      })
    })

    it('handles missing blockId gracefully', async () => {
      const { getByTestId } = render(
        <MetricsProvider clientId="ember-roasters" enabled={true}>
          <button data-testid="orphan-cta" data-gf-cta="primary">
            Orphan CTA
          </button>
        </MetricsProvider>
      )

      fireEvent.click(getByTestId('orphan-cta'))

      await waitFor(() => {
        expect(mockTrackCtaClick).toHaveBeenCalledWith(
          expect.objectContaining({
            blockId: undefined,
          })
        )
      })
    })

    it('truncates long CTA labels to 100 characters', async () => {
      const longLabel = 'A'.repeat(150)
      const { getByTestId } = render(
        <MetricsProvider clientId="ember-roasters" enabled={true}>
          <button data-testid="long-label-cta" data-gf-cta="primary">
            {longLabel}
          </button>
        </MetricsProvider>
      )

      fireEvent.click(getByTestId('long-label-cta'))

      await waitFor(() => {
        expect(mockTrackCtaClick).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: { cta_label: 'A'.repeat(100) },
          })
        )
      })
    })
  })

  describe('props changes', () => {
    it('re-tracks page view when clientId changes', () => {
      const { rerender } = render(
        <MetricsProvider clientId="client-a" enabled={true}>
          <div>Content</div>
        </MetricsProvider>
      )

      expect(mockTrackPageView).toHaveBeenCalledTimes(1)
      expect(mockTrackPageView).toHaveBeenLastCalledWith(
        expect.objectContaining({ clientId: 'client-a' })
      )

      // Change clientId
      rerender(
        <MetricsProvider clientId="client-b" enabled={true}>
          <div>Content</div>
        </MetricsProvider>
      )

      expect(mockTrackPageView).toHaveBeenCalledTimes(2)
      expect(mockTrackPageView).toHaveBeenLastCalledWith(
        expect.objectContaining({ clientId: 'client-b' })
      )
    })
  })
})
