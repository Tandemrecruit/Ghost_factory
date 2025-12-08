import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const revenueDir = path.join(root, "data", "revenue");

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
  const entries = await readJson(path.join(revenueDir, `${month}.json`));
  return NextResponse.json({ month, entries });
}

