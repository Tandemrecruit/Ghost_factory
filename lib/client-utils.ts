/**
 * Client ID validation and sanitization utilities.
 * 
 * Prevents path traversal attacks and filesystem issues by validating
 * client IDs before use in file paths.
 */

// Pattern: alphanumeric, hyphens, underscores only
// Must not be empty, must not start/end with hyphen/underscore (except single char)
// Windows invalid chars: < > : " | ? * \
// Unix path separators: / \
const CLIENT_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/;

/**
 * Validate that a client ID is safe for use in file paths.
 * 
 * Rules:
 * - Only alphanumeric characters, hyphens, and underscores
 * - Cannot start or end with hyphen/underscore (except single char)
 * - Cannot contain path separators (/, \)
 * - Cannot contain Windows invalid chars (< > : " | ? *)
 * - Must be non-empty
 * 
 * @param clientId - The client ID to validate
 * @returns True if valid, False otherwise
 */
export function isValidClientId(clientId: string): boolean {
  if (!clientId || typeof clientId !== 'string') {
    return false;
  }

  // Check for path separators and invalid characters
  const invalidChars = ['/', '\\', '<', '>', ':', '"', '|', '?', '*'];
  if (invalidChars.some(char => clientId.includes(char))) {
    return false;
  }

  // Check for path traversal patterns
  if (clientId.includes('..')) {
    return false;
  }

  // Match against safe pattern
  if (!CLIENT_ID_PATTERN.test(clientId)) {
    return false;
  }

  return true;
}

/**
 * Sanitize a client ID, returning null if invalid.
 * 
 * This function validates and returns the client ID if safe,
 * or null if it contains dangerous characters.
 * 
 * @param clientId - The client ID to sanitize
 * @returns Sanitized client ID if valid, null otherwise
 */
export function sanitizeClientId(clientId: string): string | null {
  if (!isValidClientId(clientId)) {
    console.warn(`Invalid client ID rejected: ${clientId}`);
    return null;
  }
  return clientId;
}

