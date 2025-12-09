/**
 * Authentication utilities for dashboard API routes.
 * 
 * Simple authentication check using environment variable.
 * For production, this should be replaced with proper authentication.
 */

/**
 * Check if a request is authorized to access dashboard APIs.
 * 
 * @param request - The incoming request
 * @returns True if authorized, False otherwise
 */
export function isAuthorized(request: Request): boolean {
  // Check for authorization header or API key
  const authHeader = request.headers.get("authorization");
  const apiKey = request.headers.get("x-api-key");
  
  // Get expected secret from environment
  const expectedSecret = process.env.DASHBOARD_SECRET;
  
  // If no secret is configured, allow access (development mode)
  if (!expectedSecret) {
    return true;
  }
  
  // Check authorization header (Bearer token)
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    return token === expectedSecret;
  }
  
  // Check API key header
  if (apiKey) {
    return apiKey === expectedSecret;
  }
  
  // Check for same-origin (if running on same domain)
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");
  
  // Allow if request is from same origin (for local development)
  if (origin && host && new URL(origin).hostname === host.split(":")[0]) {
    return true;
  }
  
  // Deny by default
  return false;
}

