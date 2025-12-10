import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { readJsonFile } from "@/lib/json-utils";
import { isAuthorized } from "@/lib/auth-utils";
import {
  validateTimeLogs,
  validateCostEntries,
  validateRevenueEntries,
} from "@/lib/schema-validator";
import { validateMonth } from "@/lib/validation-utils";

// Module-scoped types for dashboard data records
export type RevenueRecord = { amount_usd?: number };
export type CostRecord = { provider?: string; cost_usd?: number; type?: string };

/**
 * Normalize a JSON value to an array. If the value is already an array, returns it as-is.
 * If null/undefined or non-array, returns an empty array.
 */
function normalizeToArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  return [];
}

/**
 * Sum numeric values from an array, treating NaN/null/undefined as 0.
 * Centralizes the "parse as number, treat NaN as 0" pattern.
 *
 * @param items - Array of items to sum
 * @param getter - Function to extract the numeric value from each item
 * @returns Sum of all valid numeric values
 */
function safeSum<T>(items: T[], getter: (item: T) => unknown): number {
  return items.reduce((sum, item) => {
    const val = Number(getter(item)) || 0;
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
}

const root = process.cwd();
const balanceDir = path.join(root, "data", "balance_sheets");
const timeDir = path.join(root, "data", "time_logs");
const revenueDir = path.join(root, "data", "revenue");
const costApiDir = path.join(root, "data", "costs", "api");
const costHostingDir = path.join(root, "data", "costs", "hosting");
const configPath = path.join(root, "automation", "tracker_config.json");

async function fileExists(target: string) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read JSON from the specified file path, returning an empty array when no usable data exists.
 *
 * @param target - Path to the JSON file to read
 * @returns The parsed JSON value, or an empty array if the file is missing or cannot be parsed
 */
async function readJson(target: string) {
  return readJsonFile(target, []);
}

/**
 * Load the tracker's configuration file.
 *
 * @returns The parsed configuration object from the config file, or an empty object (`{}`) if no configuration is present.
 */
async function loadConfig() {
  return readJsonFile(configPath, {});
}

/**
 * Ensure a value is returned as an array, producing an empty array when the input is not an array.
 *
 * @param data - The value that may be an array
 * @returns The input cast to an array if it was an array, otherwise an empty array
 */
function normalizeToArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  return [];
}

/**
 * Aggregate all time log entries from the specified month's directory.
 *
 * Reads every `.json` file in the data/time_logs/{month} directory, validates each file's contents
 * against the time-logs schema (logs a schema warning for files with validation errors),
 * and returns a single flattened array containing all entries.
 *
 * @param month - Month folder name under `data/time_logs` (for example, "2023-07")
 * @returns An array of time log entry objects; empty if the month directory is missing or contains no JSON entries
 */
async function loadTimeEntries(month: string) {
  const monthPath = path.join(timeDir, month);
  const exists = await fileExists(monthPath);
  if (!exists) return [];
  const files = await fs.readdir(monthPath);
  const entries = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const fileEntries = await readJson(path.join(monthPath, file));
    // Validate schema
    const validation = validateTimeLogs(fileEntries);
    if (!validation.valid) {
      console.warn(`[Schema Validation] Invalid time entries in ${file}:`, validation.errors);
    }
    entries.push(...fileEntries);
  }
  return entries;
}

/**
 * Builds a fallback balance summary and aggregated raw entries for a month when no precomputed balance exists.
 *
 * @param month - Month identifier in `YYYY-MM` format
 * @returns An object containing:
 *   - `month`: the requested month string
 *   - `totals`: rounded numeric totals including `revenue_usd`, `costs_usd`, `api_cost_usd`, `hosting_cost_usd`, `payment_fee_usd`, `net_income_usd`, `hours`, `time_saved_hours`, and `effective_hourly_usd`
 *   - `running_balance`: an empty array for the fallback
 *   - `entries`: raw arrays used to compute totals under `time`, `revenue`, and `costs`
 */
