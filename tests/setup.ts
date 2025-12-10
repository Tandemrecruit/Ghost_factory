import { vi } from 'vitest'

// Mock environment variables for tests
process.env.NODE_ENV = 'test'
process.env.GF_METRICS_ENABLED = 'false'

// Mock fetch globally
global.fetch = vi.fn()

// Mock navigator.sendBeacon
Object.defineProperty(global.navigator, 'sendBeacon', {
  value: vi.fn(),
  writable: true,
})
