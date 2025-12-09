import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { readJsonFile } from "@/lib/json-utils";
import { isAuthorized } from "@/lib/auth-utils";
import { validateCostEntries } from "@/lib/schema-validator";
import { validateMonth } from "@/lib/validation-utils";

const root = process.cwd();
const costApiDir = path.join(root, "data", "costs", "api");
const costHostingDir = path.join(root, "data", "costs", "hosting");

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
    const apiCosts = await readJson(path.join(costApiDir, `${month}.json`));
    const hostingCosts = await readJson(path.join(costHostingDir, `${month}.json`));
    
    // Validate schemas
    const apiValidation = validateCostEntries(apiCosts, "api");
    if (!apiValidation.valid) {
      console.warn(`[Schema Validation] Invalid API cost entries for ${month}:`, apiValidation.errors);
    }
    
    const hostingValidation = validateCostEntries(hostingCosts, "hosting");
    if (!hostingValidation.valid) {
      console.warn(`[Schema Validation] Invalid hosting cost entries for ${month}:`, hostingValidation.errors);
    }
    
    return NextResponse.json({ month, api: apiCosts, hosting: hostingCosts });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