async function computeFallback(month: string) {
  const cfg = await loadConfig();
  const processingRate = cfg.payment_processing_rate ?? 0.03;
  const timeEntries = await loadTimeEntries(month);

  // Read raw data from JSON files
  const rawRevenueEntries = await readJson(path.join(revenueDir, `${month}.json`));
  const rawApiCosts = await readJson(path.join(costApiDir, `${month}.json`));
  const rawHostingCosts = await readJson(path.join(costHostingDir, `${month}.json`));

  // Validate raw data
  const revenueValidation = validateRevenueEntries(rawRevenueEntries);
  if (!revenueValidation.valid) {
    console.warn(`[Schema Validation] Invalid revenue entries for ${month}:`, revenueValidation.errors);
  }

  const apiValidation = validateCostEntries(rawApiCosts, "api");
  if (!apiValidation.valid) {
    console.warn(`[Schema Validation] Invalid API cost entries for ${month}:`, apiValidation.errors);
  }

  const hostingValidation = validateCostEntries(rawHostingCosts, "hosting");
  if (!hostingValidation.valid) {
    console.warn(`[Schema Validation] Invalid hosting cost entries for ${month}:`, hostingValidation.errors);
  }

  // Normalize raw data to arrays
  const revenueEntries = normalizeToArray<any>(rawRevenueEntries);
  const apiCosts = normalizeToArray<any>(rawApiCosts);
  const hostingCosts = normalizeToArray<any>(rawHostingCosts);

  const costEntries = [...apiCosts, ...hostingCosts];

  // Type coercion with null checks
  const totalSeconds = timeEntries.reduce((sum, e) => {
    const val = Number(e?.duration_seconds);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
  const totalHours = totalSeconds / 3600;
  const timeSavedSeconds = timeEntries.reduce((sum, e) => {
    const val = Number(e?.time_saved_seconds);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const revenueTotal = revenueEntries.reduce((sum, e) => {
    const val = Number(e?.amount_usd);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
  const apiCostTotal = costEntries
    .filter((e) => e?.provider)
    .reduce((sum, e) => {
      const val = Number(e?.cost_usd);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  const hostingCostTotal = costEntries
    .filter((e) => e?.type === "hosting")
    .reduce((sum, e) => {
      const val = Number(e?.cost_usd);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  const paymentFee = revenueTotal * processingRate;
  const totalCosts = apiCostTotal + hostingCostTotal + paymentFee;
  const netIncome = revenueTotal - totalCosts;
  const effectiveHourly = totalHours ? netIncome / totalHours : 0;

  return {
    month,
    totals: {
      revenue_usd: Number(revenueTotal.toFixed(2)),
      costs_usd: Number(totalCosts.toFixed(2)),
      api_cost_usd: Number(apiCostTotal.toFixed(2)),
      hosting_cost_usd: Number(hostingCostTotal.toFixed(2)),
      payment_fee_usd: Number(paymentFee.toFixed(2)),
      net_income_usd: Number(netIncome.toFixed(2)),
      hours: Number(totalHours.toFixed(2)),
      time_saved_hours: Number((timeSavedSeconds / 3600).toFixed(2)),
      effective_hourly_usd: Number(effectiveHourly.toFixed(2)),
    },
    running_balance: [],
    entries: {
      time: timeEntries,
      revenue: revenueEntries,
      costs: costEntries,
    },
  };
}

/**
 * Handle GET requests for a month's balance sheet data.
 *
 * Checks authorization, validates the `month` query parameter, and returns the stored balance sheet JSON for that month when available and valid. If the stored file is missing or corrupted, returns a computed fallback summary derived from available data sources. On error returns a JSON error object.
 *
 * @param request - The incoming Request for the endpoint, whose URL must include a `month` query parameter.
 * @returns A JSON response containing the monthly balance sheet data or an `{ error: string }` object. Responds with status 200 on success, 401 when unauthorized, and 400 for other request errors.
 */
export async function GET(request: Request) {
  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const url = new URL(request.url);
    const month = validateMonth(url.searchParams.get("month"));
    const balancePath = path.join(balanceDir, `${month}.json`);

    if (await fileExists(balancePath)) {
      const data = await readJsonFile(balancePath, null);
      if (data === null) {
        // If file exists but is corrupted, compute fallback
        const fallbackData = await computeFallback(month);
        return NextResponse.json(fallbackData);
      }
      return NextResponse.json(data);
    }

    const data = await computeFallback(month);
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}