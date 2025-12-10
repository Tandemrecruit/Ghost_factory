import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST } from '@/app/api/gf-track/route'
import { NextRequest } from 'next/server'

// Helper to create mock NextRequest
function createMockRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/gf-track', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

describe('POST /api/gf-track', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('when metrics are disabled', () => {
    beforeEach(() => {
      process.env.GF_METRICS_ENABLED = 'false'
    })

    it('returns 204 without processing', async () => {
      const { POST } = await import('@/app/api/gf-track/route')
      const request = createMockRequest({
        type: 'page_view',
        clientId: 'test',
        pageId: 'test',
      })

      const response = await POST(request)

      expect(response.status).toBe(204)
    })
  })

  describe('when metrics are enabled', () => {
    beforeEach(() => {
      process.env.GF_METRICS_ENABLED = 'true'
      process.env.GF_METRICS_WEBHOOK_URL = ''
    })

    it('returns 204 for valid single event', async () => {
      const { POST } = await import('@/app/api/gf-track/route')
      const request = createMockRequest({
        type: 'page_view',
        clientId: 'ember-roasters',
        pageId: 'ember-roasters',
      })

      const response = await POST(request)

      expect(response.status).toBe(204)
    })

    it('returns 204 for valid event with optional fields', async () => {
      const { POST } = await import('@/app/api/gf-track/route')
      const request = createMockRequest({
        type: 'cta_click',
        clientId: 'ember-roasters',
        pageId: 'ember-roasters',
        blockId: 'hero_simple_v1',
        variantId: 'variant_a',
        metadata: { cta_label: 'Book Now' },
      })

      const response = await POST(request)

      expect(response.status).toBe(204)
    })

    it('returns 204 for valid batch request', async () => {
      const { POST } = await import('@/app/api/gf-track/route')
      const request = createMockRequest({
        events: [
          {
            type: 'page_view',
            clientId: 'ember-roasters',
            pageId: 'ember-roasters',
          },
          {
            type: 'cta_click',
            clientId: 'ember-roasters',
            pageId: 'ember-roasters',
            blockId: 'hero_simple_v1',
          },
        ],
      })

      const response = await POST(request)

      expect(response.status).toBe(204)
    })

    it('returns 400 for invalid event type', async () => {
      const { POST } = await import('@/app/api/gf-track/route')
      const request = createMockRequest({
        type: 'invalid_type',
        clientId: 'test',
        pageId: 'test',
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Invalid event payload')
    })

    it('returns 400 for missing required fields', async () => {
      const { POST } = await import('@/app/api/gf-track/route')
      const request = createMockRequest({
        type: 'page_view',
        // Missing clientId and pageId
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('returns 400 for empty batch', async () => {
      const { POST } = await import('@/app/api/gf-track/route')
      const request = createMockRequest({
        events: [],
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('returns 400 for invalid JSON', async () => {
      const { POST } = await import('@/app/api/gf-track/route')
      const request = new NextRequest('http://localhost:3000/api/gf-track', {
        method: 'POST',
        body: 'not valid json',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Invalid JSON')
    })
  })

  describe('webhook integration', () => {
    let fetchSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      process.env.GF_METRICS_ENABLED = 'true'
      process.env.GF_METRICS_WEBHOOK_URL = 'https://example.com/webhook'
      process.env.GF_METRICS_WEBHOOK_SECRET = 'test-secret'
      fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(null, { status: 200 })
      )
    })

    afterEach(() => {
      fetchSpy.mockRestore()
    })

    it('sends events to webhook when configured', async () => {
      const { POST } = await import('@/app/api/gf-track/route')
      const request = createMockRequest({
        type: 'page_view',
        clientId: 'ember-roasters',
        pageId: 'ember-roasters',
      })

      const response = await POST(request)

      expect(response.status).toBe(204)
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://example.com/webhook',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-secret',
          }),
        })
      )
    })

    it('handles webhook errors gracefully', async () => {
      fetchSpy.mockRejectedValue(new Error('Network error'))

      const { POST } = await import('@/app/api/gf-track/route')
      const request = createMockRequest({
        type: 'page_view',
        clientId: 'ember-roasters',
        pageId: 'ember-roasters',
      })

      // Should not throw, just log and return 204
      const response = await POST(request)
      expect(response.status).toBe(204)
    })
  })
})
