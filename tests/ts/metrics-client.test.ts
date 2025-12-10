import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// We need to mock the module before importing
const mockSendBeacon = vi.fn()
const mockFetch = vi.fn()

// Mock navigator.sendBeacon at the module level
vi.stubGlobal('navigator', {
  sendBeacon: mockSendBeacon,
})

vi.stubGlobal('fetch', mockFetch)

// Now import the module under test
import {
  trackPageView,
  trackCtaClick,
  trackConversion,
  setMetricsEnabled,
  isMetricsEnabled,
} from '@/lib/metrics'

describe('Metrics Client', () => {
  beforeEach(() => {
    // Reset metrics state
    setMetricsEnabled(false)

    // Reset mocks
    mockSendBeacon.mockReset()
    mockSendBeacon.mockReturnValue(true)
    mockFetch.mockReset()
    mockFetch.mockResolvedValue(new Response(null, { status: 204 }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('setMetricsEnabled / isMetricsEnabled', () => {
    it('defaults to disabled after reset', () => {
      // After setMetricsEnabled(false) in beforeEach
      expect(isMetricsEnabled()).toBe(false)
    })

    it('can be enabled', () => {
      setMetricsEnabled(true)
      expect(isMetricsEnabled()).toBe(true)
    })

    it('can be disabled', () => {
      setMetricsEnabled(true)
      setMetricsEnabled(false)
      expect(isMetricsEnabled()).toBe(false)
    })
  })

  describe('when metrics are disabled', () => {
    beforeEach(() => {
      setMetricsEnabled(false)
    })

    it('trackPageView does not make network call', () => {
      trackPageView({
        clientId: 'test-client',
        pageId: 'test-page',
      })

      expect(mockSendBeacon).not.toHaveBeenCalled()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('trackCtaClick does not make network call', () => {
      trackCtaClick({
        clientId: 'test-client',
        pageId: 'test-page',
        blockId: 'hero_simple_v1',
      })

      expect(mockSendBeacon).not.toHaveBeenCalled()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('trackConversion does not make network call', () => {
      trackConversion({
        clientId: 'test-client',
        pageId: 'test-page',
      })

      expect(mockSendBeacon).not.toHaveBeenCalled()
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('when metrics are enabled', () => {
    beforeEach(() => {
      setMetricsEnabled(true)
    })

    it('trackPageView sends event via sendBeacon', () => {
      trackPageView({
        clientId: 'ember-roasters',
        pageId: 'ember-roasters',
      })

      expect(mockSendBeacon).toHaveBeenCalledWith(
        '/api/gf-track',
        expect.any(Blob)
      )
    })

    it('trackCtaClick sends event with blockId and metadata', () => {
      trackCtaClick({
        clientId: 'ember-roasters',
        pageId: 'ember-roasters',
        blockId: 'hero_simple_v1',
        metadata: { cta_label: 'Book Now' },
      })

      expect(mockSendBeacon).toHaveBeenCalled()

      // Verify the payload structure
      const blobArg = mockSendBeacon.mock.calls[0][1] as Blob
      expect(blobArg.type).toBe('application/json')
    })

    it('trackConversion sends event with variantId', () => {
      trackConversion({
        clientId: 'ember-roasters',
        pageId: 'ember-roasters',
        variantId: 'variant_a',
      })

      expect(mockSendBeacon).toHaveBeenCalled()
    })

    it('falls back to fetch when sendBeacon returns false', () => {
      mockSendBeacon.mockReturnValue(false)

      trackPageView({
        clientId: 'ember-roasters',
        pageId: 'ember-roasters',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/gf-track',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
        })
      )
    })

    it('falls back to fetch when sendBeacon throws', () => {
      mockSendBeacon.mockImplementation(() => {
        throw new Error('sendBeacon not supported')
      })

      trackPageView({
        clientId: 'ember-roasters',
        pageId: 'ember-roasters',
      })

      expect(mockFetch).toHaveBeenCalled()
    })
  })

  describe('payload structure', () => {
    beforeEach(() => {
      setMetricsEnabled(true)
      // Force fetch path for easier payload inspection
      mockSendBeacon.mockReturnValue(false)
    })

    it('page_view has correct structure', () => {
      trackPageView({
        clientId: 'ember-roasters',
        pageId: 'ember-roasters',
      })

      const call = mockFetch.mock.calls[0]
      const body = JSON.parse(call[1].body)

      expect(body).toEqual({
        type: 'page_view',
        clientId: 'ember-roasters',
        pageId: 'ember-roasters',
      })
    })

    it('cta_click includes optional fields', () => {
      trackCtaClick({
        clientId: 'ember-roasters',
        pageId: 'ember-roasters',
        blockId: 'hero_simple_v1',
        variantId: 'variant_a',
        metadata: { cta_label: 'Book a call' },
      })

      const call = mockFetch.mock.calls[0]
      const body = JSON.parse(call[1].body)

      expect(body).toEqual({
        type: 'cta_click',
        clientId: 'ember-roasters',
        pageId: 'ember-roasters',
        blockId: 'hero_simple_v1',
        variantId: 'variant_a',
        metadata: { cta_label: 'Book a call' },
      })
    })

    it('conversion has correct type', () => {
      trackConversion({
        clientId: 'ember-roasters',
        pageId: 'ember-roasters',
        blockId: 'pricing_simple_v1',
      })

      const call = mockFetch.mock.calls[0]
      const body = JSON.parse(call[1].body)

      expect(body.type).toBe('conversion')
      expect(body.blockId).toBe('pricing_simple_v1')
    })
  })
})
