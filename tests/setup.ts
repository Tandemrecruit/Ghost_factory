import { vi } from 'vitest'

// Mock environment variables for tests
process.env.NODE_ENV = 'test'
process.env.GF_METRICS_ENABLED = 'false'

// Mock fetch globally
global.fetch = vi.fn()

// Mock navigator.sendBeacon
// Ensure navigator exists before mocking (Node.js test environments may not have it)
if (!global.navigator) {
  global.navigator = {} as Navigator
}
Object.defineProperty(global.navigator, 'sendBeacon', {
  value: vi.fn(),
  writable: true,
})
