"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProject } from "@/lib/project-context";
import { useApiFetch } from "@/lib/use-api-fetch";
import type { Article, Source } from "@/lib/types";

interface DashStats {
  sources: number;
  ideas: number;
  articles: number;
  ideasByStatus: Record<string, number>;
  articlesByStatus: Record<string, number>;
}

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  draft:     { color: "#C8892E", bg: "#FFF3DC" },
  in_review: { color: "#7B5EA7", bg: "#F0EBF8" },
  published: { color: "#2D7A77", bg: "#E8F5F4" },
  idea:      { color: "#A89C8E", bg: "#F4EFE6" },
  confirmed: { color: "#2D7A77", bg: "#E8F5F4" },
  writing:   { color: "#C8892E", bg: "#FFF3DC" },
  done:      { color: "#1F1A13", bg: "#E8E0D0" },
};

const IDEA_STATUS_LABELS: Record<string, string> = {
  idea: "Idea", confirmed: "Confirmed", writing: "Writing", done: "Done",
};
const ARTICLE_STATUS_LABELS: Record<string, string> = {
  draft: "Draft", in_review: "In Review", published: "Published",
};

function StatCard({ label, count, href, accent = false }: {
  label: string; count: number; href: string; accent?: boolean;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        background: accent ? "#C8892E" : "#F4EFE6",
        border: `1px solid ${accent ? "#B87A28" : "#D8CFBF"}`,
        borderRadius: 10,
        padding: "20px 24px",
        display: "flex", flexDirection: "column", gap: 6,
        cursor: "pointer", transition: "box-shadow 0.15s",
      }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
      >
        <span style={{ fontSize: 32, fontWeight: 800, color: accent ? "#fff" : "#1F1A13", lineHeight: 1 }}>
          {count}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: accent ? "rgba(255,255,255,0.75)" : "#7A6E61",
          textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </span>
      </div>
    </Link>
  );
}

function StatusBreakdown({ label, breakdown, labelMap }: {
  label: string;
  breakdown: Record<string, number>;
  labelMap: Record<string, string>;
}) {
  const total = Object.values(breakdown).reduce((s, n) => s + n, 0);
  if (total === 0) return null;

  return (
    <div style={{ background: "#F4EFE6", border: "1px solid #D8CFBF", borderRadius: 10, padding: "16px 20px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#A89C8E", letterSpacing: "0.08em",
        textTransform: "uppercase", marginBottom: 12 }}>
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Object.entries(labelMap).map(([key, displayLabel]) => {
          const count = breakdown[key] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const sc = STATUS_COLORS[key] ?? { color: "#7A6E61", bg: "#E8E0D0" };
          return (
            <div key={key}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#1F1A13", fontWeight: 500 }}>{displayLabel}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
                    color: sc.color, background: sc.bg, padding: "1px 6px", borderRadius: 3,
                  }}>{count}</span>
                  <span style={{ fontSize: 11, color: "#A89C8E", minWidth: 28, textAlign: "right" }}>{pct}%</span>
                </div>
              </div>
              <div style={{ height: 4, background: "#E8E0D0", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: sc.color, borderRadius: 2 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentList({ items, type }: { items: (Article | Source)[]; type: "articles" | "sources" }) {
  if (items.length === 0) return null;

  return (
    <div style={{ background: "#F4EFE6", border: "1px solid #D8CFBF", borderRadius: 10, padding: "16px 20px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#A89C8E", letterSpacing: "0.08em",
        textTransform: "uppercase", marginBottom: 12 }}>
        Recent {type === "articles" ? "Articles" : "Sources"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {items.map((item, i) => {
          if (type === "articles") {
            const a = item as Article;
            const sc = STATUS_COLORS[a.publishStatus] ?? STATUS_COLORS.draft;
            return (
              <Link key={a.id} href={`/articles/${a.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  padding: "10px 0",
                  borderBottom: i < items.length - 1 ? "1px solid #E8E0D0" : "none",
                  display: "flex", alignItems: "center", gap: 10,
                  cursor: "pointer",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <span style={{ flex: 1, fontSize: 13, color: "#1F1A13", fontWeight: 500,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.title}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
                    color: sc.color, background: sc.bg, padding: "2px 6px", borderRadius: 3, flexShrink: 0,
                  }}>
                    {a.publishStatus.toUpperCase().replace("_", " ")}
                  </span>
                  <span style={{ fontSize: 11, color: "#A89C8E", flexShrink: 0 }}>
                    {new Date(a.updatedAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}
                  </span>
                </div>
              </Link>
            );
          } else {
            const s = item as Source;
            return (
              <div key={s.id} style={{
                padding: "10px 0",
                borderBottom: i < items.length - 1 ? "1px solid #E8E0D0" : "none",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: "#7A6E61", background: "#E8E0D0",
                  padding: "2px 6px", borderRadius: 3, flexShrink: 0, textTransform: "uppercase",
                }}>
                  {s.platform}
                </span>
                <span style={{ flex: 1, fontSize: 12, color: "#7A6E61",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {(s as Source & { title?: string | null }).title || s.url}
                </span>
                <span style={{ fontSize: 11, color: "#A89C8E", flexShrink: 0 }}>
                  {new Date(s.capturedAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}
                </span>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const apiFetch = useApiFetch();
  const { projectName } = useProject();
  const [stats, setStats] = useState<DashStats | null>(null);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [recentSources, setRecentSources] = useState<Source[]>([]);

  useEffect(() => {
    apiFetch("/api/dashboard").then((r) => r.json()).then((d) => {
      setStats(d.stats);
      setRecentArticles(d.recentArticles ?? []);
      setRecentSources(d.recentSources ?? []);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1F1A13", margin: 0 }}>{projectName}</h1>
        <p style={{ fontSize: 13, color: "#7A6E61", marginTop: 4 }}>Project Overview</p>
      </div>

      {!stats ? (
        <div style={{ color: "#A89C8E", fontSize: 14 }}>Loading…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 900 }}>
          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <StatCard label="Sources" count={stats.sources} href="/sources" />
            <StatCard label="Ideas" count={stats.ideas} href="/ideas" />
            <StatCard label="Articles" count={stats.articles} href="/articles" accent />
          </div>

          {/* Breakdown + Recent */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <StatusBreakdown label="Ideas by status" breakdown={stats.ideasByStatus} labelMap={IDEA_STATUS_LABELS} />
              <StatusBreakdown label="Articles by status" breakdown={stats.articlesByStatus} labelMap={ARTICLE_STATUS_LABELS} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <RecentList items={recentArticles} type="articles" />
              <RecentList items={recentSources} type="sources" />
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { label: "→ Capture Source", href: "/sources" },
              { label: "→ Review Ideas", href: "/ideas" },
              { label: "→ Write Article", href: "/articles" },
            ].map(({ label, href }) => (
              <Link key={href} href={href} style={{ textDecoration: "none" }}>
                <div style={{
                  padding: "9px 18px", background: "transparent",
                  border: "1px solid #D8CFBF", borderRadius: 7, fontSize: 13,
                  fontWeight: 600, color: "#7A6E61", cursor: "pointer", transition: "all 0.15s",
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#C8892E";
                    e.currentTarget.style.color = "#C8892E";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#D8CFBF";
                    e.currentTarget.style.color = "#7A6E61";
                  }}
                >
                  {label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
