import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { readJsonFile } from "@/lib/json-utils";
import { isAuthorized } from "@/lib/auth-utils";
import { validateTimeLogs } from "@/lib/schema-validator";
import { validateMonth } from "@/lib/validation-utils";

const root = process.cwd();
const timeDir = path.join(root, "data", "time_logs");

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

async function loadEntries(month: string) {
  const monthPath = path.join(timeDir, month);
  if (!(await fileExists(monthPath))) return [];
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

export async function GET(request: Request) {
  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const url = new URL(request.url);
    const month = validateMonth(url.searchParams.get("month"));
    const entries = await loadEntries(month);
    return NextResponse.json({ month, entries });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

