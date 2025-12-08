import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const costApiDir = path.join(root, "data", "costs", "api");
const costHostingDir = path.join(root, "data", "costs", "hosting");

async function readJson(target: string) {
  try {
    const raw = await fs.readFile(target, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const month = url.searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
  const apiCosts = await readJson(path.join(costApiDir, `${month}.json`));
  const hostingCosts = await readJson(path.join(costHostingDir, `${month}.json`));
  return NextResponse.json({ month, api: apiCosts, hosting: hostingCosts });
}

