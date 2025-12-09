/**
 * Validation utilities for API route parameters.
 */

/**
 * Validate and sanitize month parameter (YYYY-MM format).
 * Prevents path traversal attacks.
 * 
 * @param month - Month string from query parameter (can be null)
 * @returns Valid month string in YYYY-MM format
 * @throws Error if month format is invalid
 */
export function validateMonth(month: string | null): string {
  if (!month) {
    return new Date().toISOString().slice(0, 7);
  }
  
  // Must match YYYY-MM format
  const monthPattern = /^\d{4}-\d{2}$/;
  if (!monthPattern.test(month)) {
    throw new Error('Invalid month format. Expected YYYY-MM');
  }
  
  // Prevent path traversal
  if (month.includes('..') || month.includes('/') || month.includes('\\')) {
    throw new Error('Invalid month parameter');
  }
  
  // Validate month is between 01-12
  const [, monthNum] = month.split('-');
  const monthInt = parseInt(monthNum, 10);
  if (monthInt < 1 || monthInt > 12) {
    throw new Error('Invalid month. Must be between 01-12');
  }
  
  return month;
}

