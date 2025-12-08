import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

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
  try {
    const raw = await fs.readFile(target, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function loadEntries(month: string) {
  const monthPath = path.join(timeDir, month);
  if (!(await fileExists(monthPath))) return [];
  const files = await fs.readdir(monthPath);
  const entries = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    entries.push(...(await readJson(path.join(monthPath, file))));
  }
  return entries;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const month = url.searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
  const entries = await loadEntries(month);
  return NextResponse.json({ month, entries });
}

