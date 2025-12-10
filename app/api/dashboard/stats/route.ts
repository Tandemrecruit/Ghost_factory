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

async function readJson(target: string) {
  return readJsonFile(target, []);
}

async function loadConfig() {
  return readJsonFile(configPath, {});
}

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
 * Build a fallback balance summary and aggregated entries for the given month when no precomputed balance exists.
 *
 * @param month - Month identifier in `YYYY-MM` format
 * @returns An object containing:
 *   - `month`: the requested month string
 *   - `totals`: aggregated numeric totals (two-decimal precision) including:
 *     - `revenue_usd`, `costs_usd`, `api_cost_usd`, `hosting_cost_usd`, `payment_fee_usd`, `net_income_usd`,
 *       `hours` (total billable hours), `time_saved_hours`, and `effective_hourly_usd`
 *   - `running_balance`: an array (empty for the fallback)
 *   - `entries`: raw arrays of `time`, `revenue`, and `costs` records used to compute the totals
 */
async function computeFallback(month: string) {
  const cfg = await loadConfig();
  const processingRate = cfg.payment_processing_rate ?? 0.03;
  const timeEntries = await loadTimeEntries(month);
  
  type RevenueRecord = { amount_usd?: number };
  type CostRecord = { provider?: string; cost_usd?: number; type?: string };

  const revenueEntries = await readJson(path.join(revenueDir, `${month}.json`)) as RevenueRecord[];
  const revenueValidation = validateRevenueEntries(revenueEntries);
  if (!revenueValidation.valid) {
    console.warn(`[Schema Validation] Invalid revenue entries for ${month}:`, revenueValidation.errors);
  }

  const apiCosts = await readJson(path.join(costApiDir, `${month}.json`)) as CostRecord[];
  const apiValidation = validateCostEntries(apiCosts, "api");
  if (!apiValidation.valid) {
    console.warn(`[Schema Validation] Invalid API cost entries for ${month}:`, apiValidation.errors);
  }

  const hostingCosts = await readJson(path.join(costHostingDir, `${month}.json`)) as CostRecord[];
  const hostingValidation = validateCostEntries(hostingCosts, "hosting");
  if (!hostingValidation.valid) {
    console.warn(`[Schema Validation] Invalid hosting cost entries for ${month}:`, hostingValidation.errors);
  }

  const costEntries: CostRecord[] = [...apiCosts, ...hostingCosts];

  // Type coercion with null checks
  const totalSeconds = timeEntries.reduce((sum, e) => {
    const val = Number(e?.duration_seconds) || 0;
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
  const totalHours = totalSeconds / 3600;
  const timeSavedSeconds = timeEntries.reduce((sum, e) => {
    const val = Number(e?.time_saved_seconds) || 0;
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const revenueTotal = revenueEntries.reduce((sum: number, e) => {
    const val = Number(e?.amount_usd) || 0;
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
  const apiCostTotal = costEntries
    .filter((e) => e?.provider)
    .reduce((sum: number, e) => {
      const val = Number(e?.cost_usd) || 0;
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  const hostingCostTotal = costEntries
    .filter((e) => e?.type === "hosting")
    .reduce((sum: number, e) => {
      const val = Number(e?.cost_usd) || 0;
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
