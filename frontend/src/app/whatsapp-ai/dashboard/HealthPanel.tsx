"use client";

import { useEffect, useState, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type Alert = {
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  action?: string;
};

type HealthData = {
  businessId: string;
  checkedAt: string;
  connection: {
    connected: boolean;
    provider: string | null;
    displayPhoneNumber: string | null;
    verifiedName: string | null;
    phoneNumberId: string | null;
    lastTestAt: string | null;
    lastError: string | null;
    tokenLast4: string | null;
  };
  number: {
    qualityRating: "GREEN" | "YELLOW" | "RED" | null;
    previousQualityRating: string | null;
    messagingTier: string | null;
    messagingTierLabel: string;
    messagingTierLimit: number | null;
    nameStatus: string | null;
    codeVerificationStatus: string | null;
    throughputLevel: string | null;
    isOfficialBusinessAccount: boolean;
  };
  webhook: {
    callbackUrl: string;
    lastInboundAt: string | null;
    lastSuccessfulSendAt: string | null;
    last100: {
      total: number;
      sent: number;
      failed: number;
      pending: number;
      successRate: number;
      recentErrors: Array<{
        at: string;
        error: string;
        to: string;
      }>;
    };
  };
  qualityHistory: Array<{
    at: string;
    qualityRating: string | null;
    messagingTier: string | null;
  }>;
  alerts: Alert[];
};

const QUALITY_COLOR: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  GREEN: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", label: "Healthy" },
  YELLOW: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700", label: "At risk" },
  RED: { dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700", label: "Low quality" },
};

const SEVERITY_STYLES: Record<Alert["severity"], string> = {
  info: "border-blue-200 bg-blue-50 text-blue-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  critical: "border-red-200 bg-red-50 text-red-800",
};

function timeAgo(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export default function HealthPanel({ businessId }: { businessId: string }) {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(
        `${API}/v1/whatsapp/health?businessId=${encodeURIComponent(businessId)}`
      );
      const json = await r.json();
      if (!r.ok) throw new Error(json?.error || "Could not load health data");
      setData(json);
    } catch (e: any) {
      setError(e?.message || "Health check failed");
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000); // refresh every minute
    return () => clearInterval(t);
  }, [load]);

  if (!data && loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-gray-500">
        Loading connection health…
      </div>
    );
  }

  if (!data && error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
        <button
          type="button"
          onClick={load}
          className="ml-3 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const q = data.number.qualityRating;
  const qStyle = q ? QUALITY_COLOR[q] : null;
  const last100 = data.webhook.last100;

  return (
    <div className="space-y-5">
      {/* Top summary row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Quality */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Quality rating
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-block h-3 w-3 rounded-full ${
                qStyle?.dot || "bg-gray-300"
              }`}
            />
            <div className="text-2xl font-bold text-[#1d2226]">
              {q || "—"}
            </div>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {qStyle?.label || "Not connected yet"}
          </div>
          {data.number.previousQualityRating &&
            data.number.previousQualityRating !== q && (
              <div className="mt-2 text-xs text-amber-700">
                Was {data.number.previousQualityRating} previously
              </div>
            )}
        </div>

        {/* Messaging tier */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Messaging tier
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1d2226]">
            {data.number.messagingTierLabel}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Unique users you can message in 24h
          </div>
        </div>

        {/* Webhook delivery */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Reply delivery (last 100)
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-bold text-[#1d2226]">
              {last100.successRate}%
            </div>
            <div className="text-xs text-gray-500">
              {last100.sent}/{last100.sent + last100.failed} ok
            </div>
          </div>
          {last100.failed > 0 && (
            <div className="mt-1 text-xs text-red-600">
              {last100.failed} failed
            </div>
          )}
        </div>

        {/* Connection */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Connection
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-block h-3 w-3 rounded-full ${
                data.connection.connected ? "bg-emerald-500" : "bg-gray-300"
              }`}
            />
            <div className="text-sm font-semibold text-[#1d2226]">
              {data.connection.connected ? "Connected" : "Not connected"}
            </div>
          </div>
          <div className="mt-1 truncate text-xs text-gray-500">
            {data.connection.displayPhoneNumber || "No number yet"}
          </div>
          {data.connection.verifiedName && (
            <div className="mt-0.5 truncate text-xs text-gray-400">
              {data.connection.verifiedName}
              {data.number.isOfficialBusinessAccount && (
                <span className="ml-1 text-blue-500">✓ Official</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <div className="space-y-2">
          {data.alerts.map((a, i) => (
            <div
              key={i}
              className={`rounded-xl border p-3 text-sm ${SEVERITY_STYLES[a.severity]}`}
            >
              <div className="font-semibold">{a.title}</div>
              <div className="mt-0.5 opacity-90">{a.message}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quality history sparkline */}
      {data.qualityHistory.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1d2226]">
              Quality trend (last {data.qualityHistory.length} checks)
            </h3>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="text-xs text-emerald-700 hover:underline disabled:opacity-50"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
          <div className="flex items-end gap-1 h-16">
            {[...data.qualityHistory].reverse().map((s, i) => {
              const rank = s.qualityRating
                ? { GREEN: 3, YELLOW: 2, RED: 1 }[s.qualityRating] || 0
                : 0;
              const h = (rank / 3) * 100;
              const bg =
                s.qualityRating === "GREEN"
                  ? "bg-emerald-500"
                  : s.qualityRating === "YELLOW"
                  ? "bg-amber-400"
                  : s.qualityRating === "RED"
                  ? "bg-red-500"
                  : "bg-gray-200";
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-t ${bg}`}
                  style={{ height: `${Math.max(h, 6)}%` }}
                  title={`${new Date(s.at).toLocaleString()}: ${s.qualityRating || "?"}`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Webhook details */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-[#1d2226]">Webhook activity</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <div className="text-xs text-gray-500">Callback URL</div>
            <code className="mt-0.5 block break-all text-xs text-gray-700">
              {data.webhook.callbackUrl}
            </code>
          </div>
          <div>
            <div className="text-xs text-gray-500">Last incoming message</div>
            <div className="mt-0.5">{timeAgo(data.webhook.lastInboundAt)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Last successful reply</div>
            <div className="mt-0.5">
              {timeAgo(data.webhook.lastSuccessfulSendAt)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Pending replies</div>
            <div className="mt-0.5">{last100.pending}</div>
          </div>
        </div>

        {last100.recentErrors.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-600">
              Recent send failures
            </div>
            <div className="space-y-1.5">
              {last100.recentErrors.map((e, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-red-100 bg-red-50/60 p-2 text-xs"
                >
                  <div className="flex items-center justify-between text-red-700">
                    <span>To {e.to}</span>
                    <span className="text-[10px] opacity-70">
                      {timeAgo(e.at)}
                    </span>
                  </div>
                  <div className="mt-1 text-red-800/80">{e.error}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Number meta */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-[#1d2226]">Number details</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
          <Detail label="Phone number ID" value={data.connection.phoneNumberId} />
          <Detail label="Display number" value={data.connection.displayPhoneNumber} />
          <Detail label="Verified name" value={data.connection.verifiedName} />
          <Detail label="Name status" value={data.number.nameStatus} />
          <Detail label="Code verification" value={data.number.codeVerificationStatus} />
          <Detail label="Throughput" value={data.number.throughputLevel} />
          <Detail label="Provider" value={data.connection.provider} />
          <Detail
            label="Last credential test"
            value={
              data.connection.lastTestAt
                ? new Date(data.connection.lastTestAt).toLocaleString()
                : null
            }
          />
        </div>
        <div className="mt-3 text-[11px] text-gray-400">
          Auto-refreshes every minute. Last check{" "}
          {timeAgo(data.checkedAt)}.
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-0.5 break-all text-[#1d2226]">{value || "—"}</div>
    </div>
  );
}
