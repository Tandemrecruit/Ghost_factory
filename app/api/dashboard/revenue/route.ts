import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { readJsonFile } from "@/lib/json-utils";
import { isAuthorized } from "@/lib/auth-utils";
import { validateRevenueEntries } from "@/lib/schema-validator";
import { validateMonth } from "@/lib/validation-utils";

const root = process.cwd();
const revenueDir = path.join(root, "data", "revenue");

async function readJson(target: string) {
  return readJsonFile(target, []);
}

export async function GET(request: Request) {
  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const url = new URL(request.url);
    const month = validateMonth(url.searchParams.get("month"));
    const entries = await readJson(path.join(revenueDir, `${month}.json`));
    
    // Validate schema
    const validation = validateRevenueEntries(entries);
    if (!validation.valid) {
      console.warn(`[Schema Validation] Invalid revenue entries for ${month}:`, validation.errors);
    }
    
    return NextResponse.json({ month, entries });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

