"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";

type TimeEntry = {
  timestamp: string;
  activity: string;
  client_id?: string | null;
  duration_seconds: number;
  time_saved_seconds?: number;
};

type StatPayload = {
  month: string;
  totals: {
    revenue_usd: number;
    costs_usd: number;
    api_cost_usd: number;
    hosting_cost_usd: number;
    payment_fee_usd: number;
    net_income_usd: number;
    hours: number;
    time_saved_hours: number;
    effective_hourly_usd: number;
  };
  running_balance: { day: string; balance_usd: number }[];
  entries: {
    time: TimeEntry[];
    revenue: any[];
    costs: any[];
  };
};

const cardClass =
  "rounded-xl border border-border bg-muted/40 p-4 shadow-sm transition hover:shadow-md";

export default function DashboardPage() {
  const [stats, setStats] = useState<StatPayload | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/dashboard/stats", { cache: "no-store" });
        const data = (await res.json()) as StatPayload;
        setStats(data);
        setTimeEntries(data.entries?.time ?? []);
      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const timeByActivity = useMemo(() => {
    const map: Record<string, number> = {};
    timeEntries.forEach((entry) => {
      map[entry.activity] = (map[entry.activity] || 0) + entry.duration_seconds / 3600;
    });
    return Object.entries(map).map(([activity, hours]) => ({ activity, hours: Number(hours.toFixed(2)) }));
  }, [timeEntries]);

  const timeSavedData = useMemo(() => {
    const hours = stats?.totals.hours ?? 0;
    const saved = stats?.totals.time_saved_hours ?? 0;
    return [
      { name: "Actual Hours", value: hours },
      { name: "Time Saved (AI)", value: saved },
    ];
  }, [stats]);

  const revenueSeries = useMemo(() => {
    const rev = stats?.entries?.revenue ?? [];
    return rev.map((r) => ({
      date: r.timestamp?.slice(0, 10) ?? "",
      amount: r.amount_usd ?? 0,
    }));
  }, [stats]);

  const balanceSeries = useMemo(() => {
    if (stats?.running_balance?.length) return stats.running_balance;
    return [];
  }, [stats]);

  const costBreakdown = useMemo(() => {
    if (!stats) return [];
    const totals = stats.totals;
    return [
      { name: "API", value: totals.api_cost_usd },
      { name: "Hosting", value: totals.hosting_cost_usd },
      { name: "Fees", value: totals.payment_fee_usd },
    ];
  }, [stats]);

  const recentTime = useMemo(
    () =>
      [...timeEntries]
        .sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""))
        .slice(0, 8),
    [timeEntries]
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-6 py-10">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background px-6 py-10">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  const totals = stats?.totals ?? {
    revenue_usd: 0,
    costs_usd: 0,
    net_income_usd: 0,
    effective_hourly_usd: 0,
    hours: 0,
    time_saved_hours: 0,
    api_cost_usd: 0,
    hosting_cost_usd: 0,
    payment_fee_usd: 0,
  };

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {stats?.month ? format(new Date(`${stats.month}-01`), "LLLL yyyy") : "This month"}
            </p>
            <h1 className="text-3xl font-bold">Time & Financial Dashboard</h1>
            <p className="text-muted-foreground">
              Track time spent, AI time saved, costs, revenue, and effective hourly rate.
            </p>
          </div>
          <Link href="/" className="btn btn-outline">
            Back to Home
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Revenue" value={`$${totals.revenue_usd.toFixed(2)}`} />
          <StatCard label="Costs" value={`$${totals.costs_usd.toFixed(2)}`} />
          <StatCard label="Net Income" value={`$${totals.net_income_usd.toFixed(2)}`} />
          <StatCard label="Effective Hourly" value={`$${totals.effective_hourly_usd.toFixed(2)}/hr`} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className={cardClass}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Time by Activity</h3>
              <p className="text-sm text-muted-foreground">Hours</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={timeByActivity}>
                  <XAxis dataKey="activity" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip />
                  <Bar dataKey="hours" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={cardClass}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Time Saved vs Actual</h3>
              <p className="text-sm text-muted-foreground">Hours</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={timeSavedData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    <Cell fill="var(--color-primary)" />
                    <Cell fill="var(--color-accent)" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={cardClass}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Revenue Timeline</h3>
              <p className="text-sm text-muted-foreground">Daily</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={revenueSeries}>
                  <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={cardClass}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Running Balance</h3>
              <p className="text-sm text-muted-foreground">Net over time</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={balanceSeries}>
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip />
                  <Line type="monotone" dataKey="balance_usd" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={cardClass}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Cost Breakdown</h3>
              <p className="text-sm text-muted-foreground">By type</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={costBreakdown}>
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--color-secondary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={cardClass}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Time Entries</h3>
              <p className="text-sm text-muted-foreground">Latest 8</p>
            </div>
            <div className="flex flex-col gap-3">
              {recentTime.length === 0 && <p className="text-sm text-muted-foreground">No entries yet.</p>}
              {recentTime.map((entry) => (
                <div key={entry.timestamp + entry.activity} className="rounded-lg border border-border bg-background px-3 py-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{entry.activity}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(entry.timestamp), "MMM d, HH:mm")}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {entry.client_id || "n/a"} · {(entry.duration_seconds / 60).toFixed(1)} min
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={cardClass}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

