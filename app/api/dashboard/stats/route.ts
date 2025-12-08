import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

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
  try {
    const raw = await fs.readFile(target, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function loadConfig() {
  try {
    const raw = await fs.readFile(configPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function loadTimeEntries(month: string) {
  const monthPath = path.join(timeDir, month);
  const exists = await fileExists(monthPath);
  if (!exists) return [];
  const files = await fs.readdir(monthPath);
  const entries = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    entries.push(...(await readJson(path.join(monthPath, file))));
  }
  return entries;
}

async function computeFallback(month: string) {
  const cfg = await loadConfig();
  const processingRate = cfg.payment_processing_rate ?? 0.03;
  const timeEntries = await loadTimeEntries(month);
  const revenueEntries = await readJson(path.join(revenueDir, `${month}.json`));
  const costEntries = [
    ...(await readJson(path.join(costApiDir, `${month}.json`))),
    ...(await readJson(path.join(costHostingDir, `${month}.json`))),
  ];

  const totalSeconds = timeEntries.reduce((sum, e) => sum + (e.duration_seconds || 0), 0);
  const totalHours = totalSeconds / 3600;
  const timeSavedSeconds = timeEntries.reduce((sum, e) => sum + (e.time_saved_seconds || 0), 0);

  const revenueTotal = revenueEntries.reduce((sum, e) => sum + (e.amount_usd || 0), 0);
  const apiCostTotal = costEntries
    .filter((e) => e.provider)
    .reduce((sum, e) => sum + (e.cost_usd || 0), 0);
  const hostingCostTotal = costEntries
    .filter((e) => e.type === "hosting")
    .reduce((sum, e) => sum + (e.cost_usd || 0), 0);
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
  const url = new URL(request.url);
  const month = url.searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
  const balancePath = path.join(balanceDir, `${month}.json`);

  if (await fileExists(balancePath)) {
    const data = await readJson(balancePath);
    return NextResponse.json(data);
  }

  const data = await computeFallback(month);
  return NextResponse.json(data);
}

