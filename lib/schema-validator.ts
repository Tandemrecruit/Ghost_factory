/**
 * JSON schema validation for data files (time logs, costs, revenue).
 */

export interface TimeEntry {
  timestamp: string;
  activity: string;
  client_id?: string | null;
  duration_seconds: number;
  time_saved_seconds?: number;
  metadata?: Record<string, any>;
}

export interface ApiCostEntry {
  timestamp: string;
  provider: string;
  model: string;
  activity: string;
  client_id?: string | null;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  metadata?: Record<string, any>;
}

export interface HostingCostEntry {
  timestamp: string;
  client_id: string;
  cost_usd: number;
  type: "hosting";
}

export interface RevenueEntry {
  timestamp: string;
  client_id?: string | null;
  type: string;
  amount_usd: number;
  package?: string;
}

/**
 * Validate a time log entry.
 */
export function validateTimeEntry(entry: any): { valid: boolean; error?: string } {
  if (!entry || typeof entry !== "object") {
    return { valid: false, error: "Entry must be an object" };
  }

  if (typeof entry.timestamp !== "string") {
    return { valid: false, error: "timestamp must be a string" };
  }

  if (typeof entry.activity !== "string") {
    return { valid: false, error: "activity must be a string" };
  }

  if (entry.client_id !== null && entry.client_id !== undefined && typeof entry.client_id !== "string") {
    return { valid: false, error: "client_id must be a string or null" };
  }

  if (typeof entry.duration_seconds !== "number") {
    return { valid: false, error: "duration_seconds must be a number" };
  }

  if (entry.time_saved_seconds !== undefined && typeof entry.time_saved_seconds !== "number") {
    return { valid: false, error: "time_saved_seconds must be a number" };
  }

  if (entry.metadata !== undefined && (typeof entry.metadata !== "object" || Array.isArray(entry.metadata))) {
    return { valid: false, error: "metadata must be an object" };
  }

  return { valid: true };
}

/**
 * Validate an API cost entry.
 */
export function validateApiCostEntry(entry: any): { valid: boolean; error?: string } {
  if (!entry || typeof entry !== "object") {
    return { valid: false, error: "Entry must be an object" };
  }

  if (typeof entry.timestamp !== "string") {
    return { valid: false, error: "timestamp must be a string" };
  }

  if (typeof entry.provider !== "string") {
    return { valid: false, error: "provider must be a string" };
  }

  if (typeof entry.model !== "string") {
    return { valid: false, error: "model must be a string" };
  }

  if (typeof entry.activity !== "string") {
    return { valid: false, error: "activity must be a string" };
  }

  if (entry.client_id !== null && entry.client_id !== undefined && typeof entry.client_id !== "string") {
    return { valid: false, error: "client_id must be a string or null" };
  }

  if (typeof entry.input_tokens !== "number") {
    return { valid: false, error: "input_tokens must be a number" };
  }

  if (typeof entry.output_tokens !== "number") {
    return { valid: false, error: "output_tokens must be a number" };
  }

  if (typeof entry.cost_usd !== "number") {
    return { valid: false, error: "cost_usd must be a number" };
  }

  if (entry.metadata !== undefined && (typeof entry.metadata !== "object" || Array.isArray(entry.metadata))) {
    return { valid: false, error: "metadata must be an object" };
  }

  return { valid: true };
}

/**
 * Validate a hosting cost entry.
 */
export function validateHostingCostEntry(entry: any): { valid: boolean; error?: string } {
  if (!entry || typeof entry !== "object") {
    return { valid: false, error: "Entry must be an object" };
  }

  if (typeof entry.timestamp !== "string") {
    return { valid: false, error: "timestamp must be a string" };
  }

  if (typeof entry.client_id !== "string") {
    return { valid: false, error: "client_id must be a string" };
  }

  if (typeof entry.cost_usd !== "number") {
    return { valid: false, error: "cost_usd must be a number" };
  }

  if (entry.type !== "hosting") {
    return { valid: false, error: "type must be 'hosting'" };
  }

  return { valid: true };
}

/**
 * Validate a revenue entry.
 */
export function validateRevenueEntry(entry: any): { valid: boolean; error?: string } {
  if (!entry || typeof entry !== "object") {
    return { valid: false, error: "Entry must be an object" };
  }

  if (typeof entry.timestamp !== "string") {
    return { valid: false, error: "timestamp must be a string" };
  }

  if (entry.client_id !== null && entry.client_id !== undefined && typeof entry.client_id !== "string") {
    return { valid: false, error: "client_id must be a string or null" };
  }

  if (typeof entry.type !== "string") {
    return { valid: false, error: "type must be a string" };
  }

  if (typeof entry.amount_usd !== "number") {
    return { valid: false, error: "amount_usd must be a number" };
  }

  if (entry.package !== undefined && typeof entry.package !== "string") {
    return { valid: false, error: "package must be a string" };
  }

  return { valid: true };
}

/**
 * Validate an array of time log entries.
 */
export function validateTimeLogs(data: any[]): { valid: boolean; errors: string[] } {
  if (!Array.isArray(data)) {
    return { valid: false, errors: ["Time logs must be an array"] };
  }

  const errors: string[] = [];
  data.forEach((entry, index) => {
    const result = validateTimeEntry(entry);
    if (!result.valid) {
      errors.push(`Entry ${index}: ${result.error}`);
    }
  });

  return { valid: errors.length === 0, errors };
}

/**
 * Validate an array of cost entries (API or hosting).
 */
export function validateCostEntries(
  data: any[],
  entryType: "api" | "hosting"
): { valid: boolean; errors: string[] } {
  if (!Array.isArray(data)) {
    return { valid: false, errors: [`${entryType} costs must be an array`] };
  }

  const errors: string[] = [];
  const validator =
    entryType === "api" ? validateApiCostEntry : validateHostingCostEntry;

  data.forEach((entry, index) => {
    const result = validator(entry);
    if (!result.valid) {
      errors.push(`Entry ${index}: ${result.error}`);
    }
  });

  return { valid: errors.length === 0, errors };
}

/**
 * Validate an array of revenue entries.
 */
export function validateRevenueEntries(data: any[]): { valid: boolean; errors: string[] } {
  if (!Array.isArray(data)) {
    return { valid: false, errors: ["Revenue entries must be an array"] };
  }

  const errors: string[] = [];
  data.forEach((entry, index) => {
    const result = validateRevenueEntry(entry);
    if (!result.valid) {
      errors.push(`Entry ${index}: ${result.error}`);
    }
  });

  return { valid: errors.length === 0, errors };
}

