"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { LocationCrumb, CategoryBadge, CredibilityBadge } from "@/components/ui";
import type { Article, IdeaCategory, Location, Credibility } from "@/lib/types";
import { useApiFetch } from "@/lib/use-api-fetch";

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
  const apiFetch = useApiFetch();
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set("publishStatus", filter);
    if (search) params.set("q", search);
    params.set("page", String(page));
    apiFetch(`/api/articles?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setArticles(d.articles);
        setTotal(d.total);
        setTotalPages(d.totalPages);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, search, page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => { setPage(1); }, [filter, search]);

  useEffect(() => {
    if (!activeId) { setActiveArticle(null); return; }
    apiFetch(`/api/articles/${activeId}`).then((r) => r.json()).then(setActiveArticle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "0 20px", height: 56, display: "flex", alignItems: "center", gap: 12,
        borderBottom: "1px solid #D8CFBF", background: "#EBE5D9", flexShrink: 0,
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>Articles</h1>
        <span style={{
          background: "#C8892E", color: "#fff", fontSize: 11, fontWeight: 700,
          padding: "1px 7px", borderRadius: 99,
        }}>{total}</span>
        <div style={{ flex: 1 }} />

        {/* Search */}
        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#A89C8E" }}
            width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            style={{
              paddingLeft: 28, paddingRight: 10, height: 32, fontSize: 13,
              border: "1px solid #D8CFBF", borderRadius: 6, background: "#FDFAF6",
              outline: "none", width: 200,
            }}
          />
        </div>

        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          style={{ height: 32, fontSize: 12, border: "1px solid #D8CFBF", borderRadius: 6,
            background: "#FDFAF6", padding: "0 8px", color: "#1F1A13" }}>
          <option value="">All</option>
          <option value="draft">Draft</option>
          <option value="in_review">In Review</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* 2-column body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Column 1: Article list */}
        <div style={{ width: 380, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: "1px solid #D8CFBF" }}>
          {/* List */}
          <div style={{ flex: 1, overflow: "auto" }}>
            {loading && <div style={{ padding: 20, color: "#A89C8E", fontSize: 13 }}>Loading...</div>}
            {!loading && articles.length === 0 && (
              <div style={{ padding: 32, textAlign: "center", color: "#A89C8E", fontSize: 13 }}>
                No articles found
              </div>
            )}
            {!loading && articles.map((article) => (
              <ArticleRow
                key={article.id}
                article={article}
                active={article.id === activeId}
                onClick={() => setActiveId(article.id === activeId ? null : article.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              flexShrink: 0, borderTop: "1px solid #D8CFBF", padding: "8px 14px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "#F4EFE6",
            }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                style={{
                  padding: "4px 10px", fontSize: 12, borderRadius: 5, cursor: page <= 1 ? "default" : "pointer",
                  border: "1px solid #D8CFBF", background: page <= 1 ? "transparent" : "#FDFAF6",
                  color: page <= 1 ? "#C0B8AC" : "#1F1A13",
                }}>
                ← Prev
              </button>
              <span style={{ fontSize: 12, color: "#7A6E61" }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                style={{
                  padding: "4px 10px", fontSize: 12, borderRadius: 5, cursor: page >= totalPages ? "default" : "pointer",
                  border: "1px solid #D8CFBF", background: page >= totalPages ? "transparent" : "#FDFAF6",
                  color: page >= totalPages ? "#C0B8AC" : "#1F1A13",
                }}>
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Column 2: Detail / Preview */}
        <div style={{ flex: 1, overflow: "hidden", background: "#FDFAF6", display: "flex", flexDirection: "column" }}>
          {activeArticle ? (
            <ArticleDetail article={activeArticle} />
          ) : (
            <div style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              color: "#A89C8E", fontSize: 14,
            }}>
              Select an article to preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ArticleRow({ article, active, onClick }: { article: Article; active: boolean; onClick: () => void }) {
  const sc = STATUS_COLORS[article.publishStatus] ?? STATUS_COLORS.draft;
  const date = new Date(article.updatedAt).toLocaleDateString("en-US", { day: "numeric", month: "short" });

  return (
    <div
      onClick={onClick}
      style={{
        padding: "12px 16px", borderBottom: "1px solid #E8E0D0", cursor: "pointer",
        background: active ? "#EDE6D8" : "transparent", transition: "background 0.1s",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#F4EFE6"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1F1A13", lineHeight: 1.4, flex: 1 }}>
          {article.title}
        </div>
        <span style={{
          padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: "0.07em",
          color: sc.color, background: sc.bg, flexShrink: 0, whiteSpace: "nowrap",
        }}>
          {STATUS_LABELS[article.publishStatus]}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {article.location && <LocationCrumb location={article.location as Location} />}
        {article.idea?.category && <CategoryBadge category={article.idea.category as IdeaCategory} />}
        <span style={{ fontSize: 11, color: "#A89C8E", marginLeft: "auto" }}>{date}</span>
      </div>
    </div>
  );
}

function ArticleDetail({ article }: { article: Article }) {
  const sc = STATUS_COLORS[article.publishStatus] ?? STATUS_COLORS.draft;
  const ideaArticle = article as Article & {
    idea?: { id: string; title: string; category: string; confirmationCount: number; credibility: string; ideaSources?: { source: { id: string; platform: string; url: string; rawText: string | null; capturedAt: string } }[] };
    _count?: { draftGenerations: number };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
    <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1F1A13", lineHeight: 1.3, flex: 1 }}>
          {article.title}
        </h2>
        <span style={{
          padding: "4px 10px", borderRadius: 5, fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
          color: sc.color, background: sc.bg, flexShrink: 0,
        }}>
          {STATUS_LABELS[article.publishStatus]}
        </span>
      </div>

      {/* Meta */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        {article.location && <LocationCrumb location={article.location as Location} />}
        {ideaArticle.idea?.category && <CategoryBadge category={ideaArticle.idea.category as IdeaCategory} />}
        {ideaArticle.idea?.credibility && (
          <CredibilityBadge credibility={ideaArticle.idea.credibility as Credibility} />
        )}
        <span style={{ fontSize: 11, color: "#A89C8E" }}>
          Updated {new Date(article.updatedAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
        </span>
        {article.generationSource === "ai_draft_human_edited" && (
          <span style={{ fontSize: 10, color: "#C8892E", fontWeight: 700, background: "#FFF3DC",
            padding: "2px 6px", borderRadius: 4 }}>AI DRAFT</span>
        )}
      </div>

      {/* Sources count */}
      {(ideaArticle.idea?.confirmationCount ?? 0) > 0 && (
        <div style={{ fontSize: 12, color: "#A89C8E", marginBottom: 16 }}>
          {ideaArticle.idea!.confirmationCount} linked source{ideaArticle.idea!.confirmationCount !== 1 ? "s" : ""}
        </div>
      )}

      {/* Body preview — fills remaining space */}
      {article.bodyMarkdown && (
        <div style={{
          flex: 1, overflow: "auto",
          background: "#F4EFE6", border: "1px solid #E0D8C8", borderRadius: 6,
          padding: "14px 16px", fontSize: 13, lineHeight: 1.7, color: "#1F1A13",
          whiteSpace: "pre-wrap", marginBottom: 16,
        }}>
          {article.bodyMarkdown}
        </div>
      )}

      {/* Open button */}
      <div style={{ flexShrink: 0 }}>
        <Link href={`/articles/${article.id}`} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
          background: "#C8892E", color: "#fff", textDecoration: "none",
        }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Open Editor
        </Link>
      </div>
    </div>
    </div>
  );
}
