"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LocationCrumb, CategoryBadge } from "@/components/ui";
import type { Article, IdeaCategory, Location } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  draft: "DRAFT",
  in_review: "IN REVIEW",
  published: "PUBLISHED",
};

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  draft:     { color: "#C8892E", bg: "#FFF3DC" },
  in_review: { color: "#7B5EA7", bg: "#F0EBF8" },
  published: { color: "#2D7A77", bg: "#E8F5F4" },
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = filter ? `?publishStatus=${filter}` : "";
    fetch(`/api/articles${params}`)
      .then((r) => r.json())
      .then((d) => { setArticles(d); setLoading(false); });
  }, [filter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{
        padding: "0 20px", height: 56, display: "flex", alignItems: "center", gap: 12,
        borderBottom: "1px solid #D8CFBF", background: "#EBE5D9", flexShrink: 0,
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>Articles</h1>
        <div style={{ flex: 1 }} />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          style={{ height: 32, fontSize: 12, border: "1px solid #D8CFBF", borderRadius: 6,
            background: "#FDFAF6", padding: "0 8px", color: "#1F1A13" }}>
          <option value="">All</option>
          <option value="draft">Draft</option>
          <option value="in_review">In Review</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
        {loading && <div style={{ color: "#A89C8E" }}>Loading...</div>}
        {!loading && articles.length === 0 && (
          <div style={{ textAlign: "center", color: "#A89C8E", paddingTop: 60, fontSize: 14 }}>
            No articles yet
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 700 }}>
          {articles.map((article) => {
            const sc = STATUS_COLORS[article.publishStatus] ?? STATUS_COLORS.draft;
            return (
              <Link key={article.id} href={`/articles/${article.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "#FDFAF6", border: "1px solid #E5DDD0", borderRadius: 8,
                  padding: "14px 16px", cursor: "pointer",
                  transition: "box-shadow 0.15s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#1F1A13", marginBottom: 6 }}>
                        {article.title}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        {article.location && <LocationCrumb location={article.location as Location} />}
                        {article.idea?.category && (
                          <CategoryBadge category={article.idea.category as IdeaCategory} />
                        )}
                        <span style={{ fontSize: 11, color: "#A89C8E" }}>
                          {new Date(article.updatedAt).toLocaleDateString("en-US")}
                        </span>
                        {article.generationSource === "ai_draft_human_edited" && (
                          <span style={{ fontSize: 10, color: "#C8892E", fontWeight: 700 }}>AI DRAFT</span>
                        )}
                      </div>
                    </div>
                    <span style={{
                      padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
                      color: sc.color, background: sc.bg, flexShrink: 0,
                    }}>
                      {STATUS_LABELS[article.publishStatus]}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
